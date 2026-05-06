'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('candidate', 'experiences', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Expériences du candidat, séparées par des virgules'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('candidate', 'experiences', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Expériences du candidat, séparées par des virgules'
    });
  }
};
