import { DataTypes, Model } from 'sequelize';

class Signal extends Model {
  // Calculate risk-reward ratio
  calculateRiskReward() {
    if (this.type === 'buy') {
      this.riskRewardRatio = (this.takeProfit - this.entryPrice) / (this.entryPrice - this.stopLoss);
    } else {
      this.riskRewardRatio = (this.entryPrice - this.takeProfit) / (this.stopLoss - this.entryPrice);
    }
  }

  static initialize(sequelize) {
    const attributes = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 500],
        },
      },
      pair: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 20],
        },
      },
      type: {
        type: DataTypes.ENUM('buy', 'sell'),
        allowNull: false,
      },
      entryPrice: {
        type: DataTypes.DECIMAL(10, 5),
        allowNull: false,
        field: 'entry_price',
        validate: {
          min: 0,
        },
      },
      stopLoss: {
        type: DataTypes.DECIMAL(10, 5),
        allowNull: false,
        field: 'stop_loss',
        validate: {
          min: 0,
        },
      },
      takeProfit: {
        type: DataTypes.DECIMAL(10, 5),
        allowNull: false,
        field: 'take_profit',
        validate: {
          min: 0,
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'closed'),
        defaultValue: 'pending',
      },
      result: {
        type: DataTypes.ENUM('win', 'loss'),
        allowNull: true,
      },
      pips: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        validate: {
          min: -1000,
          max: 1000,
        },
      },
      riskRewardRatio: {
        type: DataTypes.DECIMAL(5, 2),
        field: 'risk_reward_ratio',
        defaultValue: 1,
      },
    };

    const options = {
      modelName: 'Signal',
      tableName: 'signals',
      timestamps: true,
      underscored: true,
      hooks: {
        beforeSave: (signal) => {
          signal.calculateRiskReward();
        },
      },
    };

    // Initialize the model
    const initializedModel = super.init(attributes, {
      ...options,
      sequelize,
    });

    // Store the sequelize instance
    initializedModel.sequelize = sequelize;

    console.log('✅ Signal model initialized');
    return initializedModel;
  }
}

export default Signal;
