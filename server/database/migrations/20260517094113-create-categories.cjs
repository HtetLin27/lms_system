'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.createTable('categories', { 
      id:{
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name:{
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      slug:{
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      created_at:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
     });

     await queryInterface.addIndex('categories', ['slug'], {unique: true});
     
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.dropTable('categories');
     
  }
};
