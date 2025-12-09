import { DataTypes, Model } from 'sequelize';

class BotRequest extends Model {
  static initialize(sequelize) {
    const attributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  botType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Crypto Arbitrage', 'Forex EA', 'Grid Trading Bot', 'DCA Bot', 'Market Making Bot']]
    }
  },
  capital: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 100
    }
  },
  tradingPair: {
    type: DataTypes.STRING,
    allowNull: false
  },
  riskLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  duration: {
    type: DataTypes.STRING,
    defaultValue: '30'
  },
  strategy: {
    type: DataTypes.STRING,
    defaultValue: 'scalping'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active', 'completed'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
    };
    
    const options = {
      modelName: 'BotRequest',
      tableName: 'bot_requests',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['user_id']
        },
        {
          fields: ['status']
        },
        {
          fields: ['created_at']
        }
      ]
    };
    
    // Initialize the model
    const initializedModel = super.init(attributes, {
      ...options,
      sequelize,
      modelName: 'BotRequest',
      tableName: 'bot_requests'
    });
    
    console.log('✅ BotRequest model initialized');
    return initializedModel;
  }

  // Define associations (without foreign key constraints for MyISAM)
  static associate(models) {
    // Bot request belongs to a user
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      constraints: false // Disable constraints for MyISAM
    });
    
    // Bot request can be approved by an admin user
    this.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver',
      constraints: false // Disable constraints for MyISAM
    });
  }
}

export default BotRequest;
