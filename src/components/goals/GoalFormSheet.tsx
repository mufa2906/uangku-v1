// src/components/goals/GoalFormSheet.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Goal, Wallet } from '@/types';

interface GoalFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Goal>) => void;
  goal?: Goal | null;
  wallets: Wallet[];
}

export default function GoalFormSheet({ 
  open, 
  onOpenChange, 
  onSubmit, 
  goal,
  wallets
}: GoalFormSheetProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '0',
    currency: 'IDR',
    targetDate: '',
    status: 'active' as 'active' | 'paused' | 'completed' | 'cancelled',
    walletId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        description: goal.description || '',
        targetAmount: parseFloat(goal.targetAmount).toString(),
        currentAmount: parseFloat(goal.currentAmount).toString(),
        currency: goal.currency,
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
        status: goal.status,
        walletId: goal.walletId || '',
      });
    } else {
      // Reset form for new goal
      setFormData({
        name: '',
        description: '',
        targetAmount: '',
        currentAmount: '0',
        currency: 'IDR',
        targetDate: '',
        status: 'active',
        walletId: '',
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        targetDate: formData.targetDate || null,
        walletId: formData.walletId || null,
        description: formData.description || null,
      };

      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {goal ? 'Edit Goal' : 'Create New Goal'}
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
              placeholder="e.g., Emergency Fund, New Car"
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
              placeholder="Optional description for your goal"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetAmount" className="text-right">
              Target Amount *
            </Label>
            <Input
              id="targetAmount"
              name="targetAmount"
              type="number"
              step="0.01"
              value={formData.targetAmount}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="0.00"
              required
            />
          </div>

          {goal && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentAmount" className="text-right">
                Current Amount
              </Label>
              <Input
                id="currentAmount"
                name="currentAmount"
                type="number"
                step="0.01"
                value={formData.currentAmount}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currency" className="text-right">
              Currency
            </Label>
            <Select 
              value={formData.currency} 
              onValueChange={(value) => handleSelectChange('currency', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">IDR (Indonesian Rupiah)</SelectItem>
                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                <SelectItem value="SGD">SGD (Singapore Dollar)</SelectItem>
                <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                <SelectItem value="MYR">MYR (Malaysian Ringgit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetDate" className="text-right">
              Target Date
            </Label>
            <Input
              id="targetDate"
              name="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="walletId" className="text-right">
              Linked Wallet
            </Label>
            <Select 
              value={formData.walletId} 
              onValueChange={(value) => handleSelectChange('walletId', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Optional - link to a wallet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No wallet linked</SelectItem>
                {wallets.map(wallet => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {goal && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value as any)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}