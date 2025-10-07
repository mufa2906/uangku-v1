// src/components/budgets/BudgetProgressCard.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Budget } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';

interface BudgetProgressCardProps {
  budget: Budget & { 
    categoryName: string; 
    categoryType: string;
    spentAmount?: number;
    remainingAmount?: number;
    percentageUsed?: number;
  };
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
}

export default function BudgetProgressCard({ 
  budget, 
  onEdit, 
  onDelete 
}: BudgetProgressCardProps) {
  const { formatCurrency } = useCurrency();
  
  // Use actual values if provided, otherwise calculate from budget amount
  const spentAmount = budget.spentAmount || 0;
  const remainingAmount = budget.remainingAmount || parseFloat(budget.allocatedAmount) - spentAmount;
  const percentageUsed = budget.percentageUsed || (spentAmount > 0 ? (spentAmount / parseFloat(budget.allocatedAmount)) * 100 : 0);
  const remainingPercentage = Math.max(0, 100 - percentageUsed);
  
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-100';
    if (percentage >= 75) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <Card>
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
              onClick={() => onEdit(budget)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(budget.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-2xl font-bold">
              {formatCurrency(parseFloat(budget.allocatedAmount))}
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
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={getStatusColor(percentageUsed)}>
              {formatCurrency(spentAmount)} spent
            </span>
            <span className={getStatusColor(percentageUsed)}>
              {formatCurrency(remainingAmount)} remaining
            </span>
          </div>
          
          <Progress 
            value={remainingPercentage} 
            className={`w-full ${
              percentageUsed >= 90 
                ? 'bg-red-200 [&>div]:bg-red-500' 
                : percentageUsed >= 75 
                  ? 'bg-yellow-200 [&>div]:bg-yellow-500' 
                  : '[&>div]:bg-green-500'
            }`} 
          />
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">0%</span>
            <span className={`font-medium ${getStatusColor(percentageUsed)}`}>
              {remainingPercentage.toFixed(0)}% remaining
            </span>
            <span className="text-gray-500">100%</span>
          </div>
        </div>
        
        <div className={`mt-3 p-2 rounded-md text-center text-xs ${getStatusBg(percentageUsed)}`}>
          <span className={getStatusColor(percentageUsed)}>
            {percentageUsed >= 90 
              ? '⚠️ You\'re close to exceeding your budget!' 
              : percentageUsed >= 75 
                ? '⚠️ You\'re approaching your budget limit' 
                : '✓ You\'re within your budget'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}