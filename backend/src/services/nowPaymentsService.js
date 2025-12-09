import axios from 'axios';
import crypto from 'crypto';

class NOWPaymentsService {
  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY;
    this.sandboxApiKey = process.env.NOWPAYMENTS_SANDBOX_API_KEY;
    this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    this.isSandbox = process.env.NODE_ENV !== 'production';
    
    this.baseURL = this.isSandbox 
      ? 'https://api-sandbox.nowpayments.io/v1'
      : 'https://api.nowpayments.io/v1';
      
    this.currentApiKey = this.isSandbox ? this.sandboxApiKey : this.apiKey;
    
    // Validate API key configuration
    if (!this.currentApiKey || this.currentApiKey === 'your_nowpayments_sandbox_api_key' || this.currentApiKey === 'your_nowpayments_api_key') {
      console.error('❌ NOWPayments API key not configured properly!');
      console.error('📋 Please check NOWPAYMENTS_SETUP.md for setup instructions');
    }
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-api-key': this.currentApiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log(`🔧 NOWPayments Service initialized in ${this.isSandbox ? 'SANDBOX' : 'PRODUCTION'} mode`);
    console.log(`🔑 API Key: ${this.currentApiKey ? `${this.currentApiKey.substring(0, 8)}...` : 'NOT SET'}`);
  }

  /**
   * Get available currencies for payments
   */
  async getAvailableCurrencies() {
    try {
      const response = await this.client.get('/currencies');
      console.log('✅ Available currencies fetched:', response.data.currencies?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching currencies:', error.response?.data || error.message);
      throw new Error('Failed to fetch available currencies');
    }
  }

  /**
   * Get minimum payment amount for a currency
   */
  async getMinimumAmount(currencyFrom, currencyTo = 'usd') {
    try {
      const response = await this.client.get('/min-amount', {
        params: {
          currency_from: currencyFrom,
          currency_to: currencyTo
        }
      });
      console.log(`✅ Minimum amount for ${currencyFrom}: ${response.data.min_amount}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching minimum amount:', error.response?.data || error.message);
      throw new Error('Failed to fetch minimum amount');
    }
  }

  /**
   * Get estimated price for conversion
   */
  async getEstimatedPrice(amount, currencyFrom, currencyTo = 'usd') {
    try {
      const response = await this.client.get('/estimate', {
        params: {
          amount,
          currency_from: currencyFrom,
          currency_to: currencyTo
        }
      });
      console.log(`✅ Estimated price: ${amount} ${currencyFrom} = ${response.data.estimated_amount} ${currencyTo}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching estimated price:', error.response?.data || error.message);
      throw new Error('Failed to get price estimate');
    }
  }

  /**
   * Create a payment
   */
  async createPayment(paymentData) {
    try {
      const {
        price_amount,
        price_currency = 'usd',
        pay_currency,
        order_id,
        order_description,
        ipn_callback_url,
        success_url,
        cancel_url
      } = paymentData;

      const payload = {
        price_amount: parseFloat(price_amount),
        price_currency: price_currency.toLowerCase(),
        pay_currency: pay_currency.toLowerCase(),
        order_id: order_id.toString(),
        order_description,
        ipn_callback_url,
        success_url,
        cancel_url
      };

      console.log('💰 Creating NOWPayments payment:', payload);

      const response = await this.client.post('/payment', payload);
      
      console.log('✅ Payment created successfully:', {
        payment_id: response.data.payment_id,
        payment_status: response.data.payment_status,
        pay_address: response.data.pay_address,
        pay_amount: response.data.pay_amount
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error creating payment:', error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        throw new Error('Invalid NOWPayments API key. Please check your API key configuration in .env file. See NOWPAYMENTS_SETUP.md for help.');
      }
      
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Invalid payment parameters';
        throw new Error(`Payment validation failed: ${errorMsg}`);
      }
      
      if (error.response?.data?.code === 'INTERNAL_ERROR') {
        const errorMsg = error.response?.data?.message || 'Internal API error';
        throw new Error(`NOWPayments API error: ${errorMsg}. This might be due to invalid API key or unsupported currency pair.`);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create payment');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await this.client.get(`/payment/${paymentId}`);
      console.log(`✅ Payment ${paymentId} status: ${response.data.payment_status}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching payment status:', error.response?.data || error.message);
      throw new Error('Failed to fetch payment status');
    }
  }

  /**
   * Verify IPN callback signature
   */
  verifyIPNSignature(payload, signature) {
    if (!this.ipnSecret) {
      console.warn('⚠️ IPN Secret not configured, skipping signature verification');
      return true; // Allow in development if secret not set
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha512', this.ipnSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const isValid = expectedSignature === signature;
      console.log(`🔐 IPN signature verification: ${isValid ? 'VALID' : 'INVALID'}`);
      return isValid;
    } catch (error) {
      console.error('❌ Error verifying IPN signature:', error.message);
      return false;
    }
  }

  /**
   * Map NOWPayments currency codes to display names
   */
  getCurrencyDisplayName(currency) {
    const currencyMap = {
      'btc': 'Bitcoin',
      'eth': 'Ethereum',
      'usdt': 'Tether USDT',
      'usdc': 'USD Coin',
      'ltc': 'Litecoin',
      'bch': 'Bitcoin Cash',
      'xrp': 'Ripple',
      'ada': 'Cardano',
      'dot': 'Polkadot',
      'bnb': 'Binance Coin',
      'sol': 'Solana',
      'matic': 'Polygon',
      'avax': 'Avalanche',
      'trx': 'TRON'
    };
    
    return currencyMap[currency.toLowerCase()] || currency.toUpperCase();
  }

  /**
   * Get supported crypto currencies for the platform
   */
  getSupportedCurrencies() {
    return [
      { code: 'btc', name: 'Bitcoin', symbol: '₿' },
      { code: 'eth', name: 'Ethereum', symbol: 'Ξ' },
      { code: 'usdt', name: 'Tether USDT', symbol: '₮' },
      { code: 'usdc', name: 'USD Coin', symbol: '$' },
      { code: 'ltc', name: 'Litecoin', symbol: 'Ł' },
      { code: 'bch', name: 'Bitcoin Cash', symbol: '₿' },
      { code: 'bnb', name: 'Binance Coin', symbol: 'BNB' },
      { code: 'ada', name: 'Cardano', symbol: '₳' },
      { code: 'sol', name: 'Solana', symbol: '◎' },
      { code: 'matic', name: 'Polygon', symbol: 'MATIC' }
    ];
  }
}

export default new NOWPaymentsService();
