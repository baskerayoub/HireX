'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Rename createdAt to created_at to match Sequelize default naming
        await queryInterface.renameColumn('feedback', 'createdAt', 'created_at');
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the change
        await queryInterface.renameColumn('feedback', 'created_at', 'createdAt');
    }
};
