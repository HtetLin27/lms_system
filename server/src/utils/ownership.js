'use strict';

const isCourseOwner = (user, course) => {
  if (user.role === 'admin') return true;
  return course.instructor_id === user.id;
};

const isEnrollmentOwner = (user, enrollment) => {
  if (user.role === 'admin') return true;
  return enrollment.student_id === user.id;
};

const isEnrolled = async (userId, courseId, Enrollment) => {
  const enrollment = await Enrollment.findOne({
    where: {
      student_id: userId,
      course_id: courseId,
      status: 'active',
    },
  });
  return !!enrollment;
};

const canAccessLesson = async (user, lesson, course, Enrollment) => {
  if (user.role === 'admin') return true;
  if (user.role === 'instructor' && course.instructor_id === user.id) return true;
  if (lesson.is_preview) return true;
  if (user.role === 'student') {
    return isEnrolled(user.id, course.id, Enrollment);
  }

  return false;
};

export { isCourseOwner, isEnrollmentOwner, isEnrolled, canAccessLesson };
