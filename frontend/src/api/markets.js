import axios from 'axios';

// CoinGecko API for cryptocurrency data
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Get top cryptocurrencies with market data
export const getCryptocurrencies = async () => {
  try {
    const response = await axios.get(
      `${COINGECKO_API}/coins/markets`,
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: true,
          price_change_percentage: '1h,24h,7d'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    return [];
  }
};

// Get forex rates (this is a mock - in production, use a real forex API)
export const getForexRates = async () => {
  try {
    // In a real app, this would be a call to a forex API
    // For demo purposes, we'll return mock data
    const mockForexData = {
      rates: {
        'EUR/USD': { rate: 1.1234, change: 0.24, high: 1.1256, low: 1.1201 },
        'USD/NGN': { rate: 1502.50, change: -5.30, high: 1510.25, low: 1498.75 },
        'GBP/USD': { rate: 1.3456, change: -0.12, high: 1.3489, low: 1.3421 },
        'USD/JPY': { rate: 110.45, change: 0.56, high: 110.78, low: 109.92 },
        'AUD/USD': { rate: 0.7654, change: 0.32, high: 0.7689, low: 0.7621 },
      }
    };
    return mockForexData.rates;
  } catch (error) {
    console.error('Error fetching forex rates:', error);
    return {};
  }
};

// Get historical price data for charts
export const getHistoricalData = async (id, days = 30) => {
  try {
    const response = await axios.get(
      `${COINGECKO_API}/coins/${id}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: 'daily'
        }
      }
    );
    return response.data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      price: price
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
};
