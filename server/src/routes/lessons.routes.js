

import express from ('express');
import {
  listLessons, getLesson,
  createLesson, updateLesson,
  reorderLessons, deleteLesson,
} from('../controllers/lessons.controller');
import { createLessonRules, updateLessonRules, reorderLessonsRules } from('../middleware/lesson.validator');
import { protect, authorise, optionalAuth } from('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.patch('/reorder',
  protect, authorise('instructor', 'admin'),
  reorderLessonsRules,
  reorderLessons
);

// ── List lessons — public (titles only) ───────────────────────────────────
router.get('/', optionalAuth, listLessons);

// ── Get lesson detail — access checked inside controller ──────────────────
router.get('/:id', protect, getLesson);

// ── Create lesson ──────────────────────────────────────────────────────────
router.post('/',
  protect, authorise('instructor', 'admin'),
  createLessonRules,
  createLesson
);

// ── Update lesson ──────────────────────────────────────────────────────────
router.patch('/:id',
  protect, authorise('instructor', 'admin'),
  updateLessonRules,
  updateLesson
);

// ── Delete lesson ──────────────────────────────────────────────────────────
router.delete('/:id',
  protect, authorise('instructor', 'admin'),
  deleteLesson
);

export default router;