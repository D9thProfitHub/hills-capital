import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Import all models
import User from './User.js';
import Investment from './Investment.js';
import Signal from './Signal.js';
import InvestmentPlan from './InvestmentPlan.js';
import Trade from './Trade.js';
import CopyTradingRequest from './CopyTradingRequest.js';
import Affiliate from './AffiliateSequelize.js';
import Subscription from './Subscription.js';
import SubscriptionPlan from './SubscriptionPlan.js';
import BotRequest from './BotRequest.js';
import Payment from './Payment.js';
// EducationContent and UserEducationProgress are now defined inline below

// Correctly configure dotenv to find the .env file in the backend root
// This assumes the server is started from the 'backend' directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const db = {};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log queries in dev
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Initialize models
db.User = User.initialize(sequelize);
db.Investment = Investment.initialize(sequelize);
db.Signal = Signal.initialize(sequelize);
db.InvestmentPlan = InvestmentPlan.initialize(sequelize);
db.Trade = Trade.initialize(sequelize);
db.CopyTradingRequest = CopyTradingRequest.initialize(sequelize);
db.Affiliate = Affiliate.initialize(sequelize);
db.Subscription = Subscription.initialize(sequelize);
db.SubscriptionPlan = SubscriptionPlan.initialize(sequelize);
db.BotRequest = BotRequest.initialize(sequelize);
db.Payment = Payment.initialize(sequelize);
// Initialize EducationContent with the local sequelize instance
db.EducationContent = sequelize.define('EducationContent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'title'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'description'
  },
  type: {
    type: DataTypes.ENUM('course', 'webinar', 'article', 'quiz'),
    allowNull: false,
    defaultValue: 'course',
    field: 'type'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_published'
  }
}, {
  tableName: 'education_content',
  timestamps: true,
  underscored: true
});

// Initialize UserEducationProgress with the local sequelize instance
db.UserEducationProgress = sequelize.define('UserEducationProgress', {
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
  educationContentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'education_content_id'
  },
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'progress'
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_completed'
  }
}, {
  tableName: 'user_education_progress',
  timestamps: true,
  underscored: true
});

// Setup associations
Object.values(db).forEach(model => {
  if (model && model.associate) {
    model.associate(db);
  }
});

export default db;
