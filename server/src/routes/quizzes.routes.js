import express from 'express';
import {
  createQuiz, getQuiz, submitAttempt, getMyAttempts,
} from '../controllers/quizzes.controller';
import { createQuizRules, submitAttemptRules } from'../middleware/quiz.validator';
import { protect, authorise } from '../middleware/auth.middleware';

const router = express.Router({ mergeParams: true });

router.post('/',
  protect,authorise('instructor','admin'),
  createQuizRules, createQuiz
);

router.get('/:id', protect, getQuiz);

router.post('/:id/attempts',
  protect, authorise('student'),
  submitAttemptRules, submitAttempt
);

router.get('/:id/attempts', protect, authorise('student'), getMyAttempts);


export default router;