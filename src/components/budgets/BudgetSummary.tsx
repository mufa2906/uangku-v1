// src/components/budgets/BudgetSummary.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@clerk/nextjs';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface BudgetSummaryItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryType: string;
  budgetAmount: number;
  spentAmount: number;
  currency: string;
  period: string;
  percentageUsed: number;
  remainingAmount: number;
}

export default function BudgetSummary() {
  const { userId } = useAuth();
  const { formatCurrency } = useCurrency();
  const [budgetSummaries, setBudgetSummaries] = useState<BudgetSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchBudgetSummaries();
    }
  }, [userId]);

  const fetchBudgetSummaries = async () => {
    try {
      setLoading(true);
      
      // For now, we'll simulate the data since we don't have the real API endpoint yet
      // In a real implementation, this would fetch from /api/budgets/summary
      const mockData: BudgetSummaryItem[] = [
        {
          id: '1',
          categoryId: '1',
          categoryName: 'Food & Dining',
          categoryType: 'expense',
          budgetAmount: 1500000,
          spentAmount: 950000,
          currency: 'IDR',
          period: 'monthly',
          percentageUsed: 63.3,
          remainingAmount: 550000,
        },
        {
          id: '2',
          categoryId: '2',
          categoryName: 'Transportation',
          categoryType: 'expense',
          budgetAmount: 800000,
          spentAmount: 750000,
          currency: 'IDR',
          period: 'monthly',
          percentageUsed: 93.8,
          remainingAmount: 50000,
        },
        {
          id: '3',
          categoryId: '3',
          categoryName: 'Entertainment',
          categoryType: 'expense',
          budgetAmount: 500000,
          spentAmount: 300000,
          currency: 'IDR',
          period: 'monthly',
          percentageUsed: 60.0,
          remainingAmount: 200000,
        },
      ];
      
      setBudgetSummaries(mockData);
    } catch (err) {
      console.error('Error fetching budget summaries:', err);
      setError('Failed to load budget summaries');
    } finally {
      setLoading(false);
    }
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'good';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-gray-500">Loading budget data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4 text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budgetSummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-gray-500">
            No active budgets. Create your first budget to start tracking your spending.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgetSummaries.map((budget) => {
            const status = getBudgetStatus(budget.percentageUsed);
            
            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {getStatusIcon(status)}
                    <span className="ml-2 font-medium">{budget.categoryName}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.budgetAmount)}
                  </span>
                </div>
                
                <Progress 
                  value={budget.percentageUsed} 
                  className={
                    status === 'critical' 
                      ? 'bg-red-200 [&>div]:bg-red-500' 
                      : status === 'warning' 
                        ? 'bg-yellow-200 [&>div]:bg-yellow-500' 
                        : '[&>div]:bg-green-500'
                  } 
                />
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{budget.percentageUsed.toFixed(0)}% used</span>
                  <span>{formatCurrency(budget.remainingAmount)} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            {budgetSummaries.some(b => getBudgetStatus(b.percentageUsed) === 'critical') 
              ? '⚠️ You\'re exceeding some budgets!' 
              : budgetSummaries.some(b => getBudgetStatus(b.percentageUsed) === 'warning') 
                ? '⚠️ Watch your spending in some categories' 
                : '✓ You\'re doing great with your budgets!'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}