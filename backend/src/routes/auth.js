import express from 'express';
import { body } from 'express-validator';
import { sendOTP, verifyOTP, createOrGetUser } from '../services/otp.js';
import { generateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { sendWelcomeEmail } from '../services/email.js';

const router = express.Router();

/**
 * @route POST /api/auth/otp/send
 * @desc Send OTP to email
 */
router.post('/otp/send', [
  body('email').isEmail().normalizeEmail(),
  validate,
], async (req, res) => {
  try {
    const { email } = req.body;
    const result = await sendOTP(email);

    if (result.success) {
      res.json({ success: true, message: 'Code sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Send OTP route error:', error);
    res.status(500).json({ success: false, error: 'Failed to send code' });
  }
});

/**
 * @route POST /api/auth/otp/verify
 * @desc Verify OTP and login
 */
router.post('/otp/verify', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).isNumeric(),
  validate,
], async (req, res) => {
  try {
    const { email, code, fullName } = req.body;

    // Verify OTP
    const verifyResult = await verifyOTP(email, code);
    if (!verifyResult.success) {
      return res.status(400).json({ success: false, error: verifyResult.error });
    }

    // Create or get user
    const userResult = await createOrGetUser(email, fullName);
    if (!userResult.success) {
      return res.status(500).json({ success: false, error: userResult.error });
    }

    // Generate JWT token
    const token = generateToken(userResult.user);

    // Send welcome email for new users
    if (userResult.isNew) {
      await sendWelcomeEmail(email, fullName || email);
    }

    res.json({
      success: true,
      data: {
        user: userResult.user,
        token,
        isNew: userResult.isNew,
      },
    });
  } catch (error) {
    console.error('Verify OTP route error:', error);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

export default router;