'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('candidate', 'type_importation', {
      type: Sequelize.ENUM('local', 'platforme'),
      allowNull: true,
      comment: "Type d'importation du CV: local ou platforme"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('candidate', 'type_importation');
    // Supprimer le type ENUM si la BDD le supporte (Postgres)
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_candidate_type_importation";');
    }
  }
}; 