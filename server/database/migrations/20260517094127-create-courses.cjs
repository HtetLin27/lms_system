'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courses', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
      },
      title: {
        type:      Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        // Why slug on courses too:
        // /courses/javascript-fundamentals is better than
        // /courses/7f3a9b2c-1234-5678-abcd-ef0123456789
        type:      Sequelize.STRING(255),
        allowNull: false,
        unique:    true,
      },
      description: {
        type:      Sequelize.TEXT,
        allowNull: false,
      },
      thumbnail_url: {
        type:      Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type:         Sequelize.ENUM('draft', 'pending', 'published', 'rejected'),
        allowNull:    false,
        defaultValue: 'draft',
      },
      level: {
        type:         Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        allowNull:    false,
        defaultValue: 'beginner',
      },
      instructor_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        // Why RESTRICT not CASCADE:
        // If you delete an instructor, their courses should NOT be
        // automatically deleted. That would destroy student work.
        // RESTRICT prevents deleting the user if they have courses.
        // You must reassign or delete courses first.
        onDelete:   'RESTRICT',
      },
      category_id: {
        type:       Sequelize.UUID,
        allowNull:  true,
        references: { model: 'categories', key: 'id' },
        // Why SET NULL: if a category is deleted, courses become
        // uncategorised rather than being deleted too.
        onDelete:   'SET NULL',
      },
      created_at: {
        type:         Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type:         Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('courses', ['slug'], { unique: true });
    await queryInterface.addIndex('courses', ['instructor_id']);
    await queryInterface.addIndex('courses', ['status']);
    await queryInterface.addIndex('courses', ['category_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('courses');
  },
};