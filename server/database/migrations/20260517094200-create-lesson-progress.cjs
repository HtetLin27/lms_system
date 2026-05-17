// database/migrations/XXXXXX-create-lesson-progress.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lesson_progress', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
      },
      enrollment_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'enrollments', key: 'id' },
        onDelete:   'CASCADE',
      },
      lesson_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'lessons', key: 'id' },
        onDelete:   'CASCADE',
      },
      completed_at: {
        type:         Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Why UNIQUE on (enrollment_id, lesson_id):
    // A student can only complete a lesson once per enrollment.
    // Without this, marking a lesson complete twice would create
    // duplicate rows and inflate the progress percentage.
    await queryInterface.addIndex(
      'lesson_progress',
      ['enrollment_id', 'lesson_id'],
      { unique: true, name: 'lesson_progress_enrollment_lesson_unique' }
    );

    await queryInterface.addIndex('lesson_progress', ['enrollment_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lesson_progress');
  },
};