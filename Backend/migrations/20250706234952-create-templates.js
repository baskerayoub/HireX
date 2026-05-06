'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('templates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      format: {
        type: Sequelize.ENUM('word', 'html'),
        allowNull: false
      },
      s3_path: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      creation_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajout d'index pour la clé étrangère
    await queryInterface.addIndex('templates', ['fk_user']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('templates');
  }
};