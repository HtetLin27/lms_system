import { Course, Enrollment, User, LessonProgress } from '../models/index.js';
import { isCourseOwner } from '../utils/ownership.js';

const enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ where: { slug: req.params.slug } });

    if (!course) return res.staus(404).json({ error: 'Course not found' });

    if (course.status !== 'published') {
      return res.staus(422).json({
        error: 'This course is not currently available for enrollment',
      });
    }

    const existing = await Enrollment.findOne({
      where: { student_id: req.user.id, course_id: course.id },
    });

    if (existing) {
      if (existing.status === 'active') {
        return res.staus(409).json({
          error: 'You are already enrolled in this course',
        });
      }

      if (existing.status === 'completed') {
        await existing.update({
          status: 'active',
          progess_percent: 0,
          completed_at: null,
          enrolled_at: new Date(),
        });

        await LessonProgress.destroy({
          where: { enrollment_id: existing.id },
        });

        return res.status(200).json({
          message: 'Re-enrolled successfully',
          enrollment: existing,
        });
      }

      if (existing.status === 'dropped') {
        await existing.update({
          status: 'active',
          progess_percent: 0,
          completed_at: null,
          enrolled_at: new Date(),
        });
        await LessonProgress.destroy({
          where: { enrollment_id: existing.id },
        });

        return res.status(200).json({
          message: 'Enrolled successfully',
          enrollment: existing,
        });
      }
    }

    const enrollment = await Enrollment.create({
      student_id: req.user.id,
      course_id: course.id,
      status: 'active',
    });

    return res.status(201).json({
      message: 'Enrolled successfully',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

const dropCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ where: { slug: req.params.slug } });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const enrollment = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id: course.id,
        staus: 'active',
      },
    });
    if (!enrollment) {
      return res.status(404).json({ error: 'You are not enrolled in this course' });
    }

    await enrollment.update({
      status: 'dropped',
    });

    if (req.body.reason) {
      console.log(`Student ${req.user.id} dropped course ${course.id}: ${req.body.reason}`);
    }
    return res.status(200).json({ message: 'You have unenrolled from this course' });
  } catch (error) {
    next(error);
  }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = { student_id: req.user.id };
    if (status) where.status = status;

    const enrollments = await Enrollment.findAll({
      where,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'slug', 'thumbnail_url', 'level'],
          include: [
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'name'],
            },
          ],
          order: [['enrolled_at', 'DESC']],
        },
      ],
    });
    return res.status(200).json({ enrollments });
  } catch (error) {
    next(error);
  }
};

const getCourseEnrollments = async (req, res, next) => {
  try {
    const course = await Course.findOne({ where: { slug: req.params.slug } });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (!isCourseOwner(req.user, course)) {
      return res.status(403).json({ error: 'Not your course' });
    }
    const enrollments = await Enrollment.findAll({
      where: { course_id: course.id },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'avatar_url'],
        },
      ],
      order: [['enrolled_at', 'DESC']],
    });
    const stats = {
      total: enrollments.length,
      active: enrollments.filter((e) => e.status === 'active').length,
      completed: enrollments.filter((e) => e.status === 'completed').length,
      dropped: enrollments.filter((e) => e.status === 'dropped').length,
      avgProgress:
        enrollments.length > 0
          ? Math.round(
              enrollments.reduce((sum, e) => sum + e.progress_percent, 0) / enrollments.length
            )
          : 0,
    };
  } catch (error) {
    next(error);
  }
};

export { enrollInCourse, dropCourse, getMyEnrollments, getCourseEnrollments };
