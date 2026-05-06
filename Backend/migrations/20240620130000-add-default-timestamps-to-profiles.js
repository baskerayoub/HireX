"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("profiles", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.changeColumn("profiles", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("profiles", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn("profiles", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },
};
