import { DataTypes, Model } from 'sequelize';

class Investment extends Model {
  // Calculate profit for a given period
  calculateProfitForPeriod(fromDate, toDate) {
    if (this.status !== 'active' || !this.startDate || !this.endDate) {
      return 0;
    }

    const start = Math.max(this.startDate, fromDate);
    const end = Math.min(this.endDate, toDate);
    
    if (start >= end) return 0;
    
    // Calculate number of days in the period
    const days = (end - start) / (1000 * 60 * 60 * 24);
    
    // Calculate profit based on ROI and duration
    const dailyRoi = this.roi / (this.duration * 100);
    return this.amount * dailyRoi * days;
  }

  // Get investment details
  getDetails() {
    return {
      plan: this.planId,
      amount: this.amount,
      duration: this.duration,
      roi: this.roi,
      totalReturn: this.amount * (1 + this.roi / 100),
      profit: this.amount * (this.roi / 100),
      dailyProfit: (this.amount * (this.roi / 100)) / this.duration,
      weeklyProfit: ((this.amount * (this.roi / 100)) / this.duration) * 7,
      monthlyProfit: ((this.amount * (this.roi / 100)) / 30) * 30, // Approximate
    };
  }

  static initialize(sequelize) {
    const attributes = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        field: 'user_id',
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'investment_plans',
          key: 'id',
        },
        field: 'plan_id',
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      roi: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
        defaultValue: 'pending',
      },
      startDate: {
        type: DataTypes.DATE,
        field: 'start_date',
      },
      endDate: {
        type: DataTypes.DATE,
        field: 'end_date',
      },
      completedAt: {
        type: DataTypes.DATE,
        field: 'completed_at',
      },
      totalEarned: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
        field: 'total_earned',
      },
      lastPayout: {
        type: DataTypes.DATE,
        field: 'last_payout',
      },
    };

    const options = {
      modelName: 'Investment',
      tableName: 'investments',
      timestamps: true,
      underscored: true,
    };

    // Initialize the model
    const initializedModel = super.init(attributes, {
      ...options,
      sequelize,
      modelName: 'Investment',
      tableName: 'investments'
    });
    
    // Store the sequelize instance
    initializedModel.sequelize = sequelize;
    
    console.log('✅ Investment model initialized');
    return initializedModel;
  }

  static associate(models) {
    // Investment belongs to a user
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Investment belongs to an investment plan
    this.belongsTo(models.InvestmentPlan, {
      foreignKey: 'planId',
      as: 'plan'
    });
  }
}

export default Investment;
