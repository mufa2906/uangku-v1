// src/lib/currency.ts

// Default currency for the application (Indonesian Rupiah)
export const DEFAULT_CURRENCY = 'IDR';

// Currency configuration
interface CurrencyConfig {
  code: string;
  symbol: string;
  thousandSeparator: string;
  decimalSeparator: string;
  format: (amount: number) => string;
}

// Indonesian Rupiah formatting configuration
const IDR_CONFIG: CurrencyConfig = {
  code: 'IDR',
  symbol: 'Rp ',
  thousandSeparator: '.',
  decimalSeparator: ',',
  format: (amount: number): string => {
    // Format using Indonesian number formatting
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },
};

const USD_CONFIG: CurrencyConfig = {
  code: 'USD',
  symbol: '$',
  thousandSeparator: ',',
  decimalSeparator: '.',
  format: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },
};

const EUR_CONFIG: CurrencyConfig = {
  code: 'EUR',
  symbol: '€',
  thousandSeparator: '.',
  decimalSeparator: ',',
  format: (amount: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },
};

const GBP_CONFIG: CurrencyConfig = {
  code: 'GBP',
  symbol: '£',
  thousandSeparator: ',',
  decimalSeparator: '.',
  format: (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },
};

const SGD_CONFIG: CurrencyConfig = {
  code: 'SGD',
  symbol: 'S$',
  thousandSeparator: ',',
  decimalSeparator: '.',
  format: (amount: number): string => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },
};

const THB_CONFIG: CurrencyConfig = {
  code: 'THB',
  symbol: '฿',
  thousandSeparator: ',',
  decimalSeparator: '.',
  format: (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },
};

const MYR_CONFIG: CurrencyConfig = {
  code: 'MYR',
  symbol: 'RM',
  thousandSeparator: ',',
  decimalSeparator: '.',
  format: (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },
};

// Additional currency configurations
const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  IDR: IDR_CONFIG,
  USD: USD_CONFIG,
  EUR: EUR_CONFIG,
  GBP: GBP_CONFIG,
  SGD: SGD_CONFIG,
  THB: THB_CONFIG,
  MYR: MYR_CONFIG,
};

/**
 * Get currency configuration for a given currency code
 * @param currencyCode Currency code (e.g., 'IDR', 'USD')
 * @returns Currency configuration
 */
export function getCurrencyConfig(currencyCode: string = DEFAULT_CURRENCY): CurrencyConfig {
  const config = CURRENCY_CONFIGS[currencyCode.toUpperCase()];
  if (!config) {
    // Default to IDR if currency code is not found
    return CURRENCY_CONFIGS.IDR;
  }
  return config;
}

/**
 * Format an amount in the specified currency
 * @param amount The amount to format
 * @param currencyCode Currency code (default: IDR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const config = getCurrencyConfig(currencyCode);
  return config.format(amount);
}

/**
 * Parse a currency string to a number
 * @param currencyString The currency string to parse (e.g., "Rp 25.000")
 * @param currencyCode Currency code (default: IDR)
 * @returns The parsed number
 */
export function parseCurrency(currencyString: string, currencyCode: string = DEFAULT_CURRENCY): number {
  const config = getCurrencyConfig(currencyCode);
  
  // Remove currency symbol and thousand separators
  const cleanedString = currencyString
    .replace(config.symbol, '')
    .replace(new RegExp(`\\${config.thousandSeparator}`, 'g'), '')
    .trim();
  
  return parseFloat(cleanedString);
}

/**
 * Get the currency symbol for a given currency code
 * @param currencyCode Currency code (default: IDR)
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: string = DEFAULT_CURRENCY): string {
  return getCurrencyConfig(currencyCode).symbol;
}