'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('enrollments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: {
        // active    = currently studying
        // completed = finished all lessons and passed all quizzes
        // dropped   = student unenrolled
        type: Sequelize.ENUM('active', 'completed', 'dropped'),
        allowNull: false,
        defaultValue: 'active',
      },
      progress_percent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      enrolled_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Why UNIQUE on (student_id, course_id):
    // A student can only enroll in a course once.
    // Without this, a bug could create duplicate enrollment rows.
    // The database enforces uniqueness even if application code has a bug.
    await queryInterface.addIndex('enrollments', ['student_id', 'course_id'], {
      unique: true,
      name: 'enrollments_student_course_unique',
    });

    await queryInterface.addIndex('enrollments', ['student_id']);
    await queryInterface.addIndex('enrollments', ['course_id']);
    await queryInterface.addIndex('enrollments', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('enrollments');
  },
};
