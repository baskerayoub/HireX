'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('template_fields', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      placeholder: {
        type: Sequelize.STRING,
        allowNull: false
      },
      system_field: {
        type: Sequelize.STRING,
        allowNull: false
      },
      field_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajout d'index pour la clé étrangère
    await queryInterface.addIndex('template_fields', ['fk_template']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('template_fields');
  }
};