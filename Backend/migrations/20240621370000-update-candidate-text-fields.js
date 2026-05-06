'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('candidate', 'summary', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'education', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'technical_skills', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'soft_skills', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'languages', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'hobbies', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'certifications', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'score_description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('candidate', 'summary', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'education', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'technical_skills', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'soft_skills', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'languages', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'hobbies', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'certifications', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('candidate', 'score_description', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}; 