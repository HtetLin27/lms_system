'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('questions', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
      },
      quiz_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'quizzes', key: 'id' },
        onDelete:   'CASCADE',
      },
      body: {
        type:      Sequelize.TEXT,
        allowNull: false,
      },
      order_index: {
        type:         Sequelize.INTEGER,
        allowNull:    false,
        defaultValue: 0,
      },
      created_at: {
        type:         Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('questions', ['quiz_id', 'order_index']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('questions');
  },
};