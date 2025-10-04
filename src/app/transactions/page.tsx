// src/app/transactions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Transaction, Category } from '@/types';
import { FloatingButton } from '@/components/ui/floating-button';
import { Plus, Search, Filter } from 'lucide-react';
import TransactionFormSheet from '@/components/transactions/TransactionFormSheet';
import AppBottomNav from '@/components/shells/AppBottomNav';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function TransactionsPage() {
  const { userId } = useAuth();
  const { formatCurrency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchTransactionsAndCategories();
    }
  }, [userId]);

  const fetchTransactionsAndCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch transactions
      const transactionsRes = await fetch('/api/transactions');
      if (transactionsRes.ok) {
        const { transactions: fetchedTransactions } = await transactionsRes.json();
        setTransactions(fetchedTransactions);
      }

      // Fetch categories
      const categoriesRes = await fetch('/api/categories');
      if (categoriesRes.ok) {
        const fetchedCategories = await categoriesRes.json();
        setCategories(fetchedCategories);
      }
    } catch (error) {
      console.error('Error fetching transactions and categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setIsSheetOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsSheetOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchTransactionsAndCategories(); // Refresh data
        } else {
          console.error('Error deleting transaction:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleSubmitTransaction = async (data: any) => {
    try {
      let response;
      if (selectedTransaction) {
        // Update transaction
        response = await fetch(`/api/transactions/${selectedTransaction.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create transaction
        response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }

      if (response.ok) {
        await fetchTransactionsAndCategories(); // Refresh data
        setIsSheetOpen(false);
      } else {
        console.error('Error saving transaction:', await response.text());
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  // Filter transactions based on search term and type
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          transaction.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="pb-20"> {/* Space for bottom nav */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="pl-8 pr-4 py-2 border rounded-md w-full max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              <p>No transactions found.</p>
              <p className="mt-2">Add your first transaction to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map(transaction => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {transaction.categoryName || 'Uncategorized'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.note || 'No note'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleEditTransaction(transaction)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingButton onClick={handleAddTransaction}>
        <Plus className="h-6 w-6" />
      </FloatingButton>

      {/* Transaction Form Sheet */}
      <TransactionFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleSubmitTransaction}
        transaction={selectedTransaction}
        categories={categories}
      />

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  );
}