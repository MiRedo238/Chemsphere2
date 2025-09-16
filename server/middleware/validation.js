const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

// Chemical validation rules
exports.validateChemical = [
  body('name').notEmpty().withMessage('Name is required'),
  body('batch_number').notEmpty().withMessage('Batch number is required'),
  body('initial_quantity').isInt({ min: 1 }).withMessage('Initial quantity must be at least 1'),
  body('current_quantity').isInt({ min: 0 }).withMessage('Current quantity cannot be negative'),
  body('expiration_date').isDate().withMessage('Valid expiration date is required'),
  body('date_of_arrival').isDate().withMessage('Valid arrival date is required'),
  body('safety_class').isIn(['safe', 'toxic', 'corrosive', 'reactive', 'flammable']).withMessage('Invalid safety class'),
  handleValidationErrors
];

// Equipment validation rules
exports.validateEquipment = [
  body('name').notEmpty().withMessage('Name is required'),
  body('serial_id').notEmpty().withMessage('Serial ID is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('status').isIn(['Available', 'Broken', 'Under Maintenance']).withMessage('Invalid status'),
  body('condition').isIn(['Good', 'Needs Repair', 'Broken']).withMessage('Invalid condition'),
  body('purchase_date').isDate().withMessage('Valid purchase date is required'),
  handleValidationErrors
];

// User validation rules
exports.validateUser = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['admin', 'user']).withMessage('Invalid role'),
  handleValidationErrors
];

// Usage log validation rules
exports.validateUsageLog = [
  body('chemical_id').optional().isInt().withMessage('Valid chemical ID is required'),
  body('equipment_id').optional().isInt().withMessage('Valid equipment ID is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('action').optional().notEmpty().withMessage('Action is required'),
  handleValidationErrors
];