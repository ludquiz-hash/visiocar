import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateClaim, validateGarage, validateAuth, validateStripe } from '../middleware/validation.js';
import { ClaimsController, GarageController, AuthController } from '../controllers/index.js';
import Stripe from 'stripe';
import { config } from '../config/index.js';
import { GarageModel } from '../models/index.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
router.get('/auth/me', authenticateToken, AuthController.getMe);
router.patch('/auth/profile', authenticateToken, validateAuth.signup, AuthController.updateProfile);

// Claims routes
router.get('/claims', authenticateToken, ClaimsController.getClaims);
router.post('/claims', authenticateToken, validateClaim.create, ClaimsController.createClaim);
router.get('/claims/:id', authenticateToken, ClaimsController.getClaim);
router.patch('/claims/:id', authenticateToken, validateClaim.update, ClaimsController.updateClaim);
router.delete('/claims/:id', authenticateToken, ClaimsController.deleteClaim);
router.post('/claims/:id/pdf', authenticateToken, ClaimsController.generatePDF);
router.get('/claims/:id/history', authenticateToken, ClaimsController.getClaimHistory);

// Garage routes
router.get('/garage', authenticateToken, GarageController.getGarage);
router.patch('/garage', authenticateToken, validateGarage.update, GarageController.updateGarage);
router.get('/garage/members', authenticateToken, GarageController.getMembers);
router.post('/garage/members', authenticateToken, validateGarage.inviteMember, GarageController.inviteMember);
router.patch('/garage/members/:memberId', authenticateToken, GarageController.updateMember);
router.delete('/garage/members/:memberId', authenticateToken, GarageController.removeMember);
router.get('/garage/usage', authenticateToken, GarageController.getUsage);

// Stripe routes
router.post('/stripe/checkout', authenticateToken, validateStripe.createCheckout, async (req, res, next) => {
  try {
    if (!config.stripe.secretKey) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const stripe = new Stripe(config.stripe.secretKey);
    const { planId, garageId } = req.body;
    const user = req.user;

    // Get or create customer
    const garage = await GarageModel.findById(garageId);
    let customerId = garage?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: garage?.company_name || garage?.name,
        metadata: {
          garage_id: garageId,
          user_id: user.id,
        },
      });
      customerId = customer.id;
      await GarageModel.update(garageId, { stripe_customer_id: customerId });
    }

    // Get price ID
    const priceId = planId === 'starter' 
      ? config.stripe.starterPriceId 
      : config.stripe.businessPriceId;

    if (!priceId) {
      return res.status(500).json({ error: 'Price not configured for this plan' });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.frontendUrl}/billing?success=true`,
      cancel_url: `${config.frontendUrl}/pricing?canceled=true`,
      metadata: {
        garage_id: garageId,
        plan_type: planId,
      },
      subscription_data: {
        metadata: {
          garage_id: garageId,
          plan_type: planId,
        },
      },
    });

    res.json({ success: true, data: { url: session.url, sessionId: session.id } });
  } catch (error) {
    next(error);
  }
});

// Stripe portal
router.post('/stripe/portal', authenticateToken, async (req, res, next) => {
  try {
    if (!config.stripe.secretKey) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const stripe = new Stripe(config.stripe.secretKey);
    const garageId = req.user.profile?.active_garage_id;

    const garage = await GarageModel.findById(garageId);

    if (!garage?.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: garage.stripe_customer_id,
      return_url: `${config.frontendUrl}/billing`,
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook
router.post('/stripe/webhook', async (req, res, next) => {
  try {
    if (!config.stripe.secretKey || !config.stripe.webhookSecret) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const stripe = new Stripe(config.stripe.secretKey);
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
    } catch (err) {
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const garageId = session.metadata.garage_id;
        const planType = session.metadata.plan_type;

        if (garageId) {
          await GarageModel.update(garageId, {
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            is_subscribed: true,
            plan_type: planType || 'starter',
            subscription_status: 'active',
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const garageId = subscription.metadata?.garage_id;

        if (garageId) {
          await GarageModel.update(garageId, {
            subscription_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            is_subscribed: subscription.status === 'active',
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const garageId = subscription.metadata?.garage_id;

        if (garageId) {
          await GarageModel.update(garageId, {
            is_subscribed: false,
            subscription_status: 'canceled',
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Find garage by customer ID
        const garages = await GarageModel.findByOwner(req.user?.id);
        const garage = garages.find(g => g.stripe_customer_id === customerId);

        if (garage) {
          await GarageModel.update(garage.id, {
            is_subscribed: true,
            subscription_status: 'active',
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const garages = await GarageModel.findByOwner(req.user?.id);
        const garage = garages.find(g => g.stripe_customer_id === customerId);

        if (garage) {
          await GarageModel.update(garage.id, {
            subscription_status: 'past_due',
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;