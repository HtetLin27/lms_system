import express from 'express';
import { listCourses, getMyCourses, getCourse, createCourse, updateCourse, submitForReview, publishCourse, rejectCourse, deleteCourse } from '../controllers/course.controller.js';
import { createCourseRules, updateCourseRules, listCoursesRules } from '../middleware/course.validator';
import { protect, authorise, optionalAuth } from '../middleware/auth.middleware.js';
import {
  enrollInCourse, dropCourse, getCourseEnrollments,
} from '../controllers/enrollments.controller';
import { dropCourseRules } from '../middleware/enrollment.validator';
const router = express.Router();

router.get('/my', protect, authorise('instructor', 'admin'), getMyCourses);

// ── Public routes — optionalAuth for personalisation ───────────────────────

router.get('/', optionalAuth, listCoursesRules, listCourses);
router.get('/:slug', optionalAuth, getCourse);

// ── Instructor routes ───────────────────────────────────────────────────────

router.post('/',
  protect, authorise('instructor', 'admin'),
  createCourseRules, createCourse
);

router.patch('/:slug',
  protect, authorise('instructor', 'admin'),
  updateCourseRules, updateCourse
);

router.patch('/:slug/submit',
  protect, authorise('instructor', 'admin'),
  submitForReview
);

// ── Admin only routes ───────────────────────────────────────────────────────
router.patch('/:slug/publish', protect, authorise('admin'), publishCourse);
router.patch('/:slug/reject',  protect, authorise('admin'), rejectCourse);

// ── Delete — instructor (own draft) or admin (any) ─────────────────────────
router.delete('/:slug',
  protect, authorise('instructor', 'admin'),
  deleteCourse
);

router.post('/:slug/enroll',
  protect, authorise('student'),
  enrollInCourse
);

router.delete('/:slug/enroll',
  protect, authorise('student'),
  dropCourseRules,
  dropCourse
);

router.get('/:slug/enrollments',
  protect, authorise('instructor', 'admin'),
  getCourseEnrollments
);

router.use('/:slug/lessons', require('./lessons.routes'));


export default router;