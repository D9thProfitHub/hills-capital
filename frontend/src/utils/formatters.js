/**
 * Utility functions for formatting data
 */

/**
 * Format currency with proper symbol and decimal places
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  try {
    if (amount === null || amount === undefined) return 'N/A';
    
    // Convert string numbers to actual numbers
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return 'Invalid amount';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return 'Error';
  }
};

/**
 * Format percentage with proper decimal places
 * @param {number} value - The percentage value to format (0-100)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  try {
    if (value === null || value === undefined) return '0.00%';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return '0.00%';
    
    return numValue.toFixed(decimals) + '%';
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return '0.00%';
  }
};

/**
 * Format a date string to a more readable format
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  try {
    if (!date) return 'N/A';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleDateString('en-US', formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a number with commas as thousand separators
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
export const formatNumber = (num, decimals = 2) => {
  try {
    if (num === null || num === undefined) return '0';
    
    const number = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(number)) return '0';
    
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  } catch (error) {
    console.error('Error formatting number:', error);
    return '0';
  }
};

/**
 * Format a large number with K, M, B, T suffixes
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted number with suffix
 */
export const formatLargeNumber = (num, decimals = 1) => {
  try {
    if (num === null || num === undefined) return '0';
    
    const number = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(number)) return '0';
    
    if (number < 1000) return number.toString();
    
    const units = ['K', 'M', 'B', 'T'];
    let unitIndex = -1;
    let scaledNumber = number;
    
    while (scaledNumber >= 1000 && unitIndex < units.length - 1) {
      scaledNumber /= 1000;
      unitIndex++;
    }
    
    return scaledNumber.toFixed(decimals) + units[unitIndex];
  } catch (error) {
    console.error('Error formatting large number:', error);
    return '0';
  }
};

/**
 * Format a duration in milliseconds to a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (ms) => {
  try {
    if (ms === null || ms === undefined) return '0s';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    
    return `${seconds}s`;
  } catch (error) {
    console.error('Error formatting duration:', error);
    return '0s';
  }
};

const formatters = {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatNumber,
  formatLargeNumber,
  formatDuration
};

export default formatters;
