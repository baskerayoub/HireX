"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("job_offers", {
      fields: ["fk_profile"],
      type: "unique",
      name: "unique_fk_profile_job_offers",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      "job_offers",
      "unique_fk_profile_job_offers"
    );
  },
};
