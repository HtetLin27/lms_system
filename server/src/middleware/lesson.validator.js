import { body, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const CONTENT_TYPES = ['video', 'pdf', 'text'];

const createLessonRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be 3-255 characters'),

  body('content_type')
    .notEmpty()
    .withMessage('content_type is required')
    .isIn(CONTENT_TYPES)
    .withMessage(`content_type must be: ${CONTENT_TYPES.join(', ')}`),

  body('content').custom((value, { req }) => {
    if (req.body.content_type === 'text' && !value?.trim()) {
      throw new Error('content is required for text lessons');
    }
    return true;
  }),

  body('order_index')
    .optional()
    .isInt({ min: 0 })
    .withMessage('order_index must be a non-negative integer')
    .toInt(),

  body('duration_seconds')
    .optional()
    .isInt({ min: 1 })
    .withMessage('duration_seconds must be a positive integer')
    .toInt(),

  body('is_preview')
    .optional()
    .isBoolean()
    .withMessage('is_preview must be true or false')
    .toBoolean(),

  validate,
];

const updateLessonRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be 3–255 characters'),

  body('content').optional().isLength({ max: 50000 }).withMessage('Content too long'),

  body('is_preview')
    .optional()
    .isBoolean()
    .withMessage('is_preview must be true or false')
    .toBoolean(),

  body('duration_seconds').optional().isInt({ min: 1 }).toInt(),

  validate,
];

const reorderLessonsRules = [
  body('lessons').isArray({ min: 1 }).withMessage('lessons must be a non-empty array'),

  body('lessons.*.id').isUUID().withMessage('Each lesson must have a valid UUID id'),

  body('lessons.*.order_index')
    .isInt({ min: 0 })
    .withMessage('Each lesson must have a non-negative order_index')
    .toInt(),

  validate,
];

export { createLessonRules, updateLessonRules, reorderLessonsRules };
