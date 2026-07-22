import express from 'express';
import {
  createQuiz,
  getQuiz,
  submitAttempt,
  getMyAttempts,
} from '../controllers/quizzes.controller.js';
import { createQuizRules, submitAttemptRules } from '../middleware/quiz.validator.js';
import { protect, authorise } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', protect, authorise('instructor', 'admin'), createQuizRules, createQuiz);

router.get('/:id', protect, getQuiz);

router.post('/:id/attempts', protect, authorise('student'), submitAttemptRules, submitAttempt);

router.get('/:id/attempts', protect, authorise('student'), getMyAttempts);

export default router;
