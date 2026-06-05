import {body, query, validationResult} from 'express-validator';

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({ msg: error.msg }));
            return res.status(400).json({ errors: errorMessages });
    }
    next();
}

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const VALID_SORTS = ['created_at', 'title', 'level'];

const createCourseRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
    body('level')
        .optional()
        .isIn(LEVELS).withMessage(`Level must be one of: ${LEVELS.join(', ')}`),
    body('category_id')
        .optional()
        .isUUID().withMessage('Category ID must be a valid UUID'),
    body('thumbnail_url')
        .optional()
        .isURL().withMessage('Thumbnail URL must be a valid URL'),
    validate
]

const updateCourseRules = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
    body('level')
        .optional()
        .isIn(LEVELS).withMessage(`Level must be one of: ${LEVELS.join(', ')}`),
    body('category_id')
        .optional({ nullable: true })
        .isUUID().withMessage('Category ID must be a valid UUID'),
    body('thumbnail_url')
        .optional({ nullable: true })
        .isURL().withMessage('Thumbnail URL must be a valid URL'),
    validate
]

const listCoursesRules = [
    query('page')
        .optional().isInt({ min: 1}).toInt(),
    query('limit')
        .optional().isInt({ min: 1, max: 50}).toInt(),
    query('level')
        .optional().isIn(LEVELS),
    query('category')
        .optional().isString(),
    query('search')
        .optional().trim().isLength({max: 100}),
    query('sort')
        .optional().isIn(VALID_SORTS),
    validate  
]


export {
    createCourseRules,
    updateCourseRules,
    listCoursesRules
}
