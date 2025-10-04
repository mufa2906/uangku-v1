// src/contexts/CurrencyContext.tsx
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { DEFAULT_CURRENCY, formatCurrency as formatCurrencyUtil, getCurrencyConfig } from '@/lib/currency';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<string>(() => {
    // Get currency from localStorage or default to IDR
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('preferredCurrency');
      return savedCurrency || DEFAULT_CURRENCY;
    }
    return DEFAULT_CURRENCY;
  });

  // Update localStorage when currency changes
  useEffect(() => {
    localStorage.setItem('preferredCurrency', currency);
  }, [currency]);

  const setCurrency = (newCurrency: string) => {
    // Validate the currency code
    try {
      getCurrencyConfig(newCurrency);
      setCurrencyState(newCurrency);
    } catch (error) {
      console.warn(`Invalid currency code: ${newCurrency}. Using ${DEFAULT_CURRENCY} instead.`);
      setCurrencyState(DEFAULT_CURRENCY);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  const currencySymbol = getCurrencyConfig(currency).symbol;

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatCurrency,
        currencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}