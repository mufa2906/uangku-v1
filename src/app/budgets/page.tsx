// src/app/budgets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { FloatingButton } from '@/components/ui/floating-button';
import AppBottomNav from '@/components/shells/AppBottomNav';
import { Budget, Category, Wallet } from '@/types';
import BudgetFormSheet from '@/components/budgets/BudgetFormSheet';
import { Progress } from '@/components/ui/progress';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface BudgetWithCategory extends Budget {
  categoryName: string | null;
  categoryType: string | null;
}

interface BudgetSummary {
  id: string;
  userId: string;
  walletId: string;
  categoryId: string | null;
  name: string | null;
  description: string | null;
  allocatedAmount: string;
  remainingAmount: string;
  currency: string;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  categoryName: string | null;
  categoryType: string | null;
  spentAmount: number;
  percentageUsed: number;
}

export default function BudgetsPage() {
  const { userId } = useAuth();
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]); // Add wallets state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  useEffect(() => {
    if (userId) {
      fetchBudgetsAndCategories();
      fetchWallets(); // Fetch wallets as well
    }
  }, [userId]);

  const fetchBudgetsAndCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch categories first
      const categoriesResponse = await fetch('/api/categories');
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories');
      }
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);
      
      // Fetch budgets
      const budgetsResponse = await fetch('/api/budgets');
      if (!budgetsResponse.ok) {
        const errorText = await budgetsResponse.text();
        throw new Error(`Failed to fetch budgets: ${errorText || budgetsResponse.statusText}`);
      }
      const budgetsData: BudgetWithCategory[] = await budgetsResponse.json();
      
      // Fetch budget summaries to get spending information
      const summaryResponse = await fetch('/api/budgets/summary');
      if (!summaryResponse.ok) {
        console.error('Failed to fetch budget summaries, continuing with just budget data');
        // Continue with just the budget data, without spending info, but convert to BudgetSummary format
        const basicBudgetSummaries: BudgetSummary[] = budgetsData.map(budget => ({
          id: budget.id,
          userId: budget.userId,
          walletId: budget.walletId,
          categoryId: budget.categoryId,
          name: budget.name,
          description: budget.description,
          allocatedAmount: budget.allocatedAmount,
          remainingAmount: budget.remainingAmount,
          currency: budget.currency,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
          isActive: budget.isActive,
          createdAt: budget.createdAt,
          categoryName: budget.categoryName || null,
          categoryType: budget.categoryType || null,
          spentAmount: parseFloat(budget.allocatedAmount) - parseFloat(budget.remainingAmount),
          percentageUsed: 0
        }));
        setBudgets(basicBudgetSummaries);
      } else {
        // Merge budget data with summary data
        const summaryData = await summaryResponse.json();
        
        // Create budget summaries with spending info
        const budgetSummaries: BudgetSummary[] = budgetsData.map(budget => {
          // Find matching summary data
          const summary = summaryData.find((s: any) => s.budgetId === budget.id);
          
          return {
            id: budget.id,
            userId: budget.userId,
            walletId: budget.walletId,
            categoryId: budget.categoryId,
            name: budget.name,
            description: budget.description,
            allocatedAmount: budget.allocatedAmount,
            remainingAmount: summary?.remainingAmount?.toString() || budget.remainingAmount,
            currency: budget.currency,
            period: budget.period,
            startDate: budget.startDate,
            endDate: budget.endDate,
            isActive: budget.isActive,
            createdAt: budget.createdAt,
            categoryName: budget.categoryName || null,
            categoryType: budget.categoryType || null,
            spentAmount: summary?.spentAmount || (parseFloat(budget.allocatedAmount) - parseFloat(budget.remainingAmount)),
            percentageUsed: summary?.percentageUsed || 0
          };
        });
        
        setBudgets(budgetSummaries);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load data: ${(err as Error).message}. Please try again.`);
    } finally {
      setLoading(false);
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

  const handleCreateBudget = () => {
    setEditingBudget(null);
    setIsFormOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      // Refresh the budgets list
      await fetchBudgetsAndCategories();
    } catch (err) {
      console.error('Error deleting budget:', err);
      setError('Failed to delete budget. Please try again.');
    }
  };

  const handleSubmitBudget = async (data: Partial<Budget>) => {
    try {
      let response;
      
      if (editingBudget) {
        // Update existing budget
        response = await fetch(`/api/budgets/${editingBudget.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create new budget
        response = await fetch('/api/budgets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save budget');
      }

      // Close form and refresh data
      setIsFormOpen(false);
      await fetchBudgetsAndCategories();
    } catch (err) {
      console.error('Error saving budget:', err);
      setError(`Failed to save budget: ${(err as Error).message}`);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
    }).format(amount);
  };

  const getRemainingPercentage = (percentageUsed: number) => {
    return Math.max(0, 100 - percentageUsed); // Ensure it doesn't go below 0
  };

  if (loading) {
    return (
      <div className="pb-20">
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Budgets</h1>
          <div className="text-center py-10 text-gray-500">Loading budgets...</div>
        </div>
        <AppBottomNav />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="pb-20"> {/* Space for bottom nav */}
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Budgets</h1>
            <Button onClick={handleCreateBudget}>
              <Plus className="mr-2 h-4 w-4" />
              New Budget
            </Button>
          </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {budgets.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new budget.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateBudget}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Budget
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{budget.name || budget.categoryName || 'Unnamed Budget'}</CardTitle>
                      <p className="text-sm text-gray-500 capitalize">{budget.period} budget</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditBudget(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(parseFloat(budget.allocatedAmount), budget.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(budget.startDate).toLocaleDateString()} to {new Date(budget.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        budget.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {budget.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar with remaining percentage (100% to 0%) */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Spent: {formatCurrency(budget.spentAmount || 0, budget.currency)}</span>
                      <span>Remaining: {formatCurrency(parseFloat(budget.remainingAmount) || parseFloat(budget.allocatedAmount), budget.currency)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <Progress 
                        value={getRemainingPercentage(budget.percentageUsed || 0)} 
                        className={`h-2 ${
                          (budget.percentageUsed || 0) >= 90 
                            ? 'bg-red-200 [&>div]:bg-red-500' 
                            : (budget.percentageUsed || 0) >= 75 
                              ? 'bg-yellow-200 [&>div]:bg-yellow-500' 
                              : '[&>div]:bg-green-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>{getRemainingPercentage(budget.percentageUsed || 0).toFixed(0)}% remaining</span>
                      <span>100%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Budget Form Sheet */}
      <BudgetFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitBudget}
        budget={editingBudget}
        categories={categories}
        wallets={wallets}
      />

      {/* Floating Action Button */}
      <FloatingButton onClick={handleCreateBudget}>
        <Plus className="h-6 w-6" />
      </FloatingButton>

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  </ProtectedRoute>
);
}