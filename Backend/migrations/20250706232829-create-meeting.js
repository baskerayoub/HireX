'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('meeting', {
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
      type: {
        type: Sequelize.STRING
      },
      subject: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      other_participants: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Created', 'Cancelled', 'Failed', 'Updated'),
        allowNull: false
      },
      status_message: {
        type: Sequelize.STRING
      },
      platform: {
        type: Sequelize.STRING
      },
      platform_id_event: {
        type: Sequelize.STRING
      },
      link: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for foreign keys
    await queryInterface.addIndex('meeting', ['fk_candidate']);
    await queryInterface.addIndex('meeting', ['fk_user']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('meeting');
  }
};