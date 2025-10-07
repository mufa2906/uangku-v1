// src/lib/zod.ts
import { z } from 'zod';

export const TransactionSchema = z.object({
  walletId: z.string().uuid(),
  categoryId: z.string().uuid(),
  type: z.enum(['income', 'expense']),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places'),
  note: z.string().optional(),
  date: z.string().datetime(),
});

export const CreateTransactionSchema = z.object({
  walletId: z.string().uuid({ message: "Wallet ID must be a valid UUID" }),
  categoryId: z.string().uuid().optional().nullable(),
  budgetId: z.string().uuid().optional().nullable(), // Optional budget reference
  type: z.enum(['income', 'expense']),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places'),
  note: z.string().optional(),
  date: z.string().datetime(),
});

export const UpdateTransactionSchema = z.object({
  walletId: z.string().uuid({ message: "Wallet ID must be a valid UUID" }).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  budgetId: z.string().uuid().optional().nullable(), // Optional budget reference
  type: z.enum(['income', 'expense']).optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places').optional(),
  note: z.string().optional().nullable(),
  date: z.string().datetime().optional(),
});

export const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  icon: z.string().optional(),
  type: z.enum(['income', 'expense']),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  icon: z.string().optional(),
  type: z.enum(['income', 'expense']),
});

export const UpdateCategorySchema = z.object({
  name: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  type: z.enum(['income', 'expense']).optional(),
});

// Wallet schemas
export const CreateWalletSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  type: z.enum(['cash', 'bank', 'credit_card', 'e_wallet', 'savings']),
  currency: z.string().length(3).default('IDR'),
  balance: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Balance must be a valid number with up to 2 decimal places').optional().default('0'),
});

export const UpdateWalletSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  type: z.enum(['cash', 'bank', 'credit_card', 'e_wallet', 'savings']).optional(),
  currency: z.string().length(3).optional(),
  balance: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Balance must be a valid number with up to 2 decimal places').optional(),
  isActive: z.boolean().optional(),
});

// Budget schemas
export const CreateBudgetSchema = z.object({
  walletId: z.string().uuid({ message: "Wallet ID must be a valid UUID" }),
  categoryId: z.string().uuid().optional().nullable(),
  name: z.string().max(100).optional(), // For custom budget names
  description: z.string().optional(),
  allocatedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Allocated amount must be a valid number with up to 2 decimal places'),
  currency: z.string().length(3).default('IDR'),
  period: z.enum(['weekly', 'monthly', 'yearly']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

export const UpdateBudgetSchema = z.object({
  walletId: z.string().uuid({ message: "Wallet ID must be a valid UUID" }).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  name: z.string().max(100).optional(),
  description: z.string().optional(),
  allocatedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Allocated amount must be a valid number with up to 2 decimal places').optional(),
  period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
});