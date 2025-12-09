import { DataTypes, Model } from 'sequelize';

class CopyTradingRequest extends Model {
  static initialize(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Trader',
        validate: {
          notEmpty: {
            msg: 'Name is required'
          }
        }
      },
      account_type: {
        type: DataTypes.ENUM('MT4', 'MT5'),
        allowNull: false,
        field: 'account_type',
        defaultValue: 'MT4',
        get() {
          const rawValue = this.getDataValue('account_type');
          return rawValue ? rawValue.toUpperCase() : null;
        },
        set(value) {
          this.setDataValue('account_type', value ? value.toUpperCase() : 'MT4');
        },
        validate: {
          notEmpty: {
            msg: 'Account type is required'
          },
          isIn: {
            args: [['MT4', 'MT5']],
            msg: 'Account type must be either MT4 or MT5'
          }
        }
      },
      broker: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'broker',
        validate: {
          notEmpty: {
            msg: 'Broker name is required'
          }
        }
      },
      server: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'server',
        validate: {
          notEmpty: {
            msg: 'Server is required'
          }
        }
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'login',
        validate: {
          notEmpty: {
            msg: 'Account number/login is required'
          },
          isNumeric: {
            msg: 'Account number must be numeric'
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password',
        validate: {
          notEmpty: {
            msg: 'Password is required'
          }
        }
      },
      capital: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'capital',
        defaultValue: 500.00
      },
      risk_level: {
        type: DataTypes.ENUM('Conservative', 'Moderate', 'Aggressive'),
        allowNull: false,
        field: 'risk_level',
        defaultValue: 'Moderate',
        validate: {
          isIn: {
            args: [['Conservative', 'Moderate', 'Aggressive']],
            msg: 'Risk level must be Conservative, Moderate, or Aggressive'
          }
        }
      },
      max_drawdown: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'max_drawdown',
        defaultValue: 20,
        validate: {
          min: {
            args: [10],
            msg: 'Maximum drawdown must be at least 10%'
          },
          max: {
            args: [30],
            msg: 'Maximum drawdown cannot exceed 30%'
          }
        }
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processing', 'completed'),
        defaultValue: 'pending',
        validate: {
          isIn: {
            args: [['pending', 'approved', 'rejected', 'processing', 'completed']],
            msg: 'Invalid status'
          }
        }
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      max_daily_loss: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'max_daily_loss'
      },
      stop_copy_on_drawdown: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'stop_copy_on_drawdown'
      },
      follow_new_positions: {
        type: DataTypes.BOOLEAN,
        field: 'follow_new_positions',
        defaultValue: true
      },
      assigned_trader: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'assigned_trader',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'approved_by',
        references: {
          model: 'users',
          key: 'id'
        }
      }
    }, {
      sequelize,
      modelName: 'CopyTradingRequest',
      tableName: 'copy_trading_requests',
      timestamps: true,
      underscored: true
    });
  }

  static associate(models) {
    // Define associations
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    this.belongsTo(models.User, {
      foreignKey: 'assigned_trader',
      as: 'trader'
    });
    this.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver'
    });
  }
}

export default CopyTradingRequest;
