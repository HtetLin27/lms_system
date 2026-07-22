import { Question, Option, QuizAttempt } from '../models/index.js';

const scoreQuizAttempt = async (quizId, submittedAnswers) => {
  const questions = await Question.findAll({
    where: { quiz_id: quizId },
    include: [{ model: Option, as: 'options' }],
  });

  if (questions.length === 0) {
    throw new Error('Quiz has no questions');
  }

  let correctCount = 0;

  for (const question of questions) {
    const selectedOptionId = submittedAnswers[question.id];

    const correctOption = question.options.find((o) => o.is_correct === true);

    if (selectedOptionId && correctOption && selectedOptionId === correctOption.id) {
      correctCount++;
    }
  }

  const scorePercent = Math.round((correctCount / questions.length) * 100);

  return { scorePercent, totalQuestions: questions.length, correctCount };
};

const getAttemptCount = async (quizId, studentId) => {
  return QuizAttempt.count({
    where: { quiz_id: quizId, student_id: studentId },
  });
};

export { scoreQuizAttempt, getAttemptCount };
