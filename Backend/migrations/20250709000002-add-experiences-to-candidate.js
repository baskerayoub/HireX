'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('candidate', 'experiences', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Expériences du candidat, séparées par des virgules'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('candidate', 'experiences');
  }
};
