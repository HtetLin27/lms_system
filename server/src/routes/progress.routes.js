

import express from ('express');
import {
  markLessonComplete, unmarkLessonComplete, getCourseProgress,
} from '../controllers/progress.controller';
import { protect, authorise } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect, authorise('student'));

router.post('/lessons/:lessonId/complete',  markLessonComplete);
router.delete('/lessons/:lessonId/complete',munmarkLessonComplete);
router.get('/courses/:slug', getCourseProgress);

export default router;