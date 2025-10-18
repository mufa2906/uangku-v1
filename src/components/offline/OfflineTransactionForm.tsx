// src/components/offline/OfflineTransactionForm.tsx
// Component for creating offline transactions

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { IndexedDBStorage } from '@/lib/indexeddb-storage';
import { useToast } from '@/components/ui/toast';
import { Database, FileText, RefreshCw } from 'lucide-react';

interface OfflineTransaction {
  type: 'income' | 'expense';
  amount: string;
  note: string;
  date: string;
  categoryId?: string;
  walletId?: string;
}

export default function OfflineTransactionForm() {
  const [formData, setFormData] = useState<OfflineTransaction>({
    type: 'expense',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    walletId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.note) {
      addToast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add to offline storage using IndexedDB
      const localId = await IndexedDBStorage.addOfflineTransaction({
        type: formData.type,
        amount: parseFloat(formData.amount),
        note: formData.note,
        date: formData.date,
        categoryId: formData.categoryId,
        walletId: formData.walletId
      });

      if (localId) {
        addToast({
          title: 'Success',
          description: 'Transaction saved for later sync',
          type: 'success'
        });

        // Reset form
        setFormData({
          type: 'expense',
          amount: '',
          note: '',
          date: new Date().toISOString().split('T')[0],
          categoryId: '',
          walletId: ''
        });
      } else {
        throw new Error('Failed to save transaction');
      }
    } catch (error) {
      console.error('Error saving offline transaction:', error);
      addToast({
        title: 'Error',
        description: 'Failed to save transaction. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create Offline Transaction
        </CardTitle>
        <CardDescription>
          This transaction will sync automatically when you're back online
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="note">Note *</Label>
            <Input
              id="note"
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="What was this for?"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="walletId">Wallet</Label>
              <Select
                value={formData.walletId || ''}
                onValueChange={(value) => handleChange('walletId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={formData.categoryId || ''}
                onValueChange={(value) => handleChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="transport">Transportation</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="housing">Housing</SelectItem>
                  <SelectItem value="personal">Personal Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !formData.amount || !formData.note}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Save Offline Transaction
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}