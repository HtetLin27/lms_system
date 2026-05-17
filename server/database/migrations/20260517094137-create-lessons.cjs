'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lessons', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
      },
      course_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'courses', key: 'id' },
        // Why CASCADE: deleting a course deletes all its lessons.
        // A lesson without a course is meaningless orphaned data.
        onDelete:   'CASCADE',
      },
      title: {
        type:      Sequelize.STRING(255),
        allowNull: false,
      },
      content_type: {
        type:      Sequelize.ENUM('video', 'pdf', 'text'),
        allowNull: false,
      },
      file_url: {
        type:      Sequelize.STRING(500),
        allowNull: true,
      },
      content: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      order_index: {
        type:         Sequelize.INTEGER,
        allowNull:    false,
        defaultValue: 0,
      },
      duration_seconds: {
        type:      Sequelize.INTEGER,
        allowNull: true,
      },
      is_preview: {
        type:         Sequelize.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
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

    // Why composite index on course_id + order_index:
    // The most common query is: get all lessons for a course, ordered.
    // SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index
    // This composite index makes that query extremely fast.
    await queryInterface.addIndex('lessons', ['course_id', 'order_index']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lessons');
  },
};