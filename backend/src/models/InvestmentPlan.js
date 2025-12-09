import { Model, DataTypes } from 'sequelize';

class InvestmentPlan extends Model {
  static associate(models) {
    InvestmentPlan.hasMany(models.Investment, {
      foreignKey: 'planId',
      as: 'investments',
    });
  }

  static initialize(sequelize) {
    InvestmentPlan.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please add a plan name' },
          len: [1, 100],
        },
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Please add a description' },
          len: [1, 500],
        },
      },
      minAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'min_amount',
        validate: {
          isDecimal: true,
          min: 0,
        },
      },
      maxAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'max_amount',
        validate: {
          isDecimal: true,
          min: 0,
        },
      },
      roi: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: true,
          min: 0,
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Duration in days',
        validate: {
          isInt: true,
          min: 1,
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
      },
      features: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      riskLevel: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Medium',
        field: 'risk_level',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        defaultValue: DataTypes.NOW,
      },
    }, {
      sequelize,
      modelName: 'InvestmentPlan',
      tableName: 'investment_plans',
      timestamps: true,
      underscored: true,
    });
    return InvestmentPlan;
  }
}

export default InvestmentPlan;
