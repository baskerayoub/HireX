'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('question', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fk_profile: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'profiles',
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
      fk_candidate: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'candidate',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      interview_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false
      },
      comment: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajout d'index pour les clés étrangères
    await queryInterface.addIndex('question', ['fk_profile']);
    await queryInterface.addIndex('question', ['fk_user']);
    await queryInterface.addIndex('question', ['fk_candidate']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('question');
  }
};