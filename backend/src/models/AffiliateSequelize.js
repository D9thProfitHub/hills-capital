import { DataTypes, Model } from 'sequelize';

class Affiliate extends Model {
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
      affiliateCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'affiliate_code'
      },
      tier: {
        type: DataTypes.ENUM('Bronze', 'Silver', 'Gold', 'Platinum'),
        defaultValue: 'Bronze'
      },
      status: {
        type: DataTypes.ENUM('active', 'pending', 'suspended'),
        defaultValue: 'pending'
      },
      totalCommissions: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'total_commissions'
      },
      paidCommissions: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'paid_commissions'
      },
      pendingCommissions: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'pending_commissions'
      },
      totalReferrals: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_referrals'
      },
      activeReferrals: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'active_referrals'
      },
      conversionRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        field: 'conversion_rate'
      },
      lastActivity: {
        type: DataTypes.DATE,
        field: 'last_activity'
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
      }
    }, {
      sequelize,
      modelName: 'Affiliate',
      tableName: 'affiliates',
      timestamps: false,
      underscored: false
    });
  }

  static associate(models) {
    // Define associations (without foreign key constraints for MyISAM)
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      constraints: false // Disable constraints for MyISAM
    });
  }

  // Instance method to generate affiliate link
  getAffiliateLink() {
    return `https://hillscapital.com/ref/${this.affiliateCode}`;
  }

  // Instance method to calculate pending commissions
  calculatePendingCommissions() {
    return this.totalCommissions - this.paidCommissions;
  }
}

export default Affiliate;
