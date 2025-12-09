import models from '../models/index.js';
import nowPaymentsService from '../services/nowPaymentsService.js';
import crypto from 'crypto';

// @desc    Get supported crypto currencies
// @route   GET /api/payments/currencies
// @access  Public
export const getSupportedCurrencies = async (req, res) => {
  try {
    const currencies = await nowPaymentsService.getCurrencies();
    
    res.json({
      success: true,
      data: {
        currencies: currencies.filter(currency => 
          ['btc', 'eth', 'usdt'].includes(currency.toLowerCase())
        )
      }
    });
  } catch (error) {
    console.error('❌ Error fetching currencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supported currencies'
    });
  }
};

// @desc    Get minimum payment amounts
// @route   GET /api/payments/min-amounts
// @access  Public
export const getMinimumAmounts = async (req, res) => {
  try {
    // Define minimum amounts for crypto payments (based on NOWPayments requirements)
    const minimumAmounts = {
      'btc': 50,   // $50 minimum for Bitcoin
      'eth': 30,   // $30 minimum for Ethereum
      'usdt': 20,  // $20 minimum for USDT
      'default': 20 // $20 minimum for other payment methods
    };
    
    res.json({
      success: true,
      data: minimumAmounts
    });
  } catch (error) {
    console.error('❌ Error fetching minimum amounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch minimum amounts'
    });
  }
};

// @desc    Get minimum payment amount for currency
// @route   GET /api/payments/min-amount/:currency
// @access  Public
export const getMinimumAmount = async (req, res) => {
  try {
    const { currency } = req.params;
    console.log(`📊 Fetching minimum amount for ${currency}`);
    
    const minAmount = await nowPaymentsService.getMinimumAmount(currency);
    
    res.json({
      success: true,
      data: minAmount
    });
  } catch (error) {
    console.error('❌ Error fetching minimum amount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch minimum amount',
      error: error.message
    });
  }
};

// @desc    Get price estimate
// @route   POST /api/payments/estimate
// @access  Private
export const getEstimate = async (req, res) => {
  try {
    const { amount, currency_from, currency_to = 'usd' } = req.body;
    
    console.log(`💱 Getting estimate: ${amount} ${currency_from} to ${currency_to}`);
    
    const estimate = await nowPaymentsService.getEstimatedPrice(amount, currency_from, currency_to);
    
    res.json({
      success: true,
      data: estimate
    });
  } catch (error) {
    console.error('❌ Error getting estimate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get price estimate',
      error: error.message
    });
  }
};

// @desc    Create crypto payment for deposit
// @route   POST /api/payments/deposit
// @access  Private
export const createDepositPayment = async (req, res) => {
  try {
    const { amount, pay_currency, description = 'Account Deposit' } = req.body;
    const userId = req.user.id;
    
    console.log('💰 Creating deposit payment:', { userId, amount, pay_currency });

    // Validate required fields
    if (!amount || !pay_currency) {
      return res.status(400).json({
        success: false,
        message: 'Amount and payment currency are required'
      });
    }

    // Define minimum amounts for crypto payments (based on NOWPayments requirements)
    const cryptoMinimums = {
      'btc': 50,        // $50 minimum for Bitcoin
      'eth': 30,        // $30 minimum for Ethereum
      'usdttrc20': 20,  // $20 minimum for USDT (TRC20)
      'usdtbsc': 20     // $20 minimum for USDT (BSC)
    };

    // Validate minimum amount for crypto payments
    const currency = pay_currency.toLowerCase();
    if (cryptoMinimums[currency] && amount < cryptoMinimums[currency]) {
      return res.status(400).json({
        success: false,
        message: `Minimum deposit amount for ${currency.toUpperCase()} is $${cryptoMinimums[currency]}`,
        minimumAmount: cryptoMinimums[currency]
      });
    }

    // Validate general minimum amount
    if (amount < 20) {
      return res.status(400).json({
        success: false,
        message: 'Minimum deposit amount is $20'
      });
    }

    // Generate unique order ID
    const orderId = `HC-DEPOSIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create payment record in database
    const payment = await models.Payment.create({
      userId,
      orderId,
      type: 'deposit',
      amount: parseFloat(amount),
      currency: 'USD',
      payCurrency: pay_currency.toLowerCase(),
      status: 'waiting',
      description
    });

    // Create payment with NOWPayments
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const nowPaymentData = {
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: pay_currency.toLowerCase(),
      order_id: orderId,
      order_description: description,
      ipn_callback_url: `${process.env.BACKEND_URL || 'https://api.hillscapitaltrade.com'}/api/payments/webhook`,
      success_url: `${baseUrl}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/dashboard?payment=cancelled`
    };

    const nowPayment = await nowPaymentsService.createPayment(nowPaymentData);
    
    // Update payment with NOWPayments data
    await payment.update({
      nowPaymentId: nowPayment.payment_id,
      payAmount: nowPayment.pay_amount,
      payAddress: nowPayment.pay_address,
      expiresAt: new Date(Date.now() + (30 * 60 * 1000)) // 30 minutes expiry
    });

    console.log('✅ Deposit payment created:', payment.id);

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        payment_id: payment.id,
        order_id: orderId,
        nowpayment_id: nowPayment.payment_id,
        pay_address: nowPayment.pay_address,
        pay_amount: nowPayment.pay_amount,
        pay_currency: pay_currency.toUpperCase(),
        price_amount: amount,
        price_currency: 'USD',
        payment_status: nowPayment.payment_status,
        created_at: payment.createdAt,
        expires_at: payment.expiresAt
      }
    });
  } catch (error) {
    console.error('❌ Error creating deposit payment:', error);
    
    // Check if it's a validation error
    if (error.name === 'SequelizeValidationError') {
      console.error('🔍 Validation errors:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }
    
    // Check if it's a NOWPayments API error
    if (error.response?.data) {
      console.error('🔍 NOWPayments API error:', error.response.data);
      return res.status(400).json({
        success: false,
        message: 'Payment service error',
        error: error.response.data.message || error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
};

// @desc    Create crypto payment for investment
// @route   POST /api/payments/investment
// @access  Private
export const createInvestmentPayment = async (req, res) => {
  try {
    const { amount, planId, pay_currency } = req.body;
    const userId = req.user.id;
    
    console.log('💰 Creating investment payment:', { userId, amount, planId, pay_currency });
    
    // Validate required fields
    if (!amount || !planId || !pay_currency) {
      return res.status(400).json({
        success: false,
        message: 'Amount, plan ID, and payment currency are required'
      });
    }

    // Get investment plan
    const plan = await models.InvestmentPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    // Validate amount is within plan limits
    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Investment amount must be between $${plan.minAmount} and $${plan.maxAmount}`
      });
    }

    // Generate unique order ID
    const orderId = `HC-INVEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create investment first
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));

    const investment = await models.Investment.create({
      userId,
      planId,
      amount: parseFloat(amount),
      duration: plan.duration,
      roi: plan.roi,
      status: 'pending', // Will be activated when payment is confirmed
      startDate,
      endDate,
      totalEarned: 0.0
    });

    // Create payment record
    const payment = await models.Payment.create({
      userId,
      orderId,
      type: 'investment',
      amount: parseFloat(amount),
      currency: 'USD',
      payCurrency: pay_currency.toLowerCase(),
      status: 'waiting',
      description: `Investment in ${plan.name}`,
      relatedId: investment.id
    });

    // Create payment with NOWPayments
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const nowPaymentData = {
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: pay_currency.toLowerCase(),
      order_id: orderId,
      order_description: `Investment in ${plan.name}`,
      ipn_callback_url: `${process.env.BACKEND_URL || 'https://api.hillscapitaltrade.com'}/api/payments/webhook`,
      success_url: `${baseUrl}/dashboard?payment=success&tab=1`,
      cancel_url: `${baseUrl}/dashboard?payment=cancelled&tab=1`
    };

    const nowPayment = await nowPaymentsService.createPayment(nowPaymentData);
    
    // Update payment with NOWPayments data
    await payment.update({
      nowPaymentId: nowPayment.payment_id,
      payAmount: nowPayment.pay_amount,
      payAddress: nowPayment.pay_address,
      expiresAt: new Date(Date.now() + (30 * 60 * 1000)) // 30 minutes expiry
    });

    console.log('✅ Investment payment created:', payment.id);

    res.status(201).json({
      success: true,
      message: 'Investment payment created successfully',
      data: {
        payment_id: payment.id,
        investment_id: investment.id,
        order_id: orderId,
        nowpayment_id: nowPayment.payment_id,
        pay_address: nowPayment.pay_address,
        pay_amount: nowPayment.pay_amount,
        pay_currency: pay_currency.toUpperCase(),
        price_amount: amount,
        price_currency: 'USD',
        payment_status: nowPayment.payment_status,
        plan_name: plan.name,
        created_at: payment.createdAt,
        expires_at: payment.expiresAt
      }
    });
  } catch (error) {
    console.error('❌ Error creating investment payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create investment payment',
      error: error.message
    });
  }
};

// @desc    Get payment status
// @route   GET /api/payments/:paymentId/status
// @access  Private
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;
    
    console.log(`📊 Checking payment status: ${paymentId} for user ${userId}`);
    
    // Get payment from database
    const payment = await models.Payment.findOne({
      where: {
        id: paymentId,
        userId
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get updated status from NOWPayments if we have a nowPaymentId
    if (payment.nowPaymentId) {
      try {
        const nowPaymentStatus = await nowPaymentsService.getPaymentStatus(payment.nowPaymentId);
        
        // Update local payment status if it changed
        if (nowPaymentStatus.payment_status !== payment.status) {
          await payment.update({
            status: nowPaymentStatus.payment_status,
            actuallyPaid: nowPaymentStatus.actually_paid || payment.actuallyPaid,
            networkFee: nowPaymentStatus.network_fee || payment.networkFee,
            txHash: nowPaymentStatus.outcome?.hash || payment.txHash,
            completedAt: ['finished', 'confirmed'].includes(nowPaymentStatus.payment_status) 
              ? new Date() : payment.completedAt
          });

          // If payment is completed and it's an investment, activate the investment
          if (['finished', 'confirmed'].includes(nowPaymentStatus.payment_status) && 
              payment.type === 'investment' && payment.relatedId) {
            await models.Investment.update(
              { status: 'active' },
              { where: { id: payment.relatedId } }
            );
            console.log(`✅ Investment ${payment.relatedId} activated`);
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch updated status from NOWPayments:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        payment_id: payment.id,
        order_id: payment.orderId,
        status: payment.status,
        status_display: payment.getStatusDisplay(),
        amount: payment.amount,
        currency: payment.currency,
        pay_amount: payment.payAmount,
        pay_currency: payment.payCurrency?.toUpperCase(),
        pay_address: payment.payAddress,
        actually_paid: payment.actuallyPaid,
        tx_hash: payment.txHash,
        created_at: payment.createdAt,
        expires_at: payment.expiresAt,
        completed_at: payment.completedAt,
        is_completed: payment.isCompleted(),
        is_pending: payment.isPending(),
        is_failed: payment.isFailed()
      }
    });
  } catch (error) {
    console.error('❌ Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, status, limit = 10, offset = 0 } = req.query;
    
    console.log(`📋 Fetching payments for user ${userId}`);
    console.log('Query params:', { type, status, limit, offset });
    
    // Check if Payment model exists
    if (!models.Payment) {
      console.error('❌ Payment model not found');
      return res.status(500).json({
        success: false,
        message: 'Payment model not available'
      });
    }

    const whereClause = { userId };
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    console.log('Where clause:', whereClause);

    const payments = await models.Payment.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`✅ Found ${payments.count} payments for user ${userId}`);

    res.json({
      success: true,
      data: {
        payments: payments.rows.map(payment => ({
          payment_id: payment.id,
          order_id: payment.orderId,
          type: payment.type,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          description: payment.description,
          // Crypto payment fields
          pay_amount: payment.payAmount,
          pay_currency: payment.payCurrency,
          pay_address: payment.payAddress,
          actually_paid: payment.actuallyPaid,
          nowpayment_id: payment.nowPaymentId,
          // Timestamps
          created_at: payment.createdAt,
          updated_at: payment.updatedAt,
          expires_at: payment.expiresAt,
          completed_at: payment.completedAt
        })),
        total: payments.count
      }
    });
  } catch (error) {
    console.error('❌ Error fetching user payments:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// @desc    Handle NOWPayments webhook
// @route   POST /api/payments/webhook
// @access  Public (but verified)
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-nowpayments-sig'];
    const payload = req.body;
    
    console.log('🔔 Received NOWPayments webhook:', {
      payment_id: payload.payment_id,
      payment_status: payload.payment_status,
      order_id: payload.order_id
    });

    // Verify webhook signature
    if (!nowPaymentsService.verifyIPNSignature(payload, signature)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find payment by order_id
    const payment = await models.Payment.findOne({
      where: { orderId: payload.order_id }
    });

    if (!payment) {
      console.error('❌ Payment not found for order:', payload.order_id);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    await payment.update({
      status: payload.payment_status,
      actuallyPaid: payload.actually_paid || payment.actuallyPaid,
      networkFee: payload.network_fee || payment.networkFee,
      txHash: payload.outcome?.hash || payment.txHash,
      ipnCallbackData: payload,
      completedAt: ['finished', 'confirmed'].includes(payload.payment_status) 
        ? new Date() : payment.completedAt
    });

    // Handle completed payments
    if (['finished', 'confirmed'].includes(payload.payment_status)) {
      console.log('✅ Payment completed:', payment.orderId);
      
      // If it's an investment payment, activate the investment
      if (payment.type === 'investment' && payment.relatedId) {
        await models.Investment.update(
          { status: 'active' },
          { where: { id: payment.relatedId } }
        );
        console.log(`✅ Investment ${payment.relatedId} activated`);
      }
      
      // If it's a subscription payment, create/activate the subscription
      if (payment.type === 'subscription' && payment.relatedId) {
        const plan = await models.SubscriptionPlan.findByPk(payment.relatedId);
        if (plan) {
          // Calculate subscription dates
          const startDate = new Date();
          const endDate = new Date();
          if (plan.billingCycle === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (plan.billingCycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          // Create or update subscription
          const [subscription, created] = await models.Subscription.findOrCreate({
            where: { 
              userId: payment.userId,
              planId: payment.relatedId,
              status: 'active'
            },
            defaults: {
              userId: payment.userId,
              planId: payment.relatedId,
              status: 'active',
              startDate,
              endDate,
              nextBillingDate: endDate,
              autoRenew: true,
              paymentMethod: 'crypto',
              amount: payment.amount,
              currency: 'USD'
            }
          });

          if (!created) {
            // Update existing subscription
            await subscription.update({
              status: 'active',
              startDate,
              endDate,
              nextBillingDate: endDate,
              amount: payment.amount
            });
          }

          console.log(`✅ Subscription ${subscription.id} ${created ? 'created' : 'updated'} for plan ${plan.name}`);
        }
      }
      
      // If it's a deposit, you could update user balance here
      if (payment.type === 'deposit') {
        // TODO: Update user balance logic
        console.log(`✅ Deposit ${payment.amount} USD completed for user ${payment.userId}`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error handling webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Create crypto payment for subscription
// @route   POST /api/payments/subscription
// @access  Private
export const createSubscriptionPayment = async (req, res) => {
  try {
    const { amount, planId, pay_currency } = req.body;
    const userId = req.user.id;
    
    console.log('💰 Creating subscription payment:', { userId, amount, planId, pay_currency });
    
    // Validate required fields
    if (!amount || !planId || !pay_currency) {
      return res.status(400).json({
        success: false,
        message: 'Amount, plan ID, and payment currency are required'
      });
    }

    // Get subscription plan
    const plan = await models.SubscriptionPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Validate amount matches plan price
    if (parseFloat(amount) !== parseFloat(plan.price)) {
      return res.status(400).json({
        success: false,
        message: `Amount must match plan price: $${plan.price}`
      });
    }

    // Create NOWPayments payment
    const nowPayment = await nowPaymentsService.createPayment({
      price_amount: amount,
      price_currency: 'USD',
      pay_currency: pay_currency.toLowerCase(),
      order_id: `sub_${userId}_${Date.now()}`,
      order_description: `Subscription: ${plan.name} Plan`,
      ipn_callback_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      success_url: `${process.env.FRONTEND_URL}/dashboard/subscription?status=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/subscription?status=cancelled`
    });

    console.log('✅ NOWPayments subscription payment created:', nowPayment.payment_id);

    // Save payment to database
    const payment = await models.Payment.create({
      userId,
      type: 'subscription',
      relatedId: planId,
      amount: parseFloat(amount),
      currency: 'USD',
      payCurrency: pay_currency.toUpperCase(),
      payAmount: parseFloat(nowPayment.pay_amount),
      payAddress: nowPayment.pay_address,
      orderId: nowPayment.order_id,
      nowPaymentId: nowPayment.payment_id,
      status: nowPayment.payment_status,
      expiresAt: new Date(Date.now() + (30 * 60 * 1000)), // 30 minutes
      description: `Subscription: ${plan.name} Plan`
    });

    console.log('✅ Subscription payment saved to database:', payment.id);

    res.status(201).json({
      success: true,
      message: 'Subscription payment created successfully',
      data: {
        payment_id: payment.id,
        order_id: nowPayment.order_id,
        pay_address: nowPayment.pay_address,
        pay_amount: nowPayment.pay_amount,
        pay_currency: pay_currency.toUpperCase(),
        price_amount: amount,
        price_currency: 'USD',
        payment_status: nowPayment.payment_status,
        plan_name: plan.name,
        created_at: payment.createdAt,
        expires_at: payment.expiresAt
      }
    });
  } catch (error) {
    console.error('❌ Error creating subscription payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription payment',
      error: error.message
    });
  }
};

export default {
  getSupportedCurrencies,
  getMinimumAmounts,
  getMinimumAmount,
  getEstimate,
  createDepositPayment,
  createInvestmentPayment,
  createSubscriptionPayment,
  getPaymentStatus,
  getUserPayments,
  handleWebhook
};
