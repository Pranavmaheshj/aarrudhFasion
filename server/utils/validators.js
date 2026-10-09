const { body, validationResult } = require('express-validator');

// Validation error inspector middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobile')
    .customSanitizer((val, { req }) => {
      const raw = val || req.body.phone || '';
      return String(raw).replace(/\D/g, '').replace(/^91/, '').replace(/^0/, '').slice(-10);
    })
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian mobile number starting with 6-9'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginRules = [
  body('identifier').trim().notEmpty().withMessage('Email or mobile number is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const addressRules = [
  body('name').trim().notEmpty().withMessage('Full name is required for delivery'),
  body('mobile')
    .customSanitizer((val, { req }) => {
      const raw = val || req.body.phone || '';
      return String(raw).replace(/\D/g, '').replace(/^91/, '').replace(/^0/, '').slice(-10);
    })
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid 10-digit mobile number is required (starting with 6-9)'),
  body('pincode').matches(/^[1-9][0-9]{5}$/).withMessage('Valid 6-digit Indian pincode is required'),
  body('house').trim().notEmpty().withMessage('House/Flat/Building details are required'),
  body('area').trim().notEmpty().withMessage('Area/Street/Colony details are required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  addressRules,
};
