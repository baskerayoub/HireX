"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("job_offers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fk_profile: {
        type: Sequelize.INTEGER,
        references: { model: "profiles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      description: {
        type: Sequelize.TEXT,
      },
      creationDate: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("job_offers");
  },
};
