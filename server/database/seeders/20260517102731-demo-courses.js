'use strict';
export default {
  async up(queryInterface) {
    // Insert a sample published course
    await queryInterface.bulkInsert('courses', [
      {
        id:            'cccc1111-1111-1111-1111-111111111111',
        title:         'JavaScript Fundamentals',
        slug:          'javascript-fundamentals',
        description:   'Learn the core concepts of JavaScript from scratch. Perfect for beginners.',
        thumbnail_url: null,
        status:        'published',
        level:         'beginner',
        instructor_id: '22222222-2222-2222-2222-222222222222',
        category_id:   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        created_at:    new Date(),
        updated_at:    new Date(),
      },
      {
        id:            'cccc2222-2222-2222-2222-222222222222',
        title:         'Advanced React Patterns',
        slug:          'advanced-react-patterns',
        description:   'Deep dive into advanced React patterns including compound components and render props.',
        thumbnail_url: null,
        status:        'draft',
        level:         'advanced',
        instructor_id: '22222222-2222-2222-2222-222222222222',
        category_id:   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        created_at:    new Date(),
        updated_at:    new Date(),
      },
    ]);

    // Insert sample lessons for the published course
    await queryInterface.bulkInsert('lessons', [
      {
        id:               'eeee1111-1111-1111-1111-111111111111',
        course_id:        'cccc1111-1111-1111-1111-111111111111',
        title:            'What is JavaScript?',
        content_type:     'text',
        file_url:         null,
        content:          '# What is JavaScript?\n\nJavaScript is a programming language that runs in the browser...',
        order_index:      1,
        duration_seconds: null,
        is_preview:       true,
        created_at:       new Date(),
        updated_at:       new Date(),
      },
      {
        id:               'eeee2222-2222-2222-2222-222222222222',
        course_id:        'cccc1111-1111-1111-1111-111111111111',
        title:            'Variables and Data Types',
        content_type:     'text',
        file_url:         null,
        content:          '# Variables\n\nIn JavaScript, you declare variables with let, const, or var...',
        order_index:      2,
        duration_seconds: null,
        is_preview:       false,
        created_at:       new Date(),
        updated_at:       new Date(),
      },
      {
        id:               'eeee3333-3333-3333-3333-333333333333',
        course_id:        'cccc1111-1111-1111-1111-111111111111',
        title:            'Functions',
        content_type:     'text',
        file_url:         null,
        content:          '# Functions\n\nFunctions are reusable blocks of code...',
        order_index:      3,
        duration_seconds: null,
        is_preview:       false,
        created_at:       new Date(),
        updated_at:       new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('lessons', null, {});
    await queryInterface.bulkDelete('courses', null, {});
  },
};
