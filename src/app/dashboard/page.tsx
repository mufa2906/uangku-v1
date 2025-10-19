// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Transaction, Budget, Wallet, Bill } from '@/types';
import WeeklyBarChart from '@/components/charts/WeeklyBar';
import { FloatingButton } from '@/components/ui/floating-button';
import { Plus, AlertCircle, Calendar, Clock, TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';
import TransactionFormSheet from '@/components/transactions/TransactionFormSheet';
import AppBottomNav from '@/components/shells/AppBottomNav';
import { useCurrency } from '@/contexts/CurrencyContext';
import BudgetSummary from '@/components/budgets/BudgetSummary';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Define a type for bill data returned from the API that includes joined fields
interface BillWithJoins extends Bill {
  walletName?: string | null;
  categoryName?: string | null;
}

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

// Define analytical data types
interface AnalyticalData {
  highestTransactions: Transaction[];
  lowestTransactions: Transaction[];
  topCategories: { name: string; amount: number; count: number }[];
  totalSpendingByPeriod: number;
  totalIncomeByPeriod: number;
  periodLabel: string;
}

export default function DashboardPage() {
  const { userId } = useAuth();
  const { formatCurrency } = useCurrency();
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]); // Add budgets state
  const [wallets, setWallets] = useState<Wallet[]>([]); // Add wallets state
  const [bills, setBills] = useState<BillWithJoins[]>([]); // Add bills state with proper typing
  const [analyticalData, setAnalyticalData] = useState<AnalyticalData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  // Add state for date range selection
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
      fetchBudgets(); // Fetch budgets as well
      fetchWallets(); // Fetch wallets as well
      fetchBills(); // Fetch bills as well
    }
  }, [userId]);

  // Fetch analytical data when date range changes
  useEffect(() => {
    if (userId && (dateRange !== 'custom' || (customStartDate && customEndDate))) {
      fetchAnalyticalData();
    }
  }, [dateRange, customStartDate, customEndDate, userId]);

  const fetchDashboardData = async () => {
    try {
      // Fetch insights which includes transactions and summary
      const insightsRes = await fetch('/api/insights');
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        setInsights(insightsData);
      }

      // Fetch all transactions for analytics (not just recent ones)
      const transactionsRes = await fetch('/api/transactions');
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
      
      // Fetch analytical data
      await fetchAnalyticalData();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchAnalyticalData = async () => {
    try {
      // Build query parameters based on selected date range
      let queryParams = '';
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        queryParams = `?startDate=${customStartDate}&endDate=${customEndDate}`;
      } else {
        queryParams = `?period=${dateRange}`;
      }

      const analyticsRes = await fetch(`/api/analytics${queryParams}`);
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalyticalData(data);
      }
    } catch (error) {
      console.error('Error fetching analytical data:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/wallets');
      if (response.ok) {
        const data = await response.json();
        setWallets(data);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills?upcomingOnly=true');
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const getTotalWalletBalance = () => {
    return wallets.reduce((total, wallet) => {
      return total + parseFloat(wallet.balance || '0');
    }, 0);
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setIsSheetOpen(true);
  };

  const handleSubmitTransaction = async (data: any) => {
    try {
      setError(null); // Clear any previous errors
      
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
        await fetchBudgets(); // Refresh budgets as well
        await fetchWallets(); // Refresh wallets as well
        await fetchBills(); // Refresh bills as well
        setIsSheetOpen(false);
      } else {
        const errorText = await response.text();
        let errorMessage = 'Failed to save transaction';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorText;
        } catch (parseError) {
          errorMessage = errorText;
        }
        
        setError(`Error saving transaction: ${errorMessage}`);
        console.error('Error saving transaction:', errorMessage);
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Network error occurred';
      setError(`Error saving transaction: ${errorMessage}`);
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
    <ProtectedRoute>
      <div className="pb-20"> {/* Space for bottom nav */}
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

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

          {/* Wallet Balance Card */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(getTotalWalletBalance())}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Across {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}
              </p>
            </CardContent>
          </Card>

          {/* Budget Summary */}
          <div className="mb-6">
            <BudgetSummary />
          </div>

          {/* Upcoming Bills */}
          {bills.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Upcoming Bills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bills
                    .filter(bill => !bill.isPaid) // Only show unpaid bills
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) // Sort by due date
                    .slice(0, 5) // Show only first 5 bills
                    .map(bill => {
                      const dueDate = new Date(bill.dueDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const billDate = new Date(bill.dueDate);
                      billDate.setHours(0, 0, 0, 0);
                      
                      const timeDiff = billDate.getTime() - today.getTime();
                      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
                      
                      let statusColor = 'text-gray-600';
                      if (daysLeft < 0) {
                        statusColor = 'text-red-600';
                      } else if (daysLeft <= 3) {
                        statusColor = 'text-yellow-600';
                      } else if (daysLeft <= 7) {
                        statusColor = 'text-blue-600';
                      }
                      
                      return (
                        <div 
                          key={bill.id} 
                          className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 rounded"
                        >
                          <div>
                            <div className="font-medium">{bill.name}</div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{dueDate.toLocaleDateString()}</span>
                              {daysLeft >= 0 && (
                                <span className={`ml-2 ${statusColor}`}>
                                  {daysLeft === 0 ? 'Due today' : 
                                   daysLeft === 1 ? `Due tomorrow` : 
                                   `Due in ${daysLeft} days`}
                                </span>
                              )}
                              {daysLeft < 0 && (
                                <span className="ml-2 text-red-600">Overdue</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(parseFloat(bill.amount))}</div>
                            <div className="text-sm text-gray-500">{(bill as BillWithJoins).walletName || 'Wallet'}</div>
                          </div>
                        </div>
                      );
                    })}
                  {bills.filter(bill => !bill.isPaid).length > 5 && (
                    <div className="text-center pt-2">
                      <span className="text-sm text-gray-500">
                        + {bills.filter(bill => !bill.isPaid).length - 5} more bills
                      </span>
                    </div>
                  )}
                  {bills.filter(bill => !bill.isPaid).length === 0 && (
                    <p className="text-gray-500 text-center py-2">No upcoming bills</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Analytical Insights with Date Range Selector */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Period Analytics</CardTitle>
              <div className="flex gap-2">
                <select
                  className="border rounded-md px-2 py-1 text-sm"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'year' | 'custom')}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
                
                {dateRange === 'custom' && (
                  <>
                    <input
                      type="date"
                      className="border rounded-md px-2 py-1 text-sm"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="border rounded-md px-2 py-1 text-sm"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {analyticalData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Highest Transactions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          Highest Transactions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analyticalData.highestTransactions.length > 0 ? (
                          <div className="space-y-2">
                            {analyticalData.highestTransactions.slice(0, 3).map((transaction, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-500 mr-2">#{index + 1}</span>
                                  <div>
                                    <div className="font-medium">{transaction.note || transaction.categoryName || 'No note'}</div>
                                    <div className="text-xs text-gray-500">{transaction.categoryName}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-red-600">
                                    -{formatCurrency(parseFloat(transaction.amount))}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(transaction.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No transactions in this period</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Lowest Transactions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          Lowest Transactions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analyticalData.lowestTransactions.length > 0 ? (
                          <div className="space-y-2">
                            {analyticalData.lowestTransactions.slice(0, 3).map((transaction, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-500 mr-2">#{index + 1}</span>
                                  <div>
                                    <div className="font-medium">{transaction.note || transaction.categoryName || 'No note'}</div>
                                    <div className="text-xs text-gray-500">{transaction.categoryName}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-red-600">
                                    -{formatCurrency(parseFloat(transaction.amount))}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(transaction.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No transactions in this period</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Categories */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Top Spending Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticalData.topCategories.length > 0 ? (
                        <div className="space-y-3">
                          {analyticalData.topCategories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-500 mr-3">#{index + 1}</span>
                                <span className="font-medium">{category.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {formatCurrency(category.amount)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {category.count} {category.count === 1 ? 'transaction' : 'transactions'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No spending data in this period</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Loading analytics...</p>
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
          budgets={budgets}
          wallets={wallets}
        />

        {/* Bottom Navigation */}
        <AppBottomNav />
      </div>
    </ProtectedRoute>
  );
}