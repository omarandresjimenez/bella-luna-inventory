/**
 * Format number with thousand separators and fixed decimals
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string with thousand separators
 * 
 * @example
 * formatPrice(1234.56) => "1,234"
 * formatPrice(1000000) => "1,000,000"
 * formatPrice(1234.56, 2) => "1,234.56"
 */
export const formatPrice = (value: number | string, decimals = 0): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Format number as currency with $ prefix and thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string with $ prefix
 * 
 * @example
 * formatCurrency(1234.56) => "$1,234"
 * formatCurrency(1000000) => "$1,000,000"
 * formatCurrency(1234.56, 2) => "$1,234.56"
 */
export const formatCurrency = (value: number | string, decimals = 0): string => {
  return `$${formatPrice(value, decimals)}`;
};

/**
 * Format number with thousand separators (no decimals)
 * @param value - Number to format
 * @returns Formatted string with thousand separators
 * 
 * @example
 * formatQuantity(1000) => "1,000"
 * formatQuantity(1000000) => "1,000,000"
 */
export const formatQuantity = (value: number | string): string => {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(num)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param value - Number to format
 * @returns Abbreviated formatted string
 * 
 * @example
 * formatCompact(1234) => "1.2K"
 * formatCompact(1000000) => "1M"
 */
export const formatCompact = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};
