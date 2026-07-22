'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quiz_attempts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      quiz_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'quizzes', key: 'id' },
        onDelete: 'CASCADE',
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      score_percent: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      passed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      answers: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      attempted_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('quiz_attempts', ['quiz_id', 'student_id']);
    await queryInterface.addIndex('quiz_attempts', ['student_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('quiz_attempts');
  },
};
