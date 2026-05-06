"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("applications", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      profile_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "profiles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      full_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      birthday: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      reason_for_posting: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cv_file_path: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("applications");
  },
};
