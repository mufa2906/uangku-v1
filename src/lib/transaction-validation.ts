import { z } from 'zod';

// Zod schema for transaction form validation
export const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'Transaction type is required',
  }),
  walletId: z.string().min(1, 'Wallet selection is required'),
  categoryId: z.string().min(1, 'Category selection is required'),
  budgetId: z.string().optional(),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: 'Valid amount is required',
    }
  ),
  note: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
});

// Type inference from Zod schema
export type TransactionFormData = z.infer<typeof transactionFormSchema>;

// Validation function that returns formatted errors
export const validateTransactionForm = (data: any) => {
  try {
    transactionFormSchema.parse(data);
    return { success: true, errors: [], data: transactionFormSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { success: false, errors };
    }
    return { success: false, errors: [{ field: 'unknown', message: 'Validation failed' }] };
  }
};

// Function to check if form is valid without returning errors
export const isTransactionFormValid = (data: any): boolean => {
  try {
    transactionFormSchema.parse(data);
    return true;
  } catch (error) {
    return false;
  }
};