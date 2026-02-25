import { ClaimModel, GarageModel, ClaimHistoryModel, UserModel } from '../models/index.js';
import { PDFService, StorageService } from '../services/index.js';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Claims Controller
 */
export const ClaimsController = {
  /**
   * Get all claims for user's garage
   */
  async getClaims(req, res, next) {
    try {
      const { status, limit = 100, search } = req.query;
      const garageId = req.user.profile?.active_garage_id;

      if (!garageId) {
        return res.status(400).json({ error: 'No active garage' });
      }

      const options = {
        limit: parseInt(limit),
        orderBy: 'created_at',
        ascending: false,
      };

      if (status) options.status = status;

      let claims;
      if (search) {
        claims = await ClaimModel.search(garageId, search);
      } else {
        claims = await ClaimModel.findByGarage(garageId, options);
      }

      res.json({ success: true, data: claims });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single claim
   */
  async getClaim(req, res, next) {
    try {
      const { id } = req.params;
      const garageId = req.user.profile?.active_garage_id;

      const claim = await ClaimModel.findById(id);

      if (!claim || claim.garage_id !== garageId) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      res.json({ success: true, data: claim });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new claim
   */
  async createClaim(req, res, next) {
    try {
      const garageId = req.user.profile?.active_garage_id;
      const userId = req.user.id;

      if (!garageId) {
        return res.status(400).json({ error: 'No active garage' });
      }

      // Check usage limits
      const garage = await GarageModel.findById(garageId);
      const now = new Date();
      const usage = await GarageModel.getUsageCounter(garageId, now.getFullYear(), now.getMonth() + 1);
      
      const isTrialExpired = !garage.is_subscribed && new Date(garage.trial_ends_at) < new Date();
      const isStarter = garage.is_subscribed && garage.plan_type === 'starter';
      const hasReachedLimit = (usage?.claims_created || 0) >= 15;

      if (isTrialExpired || (isStarter && hasReachedLimit)) {
        return res.status(403).json({ 
          error: 'Usage limit reached',
          details: 'Please upgrade your plan to create more claims'
        });
      }

      const claimData = {
        ...req.body,
        garage_id: garageId,
        created_by: userId,
        status: 'draft',
      };

      const claim = await ClaimModel.create(claimData);

      // Increment usage counter
      await GarageModel.incrementUsageCounter(garageId, now.getFullYear(), now.getMonth() + 1);

      // Log history
      await ClaimHistoryModel.create({
        claim_id: claim.id,
        action: 'claim_created',
        description: 'Dossier créé',
        user_name: req.user.profile?.full_name || req.user.email,
        user_email: req.user.email,
      });

      res.status(201).json({ success: true, data: claim });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update claim
   */
  async updateClaim(req, res, next) {
    try {
      const { id } = req.params;
      const garageId = req.user.profile?.active_garage_id;

      const existingClaim = await ClaimModel.findById(id);

      if (!existingClaim || existingClaim.garage_id !== garageId) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      const claim = await ClaimModel.update(id, req.body);

      // Log history
      await ClaimHistoryModel.create({
        claim_id: claim.id,
        action: 'claim_updated',
        description: 'Dossier modifié',
        user_name: req.user.profile?.full_name || req.user.email,
        user_email: req.user.email,
      });

      res.json({ success: true, data: claim });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete claim
   */
  async deleteClaim(req, res, next) {
    try {
      const { id } = req.params;
      const garageId = req.user.profile?.active_garage_id;

      const existingClaim = await ClaimModel.findById(id);

      if (!existingClaim || existingClaim.garage_id !== garageId) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      // Only allow deleting drafts
      if (existingClaim.status !== 'draft') {
        return res.status(403).json({ error: 'Only draft claims can be deleted' });
      }

      await ClaimModel.delete(id);

      res.json({ success: true, message: 'Claim deleted' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate PDF for claim
   */
  async generatePDF(req, res, next) {
    try {
      const { id } = req.params;
      const garageId = req.user.profile?.active_garage_id;

      const claim = await ClaimModel.findById(id);

      if (!claim || claim.garage_id !== garageId) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      const garage = await GarageModel.findById(garageId);

      // Generate PDF
      const { buffer, filename } = await PDFService.generateClaimPDF(claim, garage);

      // Upload to storage
      const filePath = `pdfs/${garageId}/${id}/${filename}`;
      const pdfUrl = await StorageService.uploadFile('claim-photos', filePath, buffer, 'application/pdf');

      // Update claim with PDF URL
      await ClaimModel.update(id, { 
        pdf_url: pdfUrl, 
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      // Log history
      await ClaimHistoryModel.create({
        claim_id: id,
        action: 'pdf_generated',
        description: 'Rapport PDF généré',
        user_name: req.user.profile?.full_name || req.user.email,
        user_email: req.user.email,
      });

      res.json({ success: true, data: { pdf_url: pdfUrl, filename } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get claim history
   */
  async getClaimHistory(req, res, next) {
    try {
      const { id } = req.params;
      const garageId = req.user.profile?.active_garage_id;

      const claim = await ClaimModel.findById(id);

      if (!claim || claim.garage_id !== garageId) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      const history = await ClaimHistoryModel.findByClaim(id);

      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  },
};

/**
 * Garage Controller
 */
export const GarageController = {
  /**
   * Get current user's garage
   */
  async getGarage(req, res, next) {
    try {
      const garageId = req.user.profile?.active_garage_id;

      if (!garageId) {
        return res.status(400).json({ error: 'No active garage' });
      }

      const garage = await GarageModel.findById(garageId);
      
      if (!garage) {
        return res.status(404).json({ error: 'Garage not found' });
      }

      res.json({ success: true, data: garage });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update garage
   */
  async updateGarage(req, res, next) {
    try {
      const garageId = req.user.profile?.active_garage_id;

      if (!garageId) {
        return res.status(400).json({ error: 'No active garage' });
      }

      const garage = await GarageModel.update(garageId, req.body);

      res.json({ success: true, data: garage });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get garage members
   */
  async getMembers(req, res, next) {
    try {
      const garageId = req.user.profile?.active_garage_id;

      if (!garageId) {
        return res.status(400).json({ error: 'No active garage' });
      }

      const members = await GarageModel.getMembers(garageId);

      res.json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Invite member
   */
  async inviteMember(req, res, next) {
    try {
      const garageId = req.user.profile?.active_garage_id;
      const { email, role = 'staff' } = req.body;

      if (!garageId) {
        return res.status(400).json({ error: 'No active garage' });
      }

      // Check if member already exists
      const members = await GarageModel.getMembers(garageId);
      const existing = members.find(m => m.user_email === email);

      if (existing) {
        return res.status(400).json({ error: 'Member already exists' });
      }

      const member = await GarageModel.addMember({
        garage_id: garageId,
        user_email: email,
        role,
        is_active: true,
      });

      res.status(201).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update member
   */
  async updateMember(req, res, next) {
    try {
      const { memberId } = req.params;
      const { role } = req.body;

      const member = await GarageModel.updateMember(memberId, { role });

      res.json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove member
   */
  async removeMember(req, res, next) {
    try {
      const { memberId } = req.params;

      await GarageModel.updateMember(memberId, { is_active: false });

      res.json({ success: true, message: 'Member removed' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get usage stats
   */
  async getUsage(req, res, next) {
    try {
      const garageId = req.user.profile?.active_garage_id;
      const now = new Date();

      if (!garageId) {
        return res.status(400).json({ error: 'No active garage' });
      }

      const usage = await GarageModel.getUsageCounter(garageId, now.getFullYear(), now.getMonth() + 1);

      res.json({ 
        success: true, 
        data: usage || { garage_id: garageId, year: now.getFullYear(), month: now.getMonth() + 1, claims_created: 0 }
      });
    } catch (error) {
      next(error);
    }
  },
};

/**
 * Auth Controller
 */
export const AuthController = {
  /**
   * Get current user
   */
  async getMe(req, res, next) {
    try {
      const user = req.user;
      const memberships = await UserModel.getGarageMemberships(user.id);

      // Ensure user has an active garage
      let activeGarageId = user.profile?.active_garage_id;

      if (!activeGarageId && memberships.length > 0) {
        activeGarageId = memberships[0].garage_id;
        await UserModel.update(user.id, { active_garage_id: activeGarageId });
      }

      // Create garage if none exists
      if (!activeGarageId) {
        const garage = await GarageModel.create({
          name: `Garage de ${user.email.split('@')[0]}`,
          country: 'BE',
          owner_id: user.id,
          is_active: true,
          is_subscribed: false,
          plan_type: 'starter',
          trial_ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        });

        await GarageModel.addMember({
          garage_id: garage.id,
          user_id: user.id,
          user_email: user.email,
          user_name: user.profile?.full_name || user.email.split('@')[0],
          role: 'owner',
          is_active: true,
        });

        await UserModel.update(user.id, { active_garage_id: garage.id });
        activeGarageId = garage.id;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          full_name: user.profile?.full_name,
          phone: user.profile?.phone,
          avatar_url: user.profile?.avatar_url,
          active_garage_id: activeGarageId,
          memberships,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      const updates = req.body;
      const profile = await UserModel.update(req.user.id, updates);

      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  },
};