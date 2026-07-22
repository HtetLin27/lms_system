'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quizzes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE',
      },
      lesson_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'lessons', key: 'id' },
        onDelete: 'SET NULL',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      pass_percent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 70,
      },
      max_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('quizzes', ['course_id']);
    await queryInterface.addIndex('quizzes', ['lesson_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('quizzes');
  },
};
