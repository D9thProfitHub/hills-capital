import { DataTypes, Model } from 'sequelize';

class Trade extends Model {
  // Close trade and calculate profit/loss
  async closeTrade(closePrice) {
    if (this.status !== 'open') {
      throw new Error('Only open trades can be closed');
    }

    this.closePrice = closePrice;
    this.status = 'closed';
    this.closedAt = new Date();
    
    // Calculate profit/loss
    if (this.type === 'buy') {
      this.profitLoss = (this.closePrice - this.price) * this.amount;
    } else {
      this.profitLoss = (this.price - this.closePrice) * this.amount;
    }

    // Apply leverage if set
    if (this.leverage) {
      this.profitLoss *= this.leverage;
    }

    await this.save();
    return this;
  }

  // Get trade duration in milliseconds
  get duration() {
    if (!this.closedAt) return null;
    return this.closedAt - this.createdAt;
  }

  // Initialize model
  static initialize(sequelize) {
    console.log('🔧 Initializing Trade model...');
    
    const attributes = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        index: true, // Add index for better performance
        // Remove foreign key constraint for MyISAM compatibility
      },
      investment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        index: true, // Add index for better performance
        // Remove foreign key constraint for MyISAM compatibility
      },
      asset: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please select an asset to trade' },
        },
      },
      type: {
        type: DataTypes.ENUM('buy', 'sell'),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please specify trade type (buy/sell)' },
        },
      },
      amount: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please enter trade amount' },
          min: {
            args: [0.0001],
            msg: 'Amount must be greater than 0',
          },
        },
      },
      price: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please enter trade price' },
          min: {
            args: [0],
            msg: 'Price must be a positive number',
          },
        },
      },
      total: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('open', 'closed', 'cancelled'),
        defaultValue: 'open',
      },
      profitLoss: {
        type: DataTypes.DECIMAL(24, 8),
        defaultValue: 0,
      },
      closePrice: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: true,
      },
      leverage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: {
            args: [1],
            msg: 'Leverage must be at least 1x',
          },
          max: {
            args: [100],
            msg: 'Maximum leverage is 100x',
          },
        },
      },
      stopLoss: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: true,
        validate: {
          min: {
            args: [0],
            msg: 'Stop loss must be a positive number',
          },
        },
      },
      takeProfit: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: true,
        validate: {
          min: {
            args: [0],
            msg: 'Take profit must be a positive number',
          },
        },
      },
      closedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    };

    const options = {
      sequelize,
      modelName: 'Trade',
      tableName: 'trades',
      timestamps: true,
      underscored: true,
      hooks: {
        beforeSave: (trade) => {
          // Auto-calculate total before saving
          if (trade.changed('amount') || trade.changed('price')) {
            trade.total = trade.amount * trade.price;
          }
        },
      },
      indexes: [
        {
          name: 'trades_user_status_idx',
          fields: ['user_id', 'status'],
        },
        {
          name: 'trades_asset_status_idx',
          fields: ['asset', 'status'],
        },
        {
          name: 'trades_created_at_idx',
          fields: ['created_at']
          // Removed order as it was causing issues with MyISAM
        },
      ],
    };

    // Initialize the model
    const initializedModel = super.init(attributes, {
      ...options,
      sequelize,
      modelName: 'Trade',
      tableName: 'trades'
    });
    
    // Store the sequelize instance
    initializedModel.sequelize = sequelize;
    
    console.log('✅ Trade model initialized');
    return initializedModel;
  }

  // Define associations (without foreign key constraints for MyISAM)
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      constraints: false // Disable constraints for MyISAM
    });
    
    this.belongsTo(models.Investment, {
      foreignKey: 'investment_id',
      as: 'investment',
      constraints: false // Disable constraints for MyISAM
    });
  }
}

export default Trade;
