'use strict';

export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('categories', [
      {
        id:         'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name:       'Web Development',
        slug:       'web-development',
        created_at: new Date(),
      },
      {
        id:         'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name:       'Data Science',
        slug:       'data-science',
        created_at: new Date(),
      },
      {
        id:         'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name:       'Design',
        slug:       'design',
        created_at: new Date(),
      },
      {
        id:         'dddddddd-dddd-dddd-dddd-dddddddddddd',
        name:       'Business',
        slug:       'business',
        created_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};