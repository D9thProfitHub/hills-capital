import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class User extends Model {
  getSignedJwtToken() {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  getResetPasswordToken() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.reset_password_token = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    this.reset_password_expire = new Date(Date.now() + 10 * 60 * 1000);
    return resetToken;
  }

  generateEmailConfirmToken() {
    const confirmationToken = crypto.randomBytes(20).toString('hex');
    this.confirm_email_token = crypto
      .createHash('sha256')
      .update(confirmationToken)
      .digest('hex');
    const confirmTokenExtend = crypto.randomBytes(100).toString('hex');
    return `${confirmationToken}.${confirmTokenExtend}`;
  }

  // Increment login attempts
  async incrementLoginAttempts() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lock_until && this.lock_until < Date.now()) {
      return this.update({
        login_attempts: 1,
        lock_until: null
      });
    }
    
    const updates = { login_attempts: this.login_attempts + 1 };
    
    // If we have hit max attempts and it's not locked already, lock the account
    if (this.login_attempts + 1 >= 5 && !this.lock_until) {
      updates.lock_until = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    }
    
    return this.update(updates);
  }

  // Reset login attempts
  async resetLoginAttempts() {
    return this.update({
      login_attempts: 0,
      lock_until: null
    });
  }

  // Define associations (without foreign key constraints for MyISAM)
  static associate(models) {
    this.hasMany(models.Investment, {
      foreignKey: 'user_id',
      as: 'investments',
      constraints: false // Disable constraints for MyISAM
    });
    
    this.hasMany(models.Trade, {
      foreignKey: 'user_id',
      as: 'trades',
      constraints: false // Disable constraints for MyISAM
    });
    
    this.hasMany(models.Signal, {
      foreignKey: 'createdBy',
      as: 'signals',
      constraints: false // Disable constraints for MyISAM
    });
    
    this.hasMany(models.Subscription, {
      foreignKey: 'user_id',
      as: 'subscriptions',
      constraints: false // Disable constraints for MyISAM
    });
    
    // User can have many bot requests
    this.hasMany(models.BotRequest, {
      foreignKey: 'user_id',
      as: 'botRequests',
      constraints: false // Disable constraints for MyISAM
    });
    
    // User can approve many bot requests
    this.hasMany(models.BotRequest, {
      foreignKey: 'approved_by',
      as: 'approvedBotRequests',
      constraints: false // Disable constraints for MyISAM
    });
    
    // User has one affiliate record
    this.hasOne(models.Affiliate, {
      foreignKey: 'userId',
      as: 'affiliate',
      constraints: false // Disable constraints for MyISAM
    });
  }

  // Initialize model
  static initialize(sequelize) {
    console.log('🔧 Initializing User model...');
    
    const attributes = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please add a name' },
          len: {
            args: [1, 50],
            msg: 'Name can not be more than 50 characters',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: 'Email already in use',
        },
        validate: {
          isEmail: { msg: 'Please add a valid email' },
          notEmpty: { msg: 'Please add an email' },
        },
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please add a password' },
          len: {
            args: [6],
            msg: 'Password must be at least 6 characters long',
          },
        },
      },
      reset_password_token: DataTypes.STRING,
      reset_password_expire: DataTypes.DATE,
      confirm_email_token: DataTypes.STRING,
      is_email_confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      two_factor_code: DataTypes.STRING,
      two_factor_code_expire: DataTypes.DATE,
      two_factor_enable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      avatar: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      country: DataTypes.STRING,
      postal_code: DataTypes.STRING,
      date_of_birth: DataTypes.DATE,
      balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      total_deposits: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      total_withdrawals: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      total_trades: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      total_profit: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      status: {
        type: DataTypes.ENUM('active', 'suspended', 'banned'),
        defaultValue: 'active',
      },
      last_login: DataTypes.DATE,
      last_ip: DataTypes.STRING,
      login_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lock_until: DataTypes.DATE,
    };

    const options = {
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
      hooks: {
        beforeSave: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    };

    // Initialize the model
    const initializedModel = super.init(attributes, {
      ...options,
      sequelize,
      modelName: 'User',
      tableName: 'users'
    });
    
    // Store the sequelize instance
    initializedModel.sequelize = sequelize;
    
    console.log('✅ User model initialized');
    return initializedModel;
  }
}

export default User;
