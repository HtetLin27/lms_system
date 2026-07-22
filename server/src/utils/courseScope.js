'use strict';

import { Op } from 'sequelize';

const buildCourseScope = (user) => {
  if (!user) return { status: 'published' };

  if (user.role === 'admin') return {};

  if (user.role === 'instructor') {
    return {
      [Op.or]: [{ instructor_id: user.id }, { status: 'published' }],
    };
  }

  return { status: 'published' };
};

const canViewCourse = (user, course) => {
  if (!user) return course.status === 'published';
  if (user.role === 'admin') return true;
  if (user.id === course.instructor_id) return true;
  return course.status === 'published';
};

export { buildCourseScope, canViewCourse };
