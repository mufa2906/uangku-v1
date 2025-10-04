// src/lib/zod.ts
import { z } from 'zod';

export const TransactionSchema = z.object({
  categoryId: z.string().uuid(),
  type: z.enum(['income', 'expense']),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places'),
  note: z.string().optional(),
  date: z.string().datetime(),
});

export const CreateTransactionSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  type: z.enum(['income', 'expense']),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places'),
  note: z.string().optional(),
  date: z.string().datetime(),
});

export const UpdateTransactionSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
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