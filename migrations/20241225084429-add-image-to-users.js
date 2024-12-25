'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'image', {
      type: Sequelize.STRING,
      allowNull: true, // Allow the field to be nullable, adjust as needed
      defaultValue: null, // Default value can be set if needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'image');
  },
};
