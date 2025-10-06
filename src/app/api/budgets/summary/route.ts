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
        categoryId: budgets.categoryId,
        categoryName: categories.name,
        categoryType: categories.type,
        budgetAmount: budgets.amount,
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

    // Calculate actual spending for each budget category
    const budgetSummaries = [];
    
    for (const budget of activeBudgets) {
      // Get total spending for this budget during the period
      // Build where conditions
      const whereConditions = [
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, new Date(startDate)),
        lte(transactions.date, new Date(endDate))
      ];
      
      // Add condition based on budget type:
      // For category-linked budgets: transactions matching the category
      // For custom budgets: transactions directly linked to the budget
      if (budget.categoryId) {
        // Category-linked budget: include transactions in that category
        whereConditions.push(eq(transactions.categoryId, budget.categoryId));
      } else {
        // Custom budget: include transactions directly linked to this budget
        whereConditions.push(eq(transactions.budgetId, budget.id));
      }
      
      const spendingResult = await db
        .select({
          totalSpending: sum(transactions.amount).mapWith(Number),
        })
        .from(transactions)
        .where(and(...whereConditions));
      
      const totalSpending = spendingResult[0]?.totalSpending || 0;
      const budgetAmount = parseFloat(budget.budgetAmount);
      const remaining = budgetAmount - totalSpending;
      const percentageUsed = budgetAmount > 0 ? (totalSpending / budgetAmount) * 100 : 0;
      
      budgetSummaries.push({
        budgetId: budget.id,
        categoryId: budget.categoryId,
        categoryName: budget.categoryName,
        categoryType: budget.categoryType,
        budgetAmount: budgetAmount,
        totalSpending: totalSpending,
        remaining: remaining,
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