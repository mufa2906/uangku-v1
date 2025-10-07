// src/types/index.ts

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  walletName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  budgetId: string | null; // Optional reference to budget
  budgetName: string | null; // Budget name for display
  type: 'income' | 'expense';
  amount: string; // Using string to match the decimal type from the database
  note: string | null;
  date: string; // ISO string format
  createdAt: string; // ISO string format
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: 'cash' | 'bank' | 'credit_card' | 'e_wallet' | 'savings';
  balance: string; // Using string to match the decimal type from the database
  currency: string;
  isActive: boolean;
  createdAt: string; // ISO string format
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  type: 'income' | 'expense';
  createdAt: string; // ISO string format
}

export interface Budget {
  id: string;
  userId: string;
  walletId: string; // Source wallet for this budget
  categoryId: string | null;
  name: string | null;
  description: string | null;
  allocatedAmount: string; // Amount allocated to this budget
  remainingAmount: string; // Amount remaining in this budget
  currency: string;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string; // ISO date format
  endDate: string; // ISO date format
  isActive: boolean;
  createdAt: string; // ISO string format
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  targetAmount: string; // Using string to match the decimal type from the database
  currentAmount: string; // Current progress amount
  currency: string;
  targetDate: string | null; // ISO date format
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  walletId: string | null; // Optional linked wallet
  isActive: boolean;
  createdAt: string; // ISO string format
}
