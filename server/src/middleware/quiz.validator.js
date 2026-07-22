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

const createQuizRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be 3–255 characters'),

  body('lesson_id')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('lesson_id must be a valid UUID or null'),

  body('pass_percent')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('pass_percent must be a number between 1 and 100')
    .toInt(),

  body('max_attempts')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('max_attempts must be 1-10')
    .toInt(),

  body('questions').isArray({ min: 1 }).withMessage('Quiz must have at least one question'),

  body('questions.*.body').trim().notEmpty().withMessage('Every question must have text'),

  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Every question must have 2-6 options'),

  body('questions.*.options.*.text').trim().notEmpty().withMessage('Every option must have text'),

  body('questions').custom((questions) => {
    questions.forEach((q, i) => {
      const correctCount = q.options.filter((o) => o.is_correct === true).length;
      if (correctCount !== 1) {
        throw new Error(
          `Question ${i + 1} must have exactly one correct option (found ${correctCount})`
        );
      }
    });
    return true;
  }),
  validate,
];

const submitAttemptRules = [
  body('answers')
    .isObject()
    .withMessage('answers must be an object mapping questionId to optionId')
    .custom((answers) => {
      if (Object.keys(answers).length === 0) {
        throw new Error('At least one answer is required');
      }
      return true;
    }),

  validate,
];

export { createQuizRules, submitAttemptRules };
