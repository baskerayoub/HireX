"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Users table
    await queryInterface.changeColumn("users", "createdAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.changeColumn("users", "updatedAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    // Projects table
    await queryInterface.changeColumn("projects", "createdAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.changeColumn("projects", "updatedAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.changeColumn("projects", "is_archived", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    // Profiles table
    await queryInterface.changeColumn("profiles", "createdAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.changeColumn("profiles", "updatedAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    // Job Offers table
    await queryInterface.changeColumn("job_offers", "createdAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.changeColumn("job_offers", "updatedAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    // Job Postings table
    await queryInterface.changeColumn("job_postings", "createdAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.changeColumn("job_postings", "updatedAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the default values (set to null)
    await queryInterface.changeColumn("users", "createdAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: null,
    });
    await queryInterface.changeColumn("users", "updatedAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: null,
    });

    await queryInterface.changeColumn("projects", "createdAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: null,
    });
    await queryInterface.changeColumn("projects", "updatedAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: null,
    });
    await queryInterface.changeColumn("projects", "is_archived", {
      type: Sequelize.BOOLEAN,
      defaultValue: null,
    });

    await queryInterface.changeColumn("profiles", "createdAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: null,
    });
    await queryInterface.changeColumn("profiles", "updatedAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: null,
    });

    await queryInterface.changeColumn("job_offers", "createdAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: null,
    });
    await queryInterface.changeColumn("job_offers", "updatedAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: null,
    });

    await queryInterface.changeColumn("job_postings", "createdAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: null,
    });
    await queryInterface.changeColumn("job_postings", "updatedAt", {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: null,
    });
  },
};
