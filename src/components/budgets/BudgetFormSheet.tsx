// src/components/budgets/BudgetFormSheet.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, Budget, Wallet } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';

interface BudgetFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Budget>) => void;
  budget?: Budget | null;
  categories: Category[];
  wallets: Wallet[]; // Add wallets prop
}

export default function BudgetFormSheet({
  open,
  onOpenChange,
  onSubmit,
  budget,
  categories,
  wallets,
}: BudgetFormSheetProps) {
  const { currency } = useCurrency();
  const [formData, setFormData] = useState({
    walletId: '',
    categoryId: '',
    name: '',
    description: '',
    allocatedAmount: '',
    currency: currency,
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualEndDate, setManualEndDate] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (budget) {
      setFormData({
        walletId: budget.walletId,
        categoryId: budget.categoryId || '',
        name: budget.name || '',
        description: budget.description || '',
        allocatedAmount: parseFloat(budget.allocatedAmount).toString(),
        currency: budget.currency,
        period: budget.period,
        startDate: budget.startDate.split('T')[0],
        endDate: budget.endDate.split('T')[0],
        isActive: budget.isActive,
      });
    } else {
      // Reset form for new budget
      const today = new Date();
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
      setFormData({
        walletId: '',
        categoryId: '',
        name: '',
        description: '',
        allocatedAmount: '',
        currency: currency,
        period: 'monthly',
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        isActive: true,
      });
    }
    // Reset manual end date flag when opening form
    setManualEndDate(false);
  }, [budget, currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty categoryId - only include if it has a valid value
      const { categoryId, allocatedAmount, ...rest } = formData;
      const submitData = {
        ...rest,
        ...(categoryId && categoryId !== '' ? { categoryId } : {}), // Only include categoryId if it has a non-empty value
        allocatedAmount: allocatedAmount,
      };

      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Set manualEndDate flag when endDate is changed manually
    if (name === 'endDate') {
      setManualEndDate(true);
    }
    
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

  // Auto-calculate end date based on period and start date only if not manually changed
  useEffect(() => {
    // Only auto-calculate if end date hasn't been manually changed
    if (!manualEndDate) {
      const startDate = new Date(formData.startDate);
      let endDate = new Date(startDate);

      switch (formData.period) {
        case 'weekly':
          endDate.setDate(startDate.getDate() + 6);
          break;
        case 'monthly':
          endDate.setMonth(startDate.getMonth() + 1);
          endDate.setDate(0); // Last day of the month
          break;
        case 'yearly':
          endDate.setFullYear(startDate.getFullYear() + 1);
          endDate.setDate(startDate.getDate() - 1); // Day before next year
          break;
      }

      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.period, formData.startDate, manualEndDate]);

  // Reset manual flag when period or start date changes
  useEffect(() => {
    setManualEndDate(false);
  }, [formData.period, formData.startDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {budget ? 'Edit Budget' : 'Create Budget'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Budget name (e.g., Travel Fund)"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="walletId" className="text-right">
              Source Wallet
            </Label>
            <Select 
              value={formData.walletId} 
              onValueChange={(value) => handleSelectChange('walletId', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select source wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map(wallet => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.type}) - {wallet.balance}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Optional description"
            />
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
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter(cat => cat.type === 'expense') // Typically budgets are for expenses
                  .map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="allocatedAmount" className="text-right">
              Allocated Amount
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {formData.currency}
              </span>
              <Input
                id="allocatedAmount"
                name="allocatedAmount"
                type="number"
                step="0.01"
                value={formData.allocatedAmount}
                onChange={handleInputChange}
                className="pl-12"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="period" className="text-right">
              Period
            </Label>
            <Select 
              value={formData.period} 
              onValueChange={(value) => handleSelectChange('period', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Active
            </Label>
            <div className="col-span-3 flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <Label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Budget is active
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