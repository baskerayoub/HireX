"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("applications", "cv_file_path", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("applications", "cv_file_path", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
