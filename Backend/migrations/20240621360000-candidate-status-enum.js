'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Mettre à jour les valeurs invalides
    await queryInterface.sequelize.query(`UPDATE candidate SET status = 'received' WHERE status NOT IN ('received', 'selected', 'validated', 'Declined', 'traited', 'discarded') OR status IS NULL`);
    // 2. Créer le type ENUM
    await queryInterface.sequelize.query(`CREATE TYPE enum_candidate_status AS ENUM ('received', 'selected', 'validated', 'Declined', 'traited', 'discarded')`);
    // 3. Renommer l'ancienne colonne
    await queryInterface.renameColumn('candidate', 'status', 'status_old');
    // 4. Ajouter la nouvelle colonne ENUM
    await queryInterface.addColumn('candidate', 'status', {
      type: 'enum_candidate_status',
      allowNull: false,
      defaultValue: 'received',
    });
    // 5. Copier les valeurs
    await queryInterface.sequelize.query(`UPDATE candidate SET status = status_old::text::enum_candidate_status`);
    // 6. Supprimer l'ancienne colonne
    await queryInterface.removeColumn('candidate', 'status_old');
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Ajouter une colonne temporaire pour restaurer STRING
    await queryInterface.addColumn('candidate', 'status_old', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'received',
    });
    // 2. Copier les valeurs de l'ENUM vers STRING
    await queryInterface.sequelize.query(`UPDATE candidate SET status_old = status::text`);
    // 3. Supprimer la colonne ENUM
    await queryInterface.removeColumn('candidate', 'status');
    // 4. Renommer la colonne temporaire en status
    await queryInterface.renameColumn('candidate', 'status_old', 'status');
    // 5. Supprimer le type ENUM
    await queryInterface.sequelize.query('DROP TYPE enum_candidate_status');
  }
}; 