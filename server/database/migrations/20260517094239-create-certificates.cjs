'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('certificates', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
      },
      enrollment_id: {
        type:       Sequelize.UUID,
        unique:     true,
        allowNull:  false,
        references: { model: 'enrollments', key: 'id' },
        onDelete:   'CASCADE',
      },
      file_url: {
        type:      Sequelize.STRING(500),
        allowNull: false,
      },
      verify_code: {
        type:      Sequelize.STRING(100),
        allowNull: false,
        unique:    true,
      },
      issued_at: {
        type:         Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex(
      'certificates',
      ['verify_code'],
      { unique: true }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('certificates');
  },
};