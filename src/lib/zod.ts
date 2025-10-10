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

// Goal schemas
export const CreateGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().optional(),
  targetAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Target amount must be a valid number with up to 2 decimal places'),
  currency: z.string().length(3).default('IDR'),
  targetDate: z.string().optional(), // ISO date string
  walletId: z.string().uuid().optional().nullable(),
});

export const UpdateGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters').optional(),
  description: z.string().optional(),
  targetAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Target amount must be a valid number with up to 2 decimal places').optional(),
  currentAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Current amount must be a valid number with up to 2 decimal places').optional(),
  targetDate: z.string().optional(), // ISO date string
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
  walletId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
});
// Bill schemas  
export const CreateBillSchema = z.object({  
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),  
  description: z.string().optional(),  
  amount: z.string().regex(/\\\\\d+(\\\\.\\\\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places'),  
  currency: z.string().length(3).default('IDR'),  
  dueDate: z.string().min(1, 'Due date is required'), // ISO date string  
  nextDueDate: z.string().min(1, 'Next due date is required'), // ISO date string  
  recurrencePattern: z.enum(['weekly', 'monthly', 'yearly', 'custom']).optional(),  
  recurrenceInterval: z.string().regex(/\\\\\d+$/, 'Recurrence interval must be a number').optional(),  
  autoNotify: z.boolean().optional().default(true),  
  notifyDaysBefore: z.string().regex(/\\\\\d+$/, 'Notify days before must be a number').optional().default('3'),  
  walletId: z.string().uuid().optional().nullable(),  
  categoryId: z.string().uuid().optional().nullable(),  
});  
  
export const UpdateBillSchema = z.object({  
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),  
  description: z.string().optional().nullable(),  
  amount: z.string().regex(/\\\\\d+(\\\\.\\\\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places').optional(),  
  currency: z.string().length(3).optional(),  
  dueDate: z.string().optional(), // ISO date string  
  nextDueDate: z.string().optional(), // ISO date string  
  recurrencePattern: z.enum(['weekly', 'monthly', 'yearly', 'custom']).optional(),  
  recurrenceInterval: z.string().regex(/\\\\\d+$/, 'Recurrence interval must be a number').optional(),  
  autoNotify: z.boolean().optional(),  
  notifyDaysBefore: z.string().regex(/\\\\\d+$/, 'Notify days before must be a number').optional(),  
  walletId: z.string().uuid().optional().nullable(),  
  categoryId: z.string().uuid().optional().nullable(),  
  isPaid: z.boolean().optional(),  
  paidDate: z.string().optional(), // ISO date string  
  isActive: z.boolean().optional(),  
}); 
