'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('candidate', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('candidate', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    });
  }
}; 