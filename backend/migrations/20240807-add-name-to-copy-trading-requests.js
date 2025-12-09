const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add name column to copy_trading_requests table
      await queryInterface.addColumn('copy_trading_requests', 'name', {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Trader', // Default value for existing records
        after: 'user_id' // Place the column after user_id
      });
      console.log('Successfully added name column to copy_trading_requests table');
    } catch (error) {
      console.error('Error in adding name column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('copy_trading_requests', 'name');
      console.log('Successfully removed name column from copy_trading_requests table');
    } catch (error) {
      console.error('Error in removing name column:', error);
      throw error;
    }
  }
};
