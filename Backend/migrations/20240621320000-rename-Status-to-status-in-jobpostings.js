"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("job_postings", "Status", "status");
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("job_postings", "status", "Status");
  },
};
