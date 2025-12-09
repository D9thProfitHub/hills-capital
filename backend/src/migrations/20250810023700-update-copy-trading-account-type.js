'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, drop the existing ENUM type to avoid conflicts
    await queryInterface.sequelize.query(
      "ALTER TABLE copy_trading_requests MODIFY COLUMN account_type ENUM('MT4', 'MT5') NOT NULL",
      { raw: true }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the change if needed
    await queryInterface.sequelize.query(
      "ALTER TABLE copy_trading_requests MODIFY COLUMN account_type VARCHAR(255)",
      { raw: true }
    );
  }
};
