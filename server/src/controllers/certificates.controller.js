import { Certificate, Enrollment, User, Course } from '../models/index.js';

const verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({
      where: { verify_code: req.params.verifyCode.toUpperCase() },
      include: [
        {
          model: Enrollment,
          as: 'enrollment',
          include: [
            { model: User, as: 'student', attributes: ['id', 'name'] },
            { model: Course, as: 'course', attributes: ['id', 'title', 'slug'] },
          ],
        },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        error: 'Certificate not found. This code is invalid.',
      });
    }

    return res.status(200).json({
      valid: true,
      studentName: certificate.enrollment.student.name,
      courseTitle: certificate.enrollment.course.title,
      issuedAt: certificate.issued_at,
      verifyCode: certificate.verify_code,
    });
  } catch (err) {
    next(err);
  }
};

const getMyCertificate = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: {
        id: req.params.enrollmentId,
        student_id: req.user.id,
        status: 'completed',
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        error: 'No completed enrollment found',
      });
    }

    const certificate = await Certificate.findOne({
      where: { enrollment_id: enrollment.id },
    });

    if (!certificate) {
      return res.status(404).json({
        error: 'Certificate not yet generated. Please try again in a moment.',
      });
    }

    return res.status(200).json({ certificate });
  } catch (err) {
    next(err);
  }
};

const getAllMyCertificates = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'completed' },
      include: [
        {
          model: Certificate,
          as: 'certificate',
          required: true,
        },
      ],
      include: [
        {
          model: Certificate,
          as: 'certificate',
          required: true,
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'slug', 'thumbnail_url'],
        },
      ],
    });

    const certificates = enrollments.map((e) => ({
      ...e.certificate.toJSON(),
      course: e.course,
    }));

    return res.status(200).json({ certificates });
  } catch (err) {
    next(err);
  }
};

export { verifyCertificate, getMyCertificate, getAllMyCertificates };
