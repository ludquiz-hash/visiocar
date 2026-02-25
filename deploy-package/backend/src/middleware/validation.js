import { body, param, query, validationResult } from 'express-validator';

/**
 * Helper to handle validation errors
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: 'Invalid input data',
      fields: errors.array().reduce((acc, err) => {
        acc[err.path] = err.msg;
        return acc;
      }, {}),
    });
  }
  next();
}

/**
 * Claim validation rules
 */
export const validateClaim = {
  create: [
    body('client_data.name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Client name must be between 2 and 100 characters'),
    body('client_data.email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('vehicle_data.brand')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Brand is required'),
    body('vehicle_data.model')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Model is required'),
    body('vehicle_data.year')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Valid year is required'),
    body('vehicle_data.vin')
      .optional()
      .trim()
      .matches(/^[A-HJ-NPR-Z0-9]{17}$/i)
      .withMessage('VIN must be 17 characters (without I, O, Q)'),
    handleValidationErrors,
  ],
  
  update: [
    param('id').isUUID().withMessage('Valid claim ID is required'),
    body('status')
      .optional()
      .isIn(['draft', 'analyzing', 'review', 'completed', 'archived'])
      .withMessage('Invalid status'),
    handleValidationErrors,
  ],
};

/**
 * Garage validation rules
 */
export const validateGarage = {
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('company_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be between 2 and 100 characters'),
    body('company_email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('company_phone')
      .optional()
      .trim()
      .matches(/^[\+]?[\d\s\-\(\)\.\/]{8,20}$/)
      .withMessage('Valid phone number is required'),
    handleValidationErrors,
  ],
  
  inviteMember: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('role')
      .isIn(['admin', 'staff'])
      .withMessage('Role must be admin or staff'),
    handleValidationErrors,
  ],
};

/**
 * Auth validation rules
 */
export const validateAuth = {
  signup: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('full_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    handleValidationErrors,
  ],
  
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors,
  ],
  
  otp: {
    send: [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
      handleValidationErrors,
    ],
    verify: [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
      body('token')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('Valid 6-digit OTP is required'),
      handleValidationErrors,
    ],
  },
};

/**
 * Stripe validation rules
 */
export const validateStripe = {
  createCheckout: [
    body('planId')
      .isIn(['starter', 'business'])
      .withMessage('Plan must be starter or business'),
    body('garageId')
      .isUUID()
      .withMessage('Valid garage ID is required'),
    handleValidationErrors,
  ],
};