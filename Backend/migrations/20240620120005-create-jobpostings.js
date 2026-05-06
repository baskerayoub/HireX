"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("job_postings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fk_JobOffer: {
        type: Sequelize.INTEGER,
        references: { model: "job_offers", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      plateform: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      Status: {
        type: Sequelize.STRING,
      },
      URL: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("job_postings");
  },
};
