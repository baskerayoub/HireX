'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contract', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      fk_template: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'templates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      work_mode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_salary: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      position: {
        type: Sequelize.STRING,
        allowNull: false
      },
      contract_s3_path: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      creation_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajout d'index pour les clés étrangères
    await queryInterface.addIndex('contract', ['fk_candidate']);
    await queryInterface.addIndex('contract', ['fk_user']);
    await queryInterface.addIndex('contract', ['fk_template']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contract');
  }
};