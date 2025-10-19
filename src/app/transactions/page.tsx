'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Transaction, Category, Budget, Wallet } from '@/types';
import { FloatingButton } from '@/components/ui/floating-button';
import { Plus, Search, AlertCircle, Calendar, CalendarDays } from 'lucide-react';
import TransactionFormSheet from '@/components/transactions/TransactionFormSheet';
import AppBottomNav from '@/components/shells/AppBottomNav';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/contexts/PWAContext';
import { useOfflineSync } from '@/hooks/useOfflineSync'; // Add this import
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Define the API response type
type TransactionApiResponse = {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

// Define period types
type PeriodType = 'daily' | 'weekly' | 'monthly';

// Define grouped transaction type
type GroupedTransaction = {
  period: string;
  date: Date;
  transactions: Transaction[];
  total: number;
};

export default function TransactionsPage() {
  const { userId } = useAuth();
  const { formatCurrency } = useCurrency();
  const { isOnline } = usePWA(); // PWA context for online status
  const { pendingTransactions, syncPendingTransactions } = useOfflineSync(); // Offline sync hook
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterBudget, setFilterBudget] = useState<string>('all'); // 'all' or specific budget ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (userId) {
      fetchTransactionsAndCategories();
    }
  }, [userId]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingTransactions > 0) {
      syncPendingTransactions();
    }
  }, [isOnline, pendingTransactions, syncPendingTransactions]);

  const fetchTransactionsAndCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch transactions
      const transactionsRes = await fetch('/api/transactions');
      if (!transactionsRes.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const transactionsData: TransactionApiResponse = await transactionsRes.json();
      
      // Fetch categories
      const categoriesRes = await fetch('/api/categories');
      if (!categoriesRes.ok) {
        throw new Error('Failed to fetch categories');
      }
      const categoriesData = await categoriesRes.json();
      
      // Fetch budgets
      const budgetsRes = await fetch('/api/budgets');
      if (!budgetsRes.ok) {
        throw new Error('Failed to fetch budgets');
      }
      const budgetsData = await budgetsRes.json();
      
      // Fetch wallets
      const walletsRes = await fetch('/api/wallets');
      if (!walletsRes.ok) {
        throw new Error('Failed to fetch wallets');
      }
      const walletsData = await walletsRes.json();
      
      setTransactions(transactionsData.transactions);
      setCategories(categoriesData);
      setBudgets(budgetsData);
      setWallets(walletsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setIsSheetOpen(true);
  };

  const handleSubmitTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'categoryName' | 'budgetName' | 'walletName'>) => {
    try {
      // Clear any previous errors
      setError(null);
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      const newTransaction = await response.json();
      setTransactions([newTransaction, ...transactions]); // Add new transaction to the top
      
      // Refresh all data to update balances
      await fetchTransactionsAndCategories();
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsSheetOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete transaction');
      }

      setTransactions(transactions.filter(transaction => transaction.id !== id));
      
      // Refresh all data to update balances
      await fetchTransactionsAndCategories();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  };

  const handleUpdateTransaction = async (data: Partial<Transaction>) => {
    if (!selectedTransaction) return;
    
    try {
      const response = await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update transaction');
      }

      const updatedTransaction = await response.json();
      setTransactions(transactions.map(t => t.id === selectedTransaction.id ? updatedTransaction : t));
      
      // Refresh all data to update balances
      await fetchTransactionsAndCategories();
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
    }
  };

  // Function to format period based on type
  const formatPeriod = (date: Date, periodType: PeriodType): string => {
    switch (periodType) {
      case 'daily':
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'weekly':
        // Calculate the start of the week (Sunday)
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return `Week of ${startOfWeek.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
      default:
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
    }
  };

  // Function to group transactions by period
  const groupTransactionsByPeriod = (transactions: Transaction[], periodType: PeriodType): GroupedTransaction[] => {
    const groupedMap = new Map<string, { transactions: Transaction[]; total: number }>();
    
    // Group transactions by period first
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const periodKey = formatPeriod(date, periodType);
      
      if (!groupedMap.has(periodKey)) {
        groupedMap.set(periodKey, { transactions: [], total: 0 });
      }
      
      const group = groupedMap.get(periodKey)!;
      group.transactions.push(transaction);
      
      const amount = parseFloat(transaction.amount);
      group.total += transaction.type === 'expense' ? -amount : amount;
    });
    
    // Convert map to array and process each group
    const result: GroupedTransaction[] = [];
    groupedMap.forEach((value, key) => {
      // Sort transactions within each group by date (most recent first)
      const sortedGroupTransactions = value.transactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Calculate the most recent transaction date for this group to sort periods
      let periodDate = new Date();
      if (sortedGroupTransactions.length > 0) {
        periodDate = new Date(sortedGroupTransactions[0].date); // Most recent transaction in the group
      }
      
      result.push({
        period: key,
        date: periodDate,
        transactions: sortedGroupTransactions,
        total: value.total
      });
    });
    
    // Sort the periods by date (most recent first)
    result.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return result;
  };

  // Filter transactions based on search, type, and budget, then sort by createdAt (most recent first)
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            transaction.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesBudget = filterBudget === 'all' || transaction.budgetId === filterBudget;
      
      return matchesSearch && matchesType && matchesBudget;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by creation time descending (newest first)

  // Group transactions by the selected period
  const [periodType, setPeriodType] = useState<PeriodType>('daily');
  const groupedTransactions = groupTransactionsByPeriod(filteredTransactions, periodType);

  return (
    <ProtectedRoute>
      <div className="pb-24 min-h-screen"> {/* Space for bottom nav with extra padding */}
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold w-full">Transactions</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative w-full">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-8 pr-4 py-2 border rounded-md w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border rounded-md px-3 py-2 w-full sm:w-auto"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select
                className="border rounded-md px-3 py-2 w-full sm:w-auto"
                value={filterBudget}
                onChange={(e) => setFilterBudget(e.target.value)}
              >
                <option value="all">All Budgets</option>
                {budgets.map(budget => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name || 'Unnamed Budget'}
                  </option>
                ))}
              </select>
              <select
                className="border rounded-md px-3 py-2 w-full sm:w-auto"
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as PeriodType)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading transactions...</div>
          ) : groupedTransactions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-500">
                <p>No transactions found.</p>
                <p className="mt-2">Add your first transaction to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {groupedTransactions.map((group) => (
                <div key={group.period} className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-blue-500" />
                      {group.period}
                    </h3>
                    <div className={`text-lg font-bold ${group.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {group.total >= 0 ? '+' : ''}{formatCurrency(Math.abs(group.total))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {group.transactions.map(transaction => (
                      <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate">
                                {transaction.categoryName || 'Uncategorized'}
                              </div>
                              <div className="text-sm text-gray-600 truncate mt-1">
                                {transaction.note || 'No note'}
                              </div>
                            </div>
                            <div className="flex flex-col items-end min-w-0">
                              <div className={`font-medium text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                              </div>
                              <div className="flex gap-3 mt-2">
                                <button 
                                  onClick={() => handleEditTransaction(transaction)}
                                  className="text-blue-500 hover:text-blue-700 text-sm"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  className="text-red-500 hover:text-red-700 text-sm"
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
                </div>
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
          onSubmit={selectedTransaction ? handleUpdateTransaction : handleSubmitTransaction}
          transaction={selectedTransaction}
          categories={categories}
          budgets={budgets}
          wallets={wallets}
        />

        {/* Bottom Navigation */}
        <AppBottomNav />
      </div>
    </ProtectedRoute>
  );
}