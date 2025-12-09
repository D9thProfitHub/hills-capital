import { DataTypes, Model } from 'sequelize';

class Payment extends Model {
  static initialize(sequelize) {
    return Payment.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'order_id'
      },
      nowPaymentId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'nowpayment_id'
      },
      type: {
        type: DataTypes.ENUM('deposit', 'investment', 'subscription'),
        allowNull: false,
        defaultValue: 'deposit'
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'USD'
      },
      payCurrency: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'pay_currency'
      },
      payAmount: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
        field: 'pay_amount'
      },
      payAddress: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'pay_address'
      },
      status: {
        type: DataTypes.ENUM('waiting', 'confirming', 'confirmed', 'sending', 'partially_paid', 'finished', 'failed', 'refunded', 'expired'),
        allowNull: false,
        defaultValue: 'waiting'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      relatedId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'related_id',
        comment: 'Related investment ID, subscription ID, etc.'
      },
      actuallyPaid: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
        field: 'actually_paid'
      },
      networkFee: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
        field: 'network_fee'
      },
      txHash: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'tx_hash'
      },
      ipnCallbackData: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'ipn_callback_data'
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'expires_at'
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completed_at'
      }
    }, {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['user_id']
        },
        {
          fields: ['order_id'],
          unique: true
        },
        {
          fields: ['nowpayment_id']
        },
        {
          fields: ['status']
        },
        {
          fields: ['type']
        }
      ]
    });
  }

  static associate(models) {
    // Define associations
    Payment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Optional associations based on type
    Payment.belongsTo(models.Investment, {
      foreignKey: 'relatedId',
      as: 'investment',
      constraints: false,
      scope: {
        type: 'investment'
      }
    });
  }

  // Instance methods
  isCompleted() {
    return ['finished', 'confirmed'].includes(this.status);
  }

  isPending() {
    return ['waiting', 'confirming', 'sending'].includes(this.status);
  }

  isFailed() {
    return ['failed', 'expired', 'refunded'].includes(this.status);
  }

  getStatusDisplay() {
    const statusMap = {
      'waiting': 'Waiting for Payment',
      'confirming': 'Confirming Payment',
      'confirmed': 'Payment Confirmed',
      'sending': 'Processing',
      'partially_paid': 'Partially Paid',
      'finished': 'Completed',
      'failed': 'Failed',
      'refunded': 'Refunded',
      'expired': 'Expired'
    };
    
    return statusMap[this.status] || this.status;
  }

  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `HC-${this.type.toUpperCase()}-${timestamp}-${random}`;
  }
}

export default Payment;
