import mongoose from 'mongoose';

const TradingBotRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  botType: {
    type: String,
    required: [true, 'Please specify bot type'],
    enum: ['Scalping Bot', 'Swing Bot', 'DCA Bot', 'Grid Bot', 'Arbitrage Bot']
  },
  capital: {
    type: Number,
    required: [true, 'Please specify capital amount'],
    min: [100, 'Minimum capital is $100']
  },
  tradingPair: {
    type: String,
    required: [true, 'Please specify trading pair'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Please specify duration in days'],
    min: [1, 'Minimum duration is 1 day']
  },
  riskLevel: {
    type: String,
    required: [true, 'Please specify risk level'],
    enum: ['Low', 'Medium', 'High']
  },
  expectedROI: {
    type: Number,
    required: [true, 'Please specify expected ROI'],
    min: [0, 'ROI cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'rejected', 'completed'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  activatedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  currentValue: {
    type: Number,
    default: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  settings: {
    stopLoss: Number,
    takeProfit: Number,
    maxTrades: Number,
    tradeAmount: Number
  }
}, {
  timestamps: true
});

// Populate user info
TradingBotRequestSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'userId',
    select: 'firstName lastName email'
  }).populate({
    path: 'approvedBy',
    select: 'firstName lastName'
  });
  
  next();
});

export default mongoose.model('TradingBotRequest', TradingBotRequestSchema);
