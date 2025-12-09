/**
 * Calculate profit for an investment over a specific period
 * @param {Object} investment - The investment object
 * @param {Date} fromDate - Start date for profit calculation
 * @param {Date} toDate - End date for profit calculation
 * @returns {Number} - Calculated profit
 */
export const calculateProfit = (investment, fromDate, toDate) => {
  // If investment is not active or payout is set to 'end', return 0
  if (investment.status !== 'active' || investment.payout === 'end') {
    return 0;
  }

  // Convert dates to timestamps if they're not already
  const start = fromDate instanceof Date ? fromDate : new Date(fromDate);
  const end = toDate instanceof Date ? toDate : new Date(toDate);
  
  // Ensure start and end dates are within investment period
  const investmentStart = new Date(investment.startDate);
  const investmentEnd = new Date(investment.endDate);
  
  // If the period is outside the investment duration, return 0
  if (start >= investmentEnd || end <= investmentStart) {
    return 0;
  }
  
  // Adjust start and end dates to be within the investment period
  const periodStart = start < investmentStart ? investmentStart : start;
  const periodEnd = end > investmentEnd ? investmentEnd : end;
  
  // Calculate number of days in the period
  const days = (periodEnd - periodStart) / (1000 * 60 * 60 * 24);
  
  // If period is less than a day, return 0
  if (days <= 0) return 0;
  
  // Calculate profit based on the investment's ROI and duration
  const dailyRoi = investment.roi / (investment.duration * 100);
  let profit = investment.amount * dailyRoi * days;
  
  // Ensure we don't return more than the total possible profit
  const totalPossibleProfit = investment.amount * (investment.roi / 100);
  const profitSoFar = investment.totalProfit || 0;
  const remainingProfit = Math.max(0, totalPossibleProfit - profitSoFar);
  
  return Math.min(profit, remainingProfit);
};

/**
 * Calculate the next payout date based on frequency
 * @param {String} frequency - Payout frequency ('daily', 'weekly', 'monthly', 'end')
 * @param {Date} lastPayoutDate - Last payout date
 * @param {Date} endDate - Investment end date
 * @returns {Date} - Next payout date or null if no more payouts
 */
export const calculateNextPayoutDate = (frequency, lastPayoutDate, endDate) => {
  if (frequency === 'end' || !lastPayoutDate) {
    return null;
  }
  
  const nextPayout = new Date(lastPayoutDate);
  
  switch (frequency) {
    case 'daily':
      nextPayout.setDate(nextPayout.getDate() + 1);
      break;
    case 'weekly':
      nextPayout.setDate(nextPayout.getDate() + 7);
      break;
    case 'monthly':
      nextPayout.setMonth(nextPayout.getMonth() + 1);
      break;
    default:
      return null;
  }
  
  // If next payout is after end date, return null
  return nextPayout <= endDate ? nextPayout : null;
};

/**
 * Validate investment data before saving
 * @param {Object} data - Investment data
 * @returns {Object} - Validation result { isValid: Boolean, errors: Array }
 */
export const validateInvestmentData = (data) => {
  const errors = [];
  
  // Check required fields
  const requiredFields = ['plan', 'amount', 'duration', 'roi', 'payout'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`${field} is required`);
    }
  });
  
  // Validate amount
  if (data.amount && (isNaN(data.amount) || data.amount <= 0)) {
    errors.push('Amount must be a positive number');
  }
  
  // Validate duration
  if (data.duration && (isNaN(data.duration) || data.duration <= 0)) {
    errors.push('Duration must be a positive number');
  }
  
  // Validate ROI
  if (data.roi && (isNaN(data.roi) || data.roi < 0)) {
    errors.push('ROI must be a non-negative number');
  }
  
  // Validate plan
  const validPlans = ['starter', 'premium', 'vip', 'custom'];
  if (data.plan && !validPlans.includes(data.plan)) {
    errors.push(`Invalid plan. Must be one of: ${validPlans.join(', ')}`);
  }
  
  // Validate payout frequency
  const validFrequencies = ['daily', 'weekly', 'monthly', 'end'];
  if (data.payout && !validFrequencies.includes(data.payout)) {
    errors.push(`Invalid payout frequency. Must be one of: ${validFrequencies.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get investment plan details
 * @param {String} plan - Plan name
 * @returns {Object} - Plan details
 */
export const getPlanDetails = (plan) => {
  const plans = {
    starter: {
      minAmount: 100,
      maxAmount: 999,
      duration: 30, // days
      roi: 20, // percentage
      description: 'Ideal for beginners',
      features: [
        '24/7 Support',
        'Basic Analytics',
        'Email Support',
      ],
    },
    premium: {
      minAmount: 1000,
      maxAmount: 9999,
      duration: 60, // days
      roi: 40, // percentage
      description: 'For experienced investors',
      features: [
        'Priority Support',
        'Advanced Analytics',
        'Dedicated Account Manager',
        'Weekly Reports',
      ],
    },
    vip: {
      minAmount: 10000,
      maxAmount: 100000,
      duration: 90, // days
      roi: 70, // percentage
      description: 'For high net worth investors',
      features: [
        '24/7 VIP Support',
        'Premium Analytics',
        'Personal Account Manager',
        'Daily Reports',
        'Exclusive Investment Opportunities',
      ],
    },
    custom: {
      minAmount: 100000,
      maxAmount: 1000000,
      duration: 0, // Custom duration
      roi: 0, // Custom ROI
      description: 'Tailored investment solutions',
      features: [
        'Custom Investment Strategy',
        'Dedicated Support Team',
        'Personalized Reports',
        'Exclusive Access to All Features',
      ],
    },
  };
  
  return plans[plan] || null;
};

/**
 * Calculate total return on investment
 * @param {Number} amount - Investment amount
 * @param {Number} roi - Return on investment percentage
 * @returns {Number} - Total return amount
 */
export const calculateTotalReturn = (amount, roi) => {
  return amount * (1 + roi / 100);
};

/**
 * Format currency
 * @param {Number} amount - Amount to format
 * @param {String} currency - Currency code (default: 'USD')
 * @returns {String} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
