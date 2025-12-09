module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, drop the existing table if it exists
    await queryInterface.dropTable('CopyTradingRequests');

    // Recreate the table with the new schema
    await queryInterface.createTable('CopyTradingRequests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      accountType: {
        type: Sequelize.ENUM('MT4', 'MT5'),
        allowNull: false
      },
      broker: {
        type: Sequelize.STRING,
        allowNull: false
      },
      server: {
        type: Sequelize.STRING,
        allowNull: false
      },
      login: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      riskLevel: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium'
      },
      maxDrawdown: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 20
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'processing', 'completed'),
        defaultValue: 'pending',
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      traderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('CopyTradingRequests', ['userId']);
    await queryInterface.addIndex('CopyTradingRequests', ['status']);
    await queryInterface.addIndex('CopyTradingRequests', ['traderId']);
  },

  down: async (queryInterface, Sequelize) => {
    // This will drop the table if rolling back
    await queryInterface.dropTable('CopyTradingRequests');
  }
};
