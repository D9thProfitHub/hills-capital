'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      nowpayment_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('deposit', 'investment', 'subscription'),
        allowNull: false,
        defaultValue: 'deposit'
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'USD'
      },
      pay_currency: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      pay_amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true
      },
      pay_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('waiting', 'confirming', 'confirmed', 'sending', 'partially_paid', 'finished', 'failed', 'refunded', 'expired'),
        allowNull: false,
        defaultValue: 'waiting'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      related_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Related investment ID, subscription ID, etc.'
      },
      actually_paid: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true
      },
      network_fee: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true
      },
      tx_hash: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ipn_callback_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completed_at: {
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
    await queryInterface.addIndex('payments', ['user_id']);
    await queryInterface.addIndex('payments', ['order_id'], { unique: true });
    await queryInterface.addIndex('payments', ['nowpayment_id']);
    await queryInterface.addIndex('payments', ['status']);
    await queryInterface.addIndex('payments', ['type']);
    await queryInterface.addIndex('payments', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};
