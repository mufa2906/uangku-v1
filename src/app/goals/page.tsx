// src/app/goals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target, AlertCircle, Edit, Trash2, TrendingUp, Trophy } from 'lucide-react';
import { FloatingButton } from '@/components/ui/floating-button';
import AppBottomNav from '@/components/shells/AppBottomNav';
import { Goal, Wallet } from '@/types';
import GoalFormSheet from '@/components/goals/GoalFormSheet';
import { Progress } from '@/components/ui/progress';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast, toast } from '@/components/ui/toast';

interface GoalWithWallet extends Goal {
  walletName: string | null;
}

export default function GoalsPage() {
  const { userId } = useAuth();
  const { formatCurrency } = useCurrency();
  const { addToast } = useToast();
  const [goals, setGoals] = useState<GoalWithWallet[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    if (userId) {
      fetchGoalsAndWallets();
    }
  }, [userId]);

  const fetchGoalsAndWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch goals
      const goalsResponse = await fetch('/api/goals');
      if (!goalsResponse.ok) {
        throw new Error('Failed to fetch goals');
      }
      const goalsData = await goalsResponse.json();
      setGoals(goalsData);
      
      // Fetch wallets for form
      const walletsResponse = await fetch('/api/wallets');
      if (!walletsResponse.ok) {
        throw new Error('Failed to fetch wallets');
      }
      const walletsData = await walletsResponse.json();
      setWallets(walletsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      // Refresh the goals list
      await fetchGoalsAndWallets();
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal. Please try again.');
    }
  };

  const handleSubmitGoal = async (data: Partial<Goal>) => {
    try {
      let response;
      
      if (editingGoal) {
        // Update existing goal
        response = await fetch(`/api/goals/${editingGoal.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create new goal
        response = await fetch('/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save goal');
      }

      // Close form and refresh data
      setIsFormOpen(false);
      await fetchGoalsAndWallets();
      
      // Show success toast
      addToast(toast.success(
        editingGoal ? 'Goal Updated' : 'Goal Created', 
        `${data.name} has been ${editingGoal ? 'updated' : 'created'} successfully.`
      ));
    } catch (err) {
      console.error('Error saving goal:', err);
      const errorMessage = `Failed to save goal: ${(err as Error).message}`;
      setError(errorMessage);
      
      // Show error toast
      addToast(toast.error(
        'Save Failed',
        errorMessage
      ));
    }
  };

  const handleContribute = async (goalId: string, amount: number) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'contribute',
          amount: amount.toString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add contribution');
      }

      // Refresh the goals list
      await fetchGoalsAndWallets();
      
      // Show success toast
      addToast(toast.success(
        'Contribution Added',
        `Successfully added ${formatCurrency(amount)} to your goal.`
      ));
    } catch (err) {
      console.error('Error adding contribution:', err);
      const errorMessage = `Failed to add contribution: ${(err as Error).message}`;
      setError(errorMessage);
      
      // Show error toast
      addToast(toast.error(
        'Contribution Failed',
        errorMessage
      ));
    }
  };

  const getProgressPercentage = (current: string, target: string) => {
    const currentAmount = parseFloat(current);
    const targetAmount = parseFloat(target);
    return Math.min((currentAmount / targetAmount) * 100, 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Trophy className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: // active
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default: // active
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getDaysRemaining = (targetDate: string | null) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const timeDiff = target.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  if (loading) {
    return (
      <div className="pb-20">
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Goals</h1>
          <div className="text-center py-10 text-gray-500">Loading goals...</div>
        </div>
        <AppBottomNav />
      </div>
    );
  }

  return (
    <div className="pb-20"> {/* Space for bottom nav */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Goals</h1>
          <Button onClick={handleCreateGoal}>
            <Plus className="mr-2 h-4 w-4" />
            New Goal
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

        {goals.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No goals</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start achieving your financial dreams by creating your first goal.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateGoal}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progressPercentage = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              const daysRemaining = getDaysRemaining(goal.targetDate);
              
              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(goal.status)}
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                          </span>
                          {goal.walletName && (
                            <span className="text-xs text-gray-500">
                              Linked to {goal.walletName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditGoal(goal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Section */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-2xl font-bold">
                            {formatCurrency(parseFloat(goal.currentAmount))}
                          </span>
                          <span className="text-lg text-gray-600">
                            of {formatCurrency(parseFloat(goal.targetAmount))}
                          </span>
                        </div>
                        <Progress 
                          value={progressPercentage}
                          className={`h-3 ${
                            progressPercentage >= 100 
                              ? '[&>div]:bg-green-500' 
                              : progressPercentage >= 75 
                                ? '[&>div]:bg-blue-500' 
                                : '[&>div]:bg-gray-400'
                          }`}
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>{progressPercentage.toFixed(1)}% complete</span>
                          {daysRemaining !== null && (
                            <span>
                              {daysRemaining > 0 
                                ? `${daysRemaining} days remaining`
                                : daysRemaining === 0 
                                  ? 'Target date is today!'
                                  : `${Math.abs(daysRemaining)} days overdue`
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      {goal.status === 'active' && (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const amount = prompt('How much would you like to contribute?');
                              if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
                                handleContribute(goal.id, parseFloat(amount));
                              }
                            }}
                          >
                            Quick Contribute
                          </Button>
                        </div>
                      )}

                      {goal.targetDate && (
                        <div className="text-xs text-gray-500">
                          Target date: {new Date(goal.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Goal Form Sheet */}
      <GoalFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitGoal}
        goal={editingGoal}
        wallets={wallets}
      />

      {/* Floating Action Button */}
      <FloatingButton onClick={handleCreateGoal}>
        <Plus className="h-6 w-6" />
      </FloatingButton>

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  );
}