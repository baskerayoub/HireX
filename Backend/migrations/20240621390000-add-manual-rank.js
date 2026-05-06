'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('candidate', 'manual_rank', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Position manuelle du candidat dans le classement'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('candidate', 'manual_rank');
  }
}; 