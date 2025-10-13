// src/components/transactions/TransactionFormSheet.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { Transaction, Category, Budget, Wallet } from '@/types';
import { useToast, toast } from '@/components/ui/toast';
import AiTransactionInput from '@/components/transactions/AiTransactionInput';
import { ParsedTransaction } from '@/lib/transaction-nlp';
import { TransactionLearning } from '@/lib/transaction-learning';
import { validateTransactionForm } from '@/lib/transaction-validation';

// Type for transaction data when submitting to the API
type TransactionSubmitData = Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'categoryName' | 'budgetName' | 'walletName'>;

interface TransactionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionSubmitData) => void;
  transaction?: Transaction | null;
  categories: Category[];
  budgets: Budget[]; // Add budgets prop
  wallets: Wallet[]; // Add wallets prop
}

export default function TransactionFormSheet({ 
  open, 
  onOpenChange, 
  onSubmit, 
  transaction,
  categories,
  budgets,
  wallets
}: TransactionFormSheetProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    walletId: '',
    categoryId: '',
    budgetId: '', // Optional budget reference
    type: 'expense' as 'income' | 'expense',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetClearedMessage, setBudgetClearedMessage] = useState<string | null>(null);
  const [showAiInput, setShowAiInput] = useState(false);

  // Check if the form is valid
  const isFormValid = () => {
    return formData.walletId !== '' && 
           formData.categoryId !== '' && 
           formData.amount !== '' && 
           parseFloat(formData.amount) > 0 && 
           formData.date !== '' && 
           (!formErrors.type && !formErrors.walletId && !formErrors.categoryId && !formErrors.amount && !formErrors.date);
  };

  // Populate form when editing
  useEffect(() => {
    if (transaction) {
      setFormData({
        walletId: transaction.walletId || '',
        categoryId: transaction.categoryId || '',
        budgetId: transaction.budgetId || '', // Optional budget reference
        type: transaction.type,
        amount: parseFloat(transaction.amount).toString(),
        note: transaction.note || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
      });
    } else {
      // Reset form for new transaction
      setFormData({
        walletId: '',
        categoryId: '',
        budgetId: '', // Optional budget reference
        type: 'expense',
        amount: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [transaction]);

  // Handle AI-parsed transaction
  const handleAiTransactionParsed = (parsed: ParsedTransaction) => {
    setFormData(prev => ({
      ...prev,
      note: parsed.description || prev.note,
      amount: parsed.amount ? parsed.amount.toString() : prev.amount,
      type: parsed.type || prev.type,
    }));
  };

  // Handle using AI-parsed transaction and store the pattern
  const handleUseParsedTransaction = (parsed: ParsedTransaction) => {
    setFormData(prev => ({
      ...prev,
      note: parsed.description || prev.note,
      amount: parsed.amount ? parsed.amount.toString() : prev.amount,
      type: parsed.type || prev.type,
    }));
    
    if (parsed.category) {
      // Find the category in our available categories
      const matchedCategory = categories.find(cat => 
        cat.name.toLowerCase() === parsed.category?.toLowerCase() ||
        cat.name.toLowerCase().includes(parsed.category?.toLowerCase() || '')
      );
      
      if (matchedCategory) {
        setFormData(prev => ({
          ...prev,
          categoryId: matchedCategory.id
        }));
      }
    }

    // Store the pattern for learning
    if (parsed.description && parsed.amount !== undefined && parsed.category) {
      TransactionLearning.storePattern({
        inputText: parsed.description,
        detectedAmount: parsed.amount,
        detectedCategory: parsed.category,
        detectedDescription: parsed.description,
        actualAmount: parsed.amount,
        actualCategory: parsed.category,
        actualDescription: parsed.description,
        confidence: parsed.confidence
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data using Zod schema
    const validation = validateTransactionForm(formData);
    
    if (!validation.success) {
      // Show validation errors
      validation.errors.forEach(error => {
        addToast(toast.error('Validation Error', error.message));
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Filter out empty budgetId - only include if it has a valid value
      const { budgetId, ...rest } = formData;
      const submitData = {
        ...rest,
        budgetId: budgetId || null, // Convert empty string to null
        amount: formData.amount,
        date: new Date(formData.date).toISOString(),
      };

      // Check if we're online
      // Always submit to server directly
      await onSubmit(submitData);
      
      // Clear form after successful submission
      setFormData({
        walletId: '',
        categoryId: '',
        budgetId: '',
        type: 'expense',
        amount: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
      });
      
      // Clear form errors
      setFormErrors({});
      
      // Close the sheet
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting transaction:', error);
      addToast(toast.error(
        'Submission Error',
        'There was an error saving your transaction. Please try again.'
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes with real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate the changed field in real-time
    const updatedData = { ...formData, [name]: value };
    const validation = validateTransactionForm(updatedData);
    
    if (!validation.success) {
      const fieldErrors = validation.errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>);
      setFormErrors(fieldErrors);
    } else {
      // Clear error for this field if valid
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate the changed field in real-time
    const updatedData = { ...formData, [name]: value };
    const validation = validateTransactionForm(updatedData);
    
    if (!validation.success) {
      const fieldErrors = validation.errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>);
      setFormErrors(fieldErrors);
    } else {
      // Clear error for this field if valid
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
        </DialogHeader>
        {budgetClearedMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">{budgetClearedMessage}</p>
          </div>
        )}
        
        {!transaction && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">AI Transaction Entry</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAiInput(!showAiInput)}
              >
                {showAiInput ? 'Hide AI Input' : 'Use AI Input'}
              </Button>
            </div>
            
            {showAiInput && (
              <AiTransactionInput
                categories={categories}
                wallets={wallets}
                onTransactionParsed={handleAiTransactionParsed}
                onUseParsedTransaction={handleUseParsedTransaction}
              />
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Type - determines transaction direction */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleSelectChange('type', value as 'income' | 'expense')}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.type && (
              <div className="col-span-3 col-start-2 mt-1 text-sm text-red-500">
                {formErrors.type}
              </div>
            )}
          </div>

          {/* Budget (optional) - financial goal or category budget */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budgetId" className="text-right">
              Budget
            </Label>
            <Select 
              value={formData.budgetId || ''} 
              onValueChange={(value) => {
                if (value) {
                  const selectedBudget = budgets.find(b => b.id === value);
                  if (selectedBudget) {
                    // Auto-select the wallet that belongs to this budget
                    setFormData(prev => ({
                      ...prev,
                      budgetId: value,
                      walletId: selectedBudget.walletId
                    }));
                  } else {
                    handleSelectChange('budgetId', value);
                  }
                } else {
                  handleSelectChange('budgetId', value);
                }
              }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select budget (optional)" />
              </SelectTrigger>
              <SelectContent>
                {budgets.map(budget => (
                  <SelectItem key={budget.id} value={budget.id}>
                    {budget.name || 'Unnamed Budget'} ({wallets.find(w => w.id === budget.walletId)?.name || 'Unknown Wallet'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.budgetId && (
              <div className="col-span-3 col-start-2 mt-1 text-sm text-red-500">
                {formErrors.budgetId}
              </div>
            )}
          </div>

          {/* Wallet - source/destination of funds */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="walletId" className="text-right">
              Wallet
            </Label>
            <Select 
              value={formData.walletId} 
              onValueChange={(value) => {
                // If there's already a budget selected that doesn't belong to this wallet, auto-clear it
                if (formData.budgetId) {
                  const selectedBudget = budgets.find(b => b.id === formData.budgetId);
                  if (selectedBudget && selectedBudget.walletId !== value) {
                    // Auto-clear the budget and show a friendly message
                    setFormData(prev => ({
                      ...prev,
                      walletId: value,
                      budgetId: '' // Clear the budget when changing to a different wallet
                    }));
                    const budgetName = selectedBudget.name || 'Unnamed Budget';
                    setBudgetClearedMessage(`Budget "${budgetName}" was cleared as it doesn't belong to the selected wallet.`);
                    setTimeout(() => setBudgetClearedMessage(null), 4000);
                    
                    // Show toast notification
                    addToast(toast.info(
                      'Budget Selection Cleared',
                      `"${budgetName}" was removed because it doesn't belong to the selected wallet.`,
                      4000
                    ));
                  } else {
                    handleSelectChange('walletId', value);
                  }
                } else {
                  handleSelectChange('walletId', value);
                }
                
                // Clear any errors for this field when value changes
                setFormErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.walletId;
                  return newErrors;
                });
              }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map(wallet => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.walletId && (
              <div className="col-span-3 col-start-2 mt-1 text-sm text-red-500">
                {formErrors.walletId}
              </div>
            )}
          </div>

          {/* Category - classification of transaction */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryId" className="text-right">
              Category
            </Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => handleSelectChange('categoryId', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter(cat => cat.type === formData.type)
                  .map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {formErrors.categoryId && (
              <div className="col-span-3 col-start-2 mt-1 text-sm text-red-500">
                {formErrors.categoryId}
              </div>
            )}
          </div>

          {/* Amount - monetary value of transaction */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
            {formErrors.amount && (
              <div className="col-span-3 col-start-2 mt-1 text-sm text-red-500">
                {formErrors.amount}
              </div>
            )}
          </div>

          {/* Note - description or details */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">
              Note
            </Label>
            <Input
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              className="col-span-3"
            />
            {formErrors.note && (
              <div className="col-span-3 col-start-2 mt-1 text-sm text-red-500">
                {formErrors.note}
              </div>
            )}
          </div>

          {/* Date - when transaction occurred */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
            {formErrors.date && (
              <div className="col-span-3 col-start-2 mt-1 text-sm text-red-500">
                {formErrors.date}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || Object.keys(formErrors).length > 0 || !isFormValid()}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}