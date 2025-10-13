// src/components/bills/BillFormSheet.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { Bill, Category, Wallet } from '@/types';
import { useToast, toast } from '@/components/ui/toast';
import { useCurrency } from '@/contexts/CurrencyContext';

interface BillFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Bill>) => void;
  bill?: Bill | null;
  categories: Category[];
  wallets: Wallet[];
}

export default function BillFormSheet({ 
  open, 
  onOpenChange, 
  onSubmit, 
  bill,
  categories,
  wallets
}: BillFormSheetProps) {
  const { user } = useAuth();
  const { currency, formatCurrency } = useCurrency();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    currency: currency,
    dueDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    nextDueDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    recurrencePattern: 'monthly' as 'weekly' | 'monthly' | 'yearly' | 'custom' | '',
    recurrenceInterval: '1',
    autoNotify: true,
    notifyDaysBefore: '3',
    walletId: '',
    categoryId: '',
    isPaid: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (bill) {
      setFormData({
        name: bill.name || '',
        description: bill.description || '',
        amount: bill.amount,
        currency: bill.currency,
        dueDate: bill.dueDate.split('T')[0], // Convert ISO to YYYY-MM-DD
        nextDueDate: bill.nextDueDate.split('T')[0], // Convert ISO to YYYY-MM-DD
        recurrencePattern: bill.recurrencePattern || '',
        recurrenceInterval: bill.recurrenceInterval || '1',
        autoNotify: bill.autoNotify,
        notifyDaysBefore: bill.notifyDaysBefore,
        walletId: bill.walletId || '',
        categoryId: bill.categoryId || '',
        isPaid: bill.isPaid,
      });
    } else {
      // Reset form for new bill
      setFormData({
        name: '',
        description: '',
        amount: '',
        currency: currency,
        dueDate: new Date().toISOString().split('T')[0],
        nextDueDate: new Date().toISOString().split('T')[0],
        recurrencePattern: 'monthly',
        recurrenceInterval: '1',
        autoNotify: true,
        notifyDaysBefore: '3',
        walletId: '',
        categoryId: '',
        isPaid: false,
      });
    }
  }, [bill, currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        amount: formData.amount,
        dueDate: new Date(formData.dueDate).toISOString(),
        nextDueDate: new Date(formData.nextDueDate).toISOString(),
        recurrenceInterval: formData.recurrencePattern !== 'custom' ? undefined : formData.recurrenceInterval,
        notifyDaysBefore: formData.autoNotify ? formData.notifyDaysBefore : '0', // If not auto notify, set to 0
        recurrencePattern: formData.recurrencePattern || null, // Ensure empty string becomes null
      };

      await onSubmit(submissionData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting bill:', error);
      addToast(toast.error('Error', 'Failed to save bill. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    const checked = target.type === 'checkbox' ? target.checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle recurrence pattern changes
  const handleRecurrenceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      recurrencePattern: value as any,
      // Set default interval based on pattern
      recurrenceInterval: value === 'weekly' ? '1' : 
                         value === 'monthly' ? '1' : 
                         value === 'yearly' ? '1' : prev.recurrenceInterval
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {bill ? 'Edit Bill Reminder' : 'Add Bill Reminder'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Add details about this bill..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount *
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
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date *
            </Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nextDueDate" className="text-right">
              Next Due Date *
            </Label>
            <Input
              id="nextDueDate"
              name="nextDueDate"
              type="date"
              value={formData.nextDueDate}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recurrencePattern" className="text-right">
              Recurrence
            </Label>
            <Select 
              value={formData.recurrencePattern} 
              onValueChange={handleRecurrenceChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select recurrence pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">One-time</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recurrencePattern && formData.recurrencePattern !== 'custom' && (
            <div className="grid grid-cols-4 items-center gap-4 ml-4">
              <Label htmlFor="recurrenceInterval" className="text-right text-sm text-gray-500">
                Every
              </Label>
              <div className="col-span-3 text-sm text-gray-500">
                {formData.recurrencePattern === 'weekly' && 'week'}
                {formData.recurrencePattern === 'monthly' && 'month'}
                {formData.recurrencePattern === 'yearly' && 'year'}
              </div>
            </div>
          )}

          {formData.recurrencePattern === 'custom' && (
            <div className="grid grid-cols-4 items-center gap-4 ml-4">
              <Label htmlFor="recurrenceInterval" className="text-right">
                Interval
              </Label>
              <Input
                id="recurrenceInterval"
                name="recurrenceInterval"
                type="number"
                min="1"
                value={formData.recurrenceInterval}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., 2 for every 2 months"
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="walletId" className="text-right">
              Wallet
            </Label>
            <Select 
              value={formData.walletId} 
              onValueChange={(value) => handleSelectChange('walletId', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select payment wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map(wallet => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryId" className="text-right">
              Category
            </Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => handleSelectChange('categoryId', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select expense category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter(cat => cat.type === 'expense')
                  .map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Auto Notify
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <input
                id="autoNotify"
                name="autoNotify"
                type="checkbox"
                checked={formData.autoNotify}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <Label htmlFor="autoNotify" className="text-sm text-gray-700">
                Send reminder before due date
              </Label>
            </div>
          </div>

          {formData.autoNotify && (
            <div className="grid grid-cols-4 items-center gap-4 ml-4">
              <Label htmlFor="notifyDaysBefore" className="text-right">
                Notify
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="notifyDaysBefore"
                  name="notifyDaysBefore"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.notifyDaysBefore}
                  onChange={handleInputChange}
                  className="w-20 mr-2"
                />
                <span className="text-sm text-gray-500">days before due date</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Status
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <input
                id="isPaid"
                name="isPaid"
                type="checkbox"
                checked={formData.isPaid}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <Label htmlFor="isPaid" className="text-sm text-gray-700">
                Mark as paid
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}