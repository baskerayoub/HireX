'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('candidate', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      cv_s3_path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      summary: {
        type: Sequelize.STRING,
        allowNull: true
      },
      creation_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      education: {
        type: Sequelize.STRING,
        allowNull: true
      },
      years_of_experience: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      technical_skills: {
        type: Sequelize.STRING,
        allowNull: true
      },
      soft_skills: {
        type: Sequelize.STRING,
        allowNull: true
      },
      languages: {
        type: Sequelize.STRING,
        allowNull: true
      },
      hobbies: {
        type: Sequelize.STRING,
        allowNull: true
      },
      certifications: {
        type: Sequelize.STRING,
        allowNull: true
      },
      current_position: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'received',
        validate: {
          isIn: [['received', 'selected', 'validated', 'Declined']]
        }
      },
      score_value: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      score_description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajout des index
    await queryInterface.addIndex('candidate', ['fk_profile'], {
      name: 'candidate_fk_profile_idx'
    });

    await queryInterface.addIndex('candidate', ['status'], {
      name: 'candidate_status_idx'
    });

    await queryInterface.addIndex('candidate', ['email'], {
      name: 'candidate_email_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Suppression des index
    await queryInterface.removeIndex('candidate', 'candidate_fk_profile_idx');
    await queryInterface.removeIndex('candidate', 'candidate_status_idx');
    await queryInterface.removeIndex('candidate', 'candidate_email_idx');

    // Suppression de la table
    await queryInterface.dropTable('candidate');
  }
}; 