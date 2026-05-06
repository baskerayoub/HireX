"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("profiles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      location: {
        type: Sequelize.STRING,
      },
      yearsOfExperience: {
        type: Sequelize.INTEGER,
      },
      typeContract: {
        type: Sequelize.STRING,
      },
      mainMissions: {
        type: Sequelize.TEXT,
      },
      education: {
        type: Sequelize.STRING,
      },
      startDate: {
        type: Sequelize.DATE,
      },
      technicalSkills: {
        type: Sequelize.STRING,
      },
      softSkills: {
        type: Sequelize.STRING,
      },
      languages: {
        type: Sequelize.STRING,
      },
      fk_project: {
        type: Sequelize.INTEGER,
        references: { model: "projects", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("profiles");
  },
};
