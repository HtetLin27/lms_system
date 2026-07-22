import { Lesson, LessonProgress, Enrollment, Quiz, QuizAttempt } from '../models/index.js';

const recalculateProgress = async (enrollmentId) => {
  const enrollment = await Enrollment.findByPk(enrollmentId);
  if (!enrollment) throw new Error('Enrollment not found');

  const totalLessons = await Lesson.count({
    where: { course_id: enrollment.course_id },
  });

  if (totalLessons === 0) {
    return enrollment;
  }

  const completedLessons = await LessonProgress.count({
    where: { enrollment_id: enrollmentId },
  });

  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  const finalQuiz = await Quiz.findOne({
    where: { course_id: enrollment.course_id, lesson_id: null },
  });

  let quizPassed = true;
  if (finalQuiz) {
    const passedAttempt = await QuizAttempt.findOne({
      where: {
        quiz_id: finalQuiz.id,
        student_id: enrollment.student_id,
        passed: true,
      },
    });
    quizPassed = !!passedAttempt;
  }

  const isComplete = progressPercent === 100 && quizPassed;

  const wasAlreadyComplete = enrollment.status === 'completed';

  await enrollment.update({
    progress_percent: progressPercent,
    status: isComplete ? 'completed' : enrollment.status,
    completed_at: isComplete && !wasAlreadyComplete ? new Date() : enrollment.completed_at,
  });

  const justCompleted = isComplete && !wasAlreadyComplete;

  return { enrollment, justCompleted };
};

export { recalculateProgress };
export default recalculateProgress;
