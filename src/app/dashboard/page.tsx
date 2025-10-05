// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Transaction } from '@/types';
import WeeklyBarChart from '@/components/charts/WeeklyBar';
import { FloatingButton } from '@/components/ui/floating-button';
import { Plus } from 'lucide-react';
import TransactionFormSheet from '@/components/transactions/TransactionFormSheet';
import AppBottomNav from '@/components/shells/AppBottomNav';
import { useCurrency } from '@/contexts/CurrencyContext';
import BudgetSummary from '@/components/budgets/BudgetSummary';

interface WeeklyDataPoint {
  date: string;
  income: number;
  expense: number;
}

interface InsightData {
  weeklySummary: WeeklyDataPoint[];
  totalIncome: number;
  totalExpense: number;
  net: number;
  weeklyTrend: {
    currentWeek: number;
    previousWeek: number;
    change: number;
    changePercentage: number;
  };
}

export default function DashboardPage() {
  const { userId } = useAuth();
  const { formatCurrency } = useCurrency();
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      // Fetch insights which includes transactions and summary
      const insightsRes = await fetch('/api/insights');
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        setInsights(insightsData);
      }

      // Fetch recent transactions
      const transactionsRes = await fetch(`/api/transactions?limit=5`);
      if (transactionsRes.ok) {
        const { transactions: fetchedTransactions } = await transactionsRes.json();
        setTransactions(fetchedTransactions);
      }

      // Fetch categories
      const categoriesRes = await fetch('/api/categories');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setIsSheetOpen(true);
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
        await fetchDashboardData(); // Refresh data
      } else {
        console.error('Error saving transaction:', await response.text());
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (!insights) {
    return (
      <div className="pb-20">
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <p className="text-center py-10 text-gray-500">Loading dashboard...</p>
        </div>
        <AppBottomNav />
      </div>
    );
  }

  return (
    <div className="pb-20"> {/* Space for bottom nav */}
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(insights.totalIncome)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(insights.totalExpense)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${insights.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(insights.net)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Summary */}
        <div className="mb-6">
          <BudgetSummary />
        </div>

        {/* Weekly Trend Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Weekly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className={`text-lg font-semibold ${insights.weeklyTrend.currentWeek >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(insights.weeklyTrend.currentWeek)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">vs Last Week</p>
                <p className={`text-lg font-semibold ${insights.weeklyTrend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(insights.weeklyTrend.change)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Change</p>
                <p className={`text-lg font-semibold ${insights.weeklyTrend.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(insights.weeklyTrend.changePercentage)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyBarChart data={insights.weeklySummary} />
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet. Add your first transaction!</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(transaction => (
                  <div 
                    key={transaction.id} 
                    className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded"
                  >
                    <div>
                      <div className="font-medium">
                        {transaction.categoryName || 'Uncategorized'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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