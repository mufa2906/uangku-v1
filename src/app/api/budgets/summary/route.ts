// src/app/api/budgets/summary/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { budgets, transactions, categories } from '@/lib/schema';
import { and, eq, desc, gte, lte, sum, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Determine date range based on period or parameters
    let startDate, endDate;
    const now = new Date();
    
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      // Default to current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Fetch active budgets for the user in the specified period
    const activeBudgets = await db
      .select({
        id: budgets.id,
        walletId: budgets.walletId,
        categoryId: budgets.categoryId,
        categoryName: categories.name,
        budgetName: budgets.name, // Include budget name for custom budgets
        categoryType: categories.type,
        allocatedAmount: budgets.allocatedAmount,
        remainingAmount: budgets.remainingAmount,
        currency: budgets.currency,
        period: budgets.period,
        startDate: budgets.startDate,
        endDate: budgets.endDate,
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.isActive, true),
          eq(budgets.period, period as "weekly" | "monthly" | "yearly"),
          lte(budgets.startDate, endDate.toISOString().split('T')[0]),
          gte(budgets.endDate, startDate.toISOString().split('T')[0])
        )
      );

    // Calculate additional spending metrics for each budget
    const budgetSummaries = [];
    
    for (const budget of activeBudgets) {
      // For the new system, we'll calculate the amount spent from this budget
      // by looking at transactions that are directly linked to this budget
      const whereConditions = [
        eq(transactions.userId, userId),
        eq(transactions.budgetId, budget.id),
        eq(transactions.type, 'expense'),
        gte(transactions.date, new Date(startDate)),
        lte(transactions.date, new Date(endDate))
      ];
      
      const spendingResult = await db
        .select({
          totalSpending: sum(transactions.amount).mapWith(Number),
        })
        .from(transactions)
        .where(and(...whereConditions));
      
      const totalSpending = spendingResult[0]?.totalSpending || 0;
      const allocatedAmount = parseFloat(budget.allocatedAmount);
      const remainingAmount = parseFloat(budget.remainingAmount);
      const percentageUsed = allocatedAmount > 0 ? ((allocatedAmount - remainingAmount) / allocatedAmount) * 100 : 0;
      
      budgetSummaries.push({
        budgetId: budget.id,
        walletId: budget.walletId,
        categoryId: budget.categoryId,
        // Use category name if available; otherwise use budget name for custom budgets
        categoryName: budget.categoryName || budget.budgetName || 'Unnamed Budget',
        categoryType: budget.categoryType,
        allocatedAmount: allocatedAmount,
        remainingAmount: remainingAmount,
        totalSpending: totalSpending,
        percentageUsed: percentageUsed,
        currency: budget.currency,
        period: budget.period,
        budgetStartDate: budget.startDate,
        budgetEndDate: budget.endDate,
      });
    }

    return new Response(
      JSON.stringify(budgetSummaries),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    return new Response('Internal server error', { status: 500 });
  }
}