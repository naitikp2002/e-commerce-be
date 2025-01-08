'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'stripe_customer_id', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      after: 'email', // Adjust the position in the table if necessary
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'stripe_customer_id');
  },
};
