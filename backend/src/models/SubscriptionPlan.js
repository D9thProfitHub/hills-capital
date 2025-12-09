import { DataTypes, Model } from 'sequelize';

class SubscriptionPlan extends Model {
  static initialize(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      billingCycle: {
        type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
        allowNull: false,
        defaultValue: 'monthly'
      },
      features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      maxSignals: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      hasBotAccess: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      hasCopyTrading: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      supportLevel: {
        type: DataTypes.ENUM('basic', 'priority', 'vip'),
        allowNull: false,
        defaultValue: 'basic'
      }
    }, {
      sequelize,
      modelName: 'SubscriptionPlan',
      tableName: 'subscription_plans',
      timestamps: true,
      underscored: true
    });
  }

  static associate(models) {
    this.hasMany(models.Subscription, {
      foreignKey: 'plan_id',
      as: 'subscriptions'
    });
  }
}

export default SubscriptionPlan;
