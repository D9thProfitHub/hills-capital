import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  // First, drop the existing table if it exists (be careful with this in production)
  await queryInterface.dropTable('CopyTradingRequests');

  // Recreate the table with the new schema
  await queryInterface.createTable('CopyTradingRequests', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountType: {
      type: DataTypes.ENUM('MT4', 'MT5'),
      allowNull: false
    },
    broker: {
      type: DataTypes.STRING,
      allowNull: false
    },
    server: {
      type: DataTypes.STRING,
      allowNull: false
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium'
    },
    maxDrawdown: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 10,
        max: 30
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processing', 'completed'),
      defaultValue: 'pending'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });
};

export const down = async (queryInterface, Sequelize) => {
  // This is a destructive migration - in a real app, you'd want to back up data first
  await queryInterface.dropTable('CopyTradingRequests');
};
