'use strict';

import bcrypt from 'bcryptjs';

export default {
  async up(queryInterface) {
    const hash = await bcrypt.hash('Password1', 10);

    await queryInterface.bulkInsert('users', [
      {
        id:            '11111111-1111-1111-1111-111111111111',
        name:          'Admin User',
        email:         'admin@lms.dev',
        password_hash: hash,
        role:          'admin',
        bio:           'Platform administrator.',
        avatar_url:    null,
        created_at:    new Date(),
        updated_at:    new Date(),
      },
      {
        id:            '22222222-2222-2222-2222-222222222222',
        name:          'Sarah Chen',
        email:         'instructor@lms.dev',
        password_hash: hash,
        role:          'instructor',
        bio:           'Senior software engineer with 10 years experience teaching web development.',
        avatar_url:    null,
        created_at:    new Date(),
        updated_at:    new Date(),
      },
      {
        id:            '33333333-3333-3333-3333-333333333333',
        name:          'Alex Kim',
        email:         'student@lms.dev',
        password_hash: hash,
        role:          'student',
        bio:           null,
        avatar_url:    null,
        created_at:    new Date(),
        updated_at:    new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};