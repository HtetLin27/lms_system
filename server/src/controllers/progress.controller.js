import { Lesson, Course, Enrollment, LessonProgress } from '../models/index';
import { recalculateProgress } from '../services/progress.service';

const markLessonComplete = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const enrollment = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id:  lesson.course_id,
        status:     'active',
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        error: 'You must be actively enrolled in this course to track progress',
      });
    }

    const existing = await LessonProgress.findOne({
      where: { enrollment_id: enrollment.id, lesson_id: lesson.id },
    });

    if (existing) {
      return res.status(200).json({
        message:    'Lesson already marked complete',
        enrollment,
      });
    }

    await LessonProgress.create({
      enrollment_id: enrollment.id,
      lesson_id:      lesson.id,
    });

    const { enrollment: updated, justCompleted } =
      await recalculateProgress(enrollment.id);

    if (justCompleted) {
      console.log(`🎉 Student ${req.user.id} completed course ${lesson.course_id}`);
    }

    return res.status(200).json({
      message:        'Lesson marked complete',
      enrollment:     updated,
      courseComplete: justCompleted,
    });

  } catch (err) { next(err); }
};

const unmarkLessonComplete = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const enrollment = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id:  lesson.course_id,
        status:     'active',
      },
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'No active enrollment found' });
    }

    const deleted = await LessonProgress.destroy({
      where: { enrollment_id: enrollment.id, lesson_id: lesson.id },
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Lesson was not marked complete' });
    }

    const { enrollment: updated } = await recalculateProgress(enrollment.id);

    if (updated.status === 'completed' && updated.progress_percent < 100) {
      await updated.update({ status: 'active', completed_at: null });
    }

    return res.status(200).json({
      message:    'Lesson unmarked',
      enrollment: updated,
    });

  } catch (err) { next(err); }
};

const getCourseProgress = async (req, res, next) => {
  try {
    const course = await Course.findOne({ where: { slug: req.params.slug } });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const enrollment = await Enrollment.findOne({
      where: { student_id: req.user.id, course_id: course.id },
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'You are not enrolled in this course' });
    }

    const lessons = await Lesson.findAll({
      where:      { course_id: course.id },
      order:      [['order_index', 'ASC']],
      attributes: ['id', 'title', 'content_type', 'order_index', 'duration_seconds'],
    });

    const completedRows = await LessonProgress.findAll({
      where:      { enrollment_id: enrollment.id },
      attributes: ['lesson_id', 'completed_at'],
    });
    const completedMap = new Map(
      completedRows.map(row => [row.lesson_id, row.completed_at])
    );

    const lessonsWithStatus = lessons.map(lesson => ({
      ...lesson.toJSON(),
      completed:    completedMap.has(lesson.id),
      completedAt:  completedMap.get(lesson.id) || null,
    }));

    return res.status(200).json({
      enrollment: {
        status:           enrollment.status,
        progressPercent:  enrollment.progress_percent,
        enrolledAt:       enrollment.enrolled_at,
        completedAt:      enrollment.completed_at,
      },
      lessons: lessonsWithStatus,
    });

  } catch (err) { next(err); }
};

export { markLessonComplete, unmarkLessonComplete, getCourseProgress };