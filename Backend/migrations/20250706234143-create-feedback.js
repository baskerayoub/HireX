'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('feedback', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fk_meeting: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'meeting',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fk_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      comments: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajout d'index pour les clés étrangères
    await queryInterface.addIndex('feedback', ['fk_meeting']);
    await queryInterface.addIndex('feedback', ['fk_user']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('feedback');
  }
};