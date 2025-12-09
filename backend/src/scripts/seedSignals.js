import db from '../models/index.js';

const { Signal } = db;

const sampleSignals = [
  {
    title: 'EUR/USD Long Position',
    description: 'Strong bullish momentum on EUR/USD with breakout above key resistance level at 1.0850. Target 1.0920 with stop at 1.0800.',
    pair: 'EUR/USD',
    type: 'buy',
    entryPrice: 1.0850,
    takeProfit: 1.0920,
    stopLoss: 1.0800,
    status: 'active',
    result: null,
    pips: null,
    riskRewardRatio: 1.4,
    createdBy: 1
  },
  {
    title: 'GBP/JPY Short Setup',
    description: 'GBP/JPY showing bearish divergence on 4H chart. Entry at 188.50, targeting 186.80 with stop at 189.20.',
    pair: 'GBP/JPY',
    type: 'sell',
    entryPrice: 188.50,
    takeProfit: 186.80,
    stopLoss: 189.20,
    status: 'closed',
    result: 'win',
    pips: 170,
    riskRewardRatio: 2.4,
    createdBy: 1
  },
  {
    title: 'USD/CAD Buy Signal',
    description: 'USD/CAD bouncing off major support at 1.3420. Looking for move to 1.3520 with tight stop at 1.3380.',
    pair: 'USD/CAD',
    type: 'buy',
    entryPrice: 1.3420,
    takeProfit: 1.3520,
    stopLoss: 1.3380,
    status: 'closed',
    result: 'win',
    pips: 100,
    riskRewardRatio: 2.5,
    createdBy: 1
  },
  {
    title: 'AUD/USD Short Position',
    description: 'AUD/USD rejected at key resistance 0.6750. Targeting 0.6680 with stop above 0.6780.',
    pair: 'AUD/USD',
    type: 'sell',
    entryPrice: 0.6750,
    takeProfit: 0.6680,
    stopLoss: 0.6780,
    status: 'closed',
    result: 'loss',
    pips: -30,
    riskRewardRatio: 2.3,
    createdBy: 1
  },
  {
    title: 'XAU/USD Gold Long',
    description: 'Gold showing strong support at $2010. Bullish momentum building for move to $2040.',
    pair: 'XAU/USD',
    type: 'buy',
    entryPrice: 2010.50,
    takeProfit: 2040.00,
    stopLoss: 1995.00,
    status: 'pending',
    result: null,
    pips: null,
    riskRewardRatio: 1.9,
    createdBy: 1
  },
  {
    title: 'USD/JPY Sell Setup',
    description: 'USD/JPY overbought at 150.20. Looking for correction to 148.50 with stop at 151.00.',
    pair: 'USD/JPY',
    type: 'sell',
    entryPrice: 150.20,
    takeProfit: 148.50,
    stopLoss: 151.00,
    status: 'active',
    result: null,
    pips: null,
    riskRewardRatio: 2.1,
    createdBy: 1
  },
  {
    title: 'EUR/GBP Long Position',
    description: 'EUR/GBP breaking above descending trendline. Target 0.8650 with stop at 0.8580.',
    pair: 'EUR/GBP',
    type: 'buy',
    entryPrice: 0.8600,
    takeProfit: 0.8650,
    stopLoss: 0.8580,
    status: 'closed',
    result: 'win',
    pips: 50,
    riskRewardRatio: 2.5,
    createdBy: 1
  },
  {
    title: 'NZD/USD Short Signal',
    description: 'NZD/USD facing resistance at 0.6180. Bearish setup targeting 0.6120 with stop at 0.6200.',
    pair: 'NZD/USD',
    type: 'sell',
    entryPrice: 0.6180,
    takeProfit: 0.6120,
    stopLoss: 0.6200,
    status: 'active',
    result: null,
    pips: null,
    riskRewardRatio: 3.0,
    createdBy: 1
  }
];

export const seedSignals = async () => {
  try {
    console.log('🔄 Seeding signals data...');
    
    // Clear existing signals
    await Signal.destroy({ where: {} });
    console.log('✅ Cleared existing signals');
    
    // Create new signals
    const createdSignals = await Signal.bulkCreate(sampleSignals);
    console.log(`✅ Created ${createdSignals.length} signals`);
    
    console.log('🎉 Signals seeding completed successfully!');
    return createdSignals;
  } catch (error) {
    console.error('❌ Error seeding signals:', error);
    throw error;
  }
};

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('seedSignals.js')) {
  // Initialize database connection
  db.sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connected successfully');
      return seedSignals();
    })
    .then(() => {
      console.log('✅ Signals seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Signals seeding failed:', error);
      process.exit(1);
    });
}
