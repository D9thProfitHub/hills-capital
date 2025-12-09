import { DataTypes, Model } from 'sequelize';

class Subscription extends Model {
  static initialize(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'plan_id'
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'start_date'
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'end_date'
      },
      nextBillingDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'next_billing_date'
      },
      status: {
        type: DataTypes.ENUM('active', 'expired', 'cancelled', 'canceled', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
      },
      autoRenew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'auto_renew'
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD'
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'payment_method'
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'transaction_id'
      }
    }, {
      sequelize,
      modelName: 'Subscription',
      tableName: 'subscriptions',
      timestamps: true,
      underscored: true
    });
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    this.belongsTo(models.SubscriptionPlan, {
      foreignKey: 'plan_id',
      as: 'plan'
    });
  }
}

export default Subscription;
