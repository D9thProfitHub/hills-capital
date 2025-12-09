'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        defaultValue: 'user'
      },
      reset_password_token: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reset_password_expire: {
        type: Sequelize.DATE,
        allowNull: true
      },
      confirm_email_token: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_email_confirmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      two_factor_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      two_factor_code_expire: {
        type: Sequelize.DATE,
        allowNull: true
      },
      two_factor_enable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true
      },
      postal_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      balance: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      total_deposits: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      total_withdrawals: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      total_trades: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_profit: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('active', 'suspended', 'banned'),
        defaultValue: 'active'
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_ip: {
        type: Sequelize.STRING,
        allowNull: true
      },
      login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lock_until: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['reset_password_token']);
    await queryInterface.addIndex('users', ['confirm_email_token']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
