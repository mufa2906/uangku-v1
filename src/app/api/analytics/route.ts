// src/app/api/analytics/route.ts
// API route for handling analytical data for the dashboard

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { transactions, categories, budgets, wallets } from '@/lib/schema';
import { and, eq, desc, asc, sum, gte, lte, count, sql } from 'drizzle-orm';
import { Transaction } from '@/types';

// Define the response type
interface AnalyticsResponse {
  highestTransactions: Transaction[];
  lowestTransactions: Transaction[];
  topCategories: { name: string; amount: number; count: number }[];
  totalSpendingByPeriod: number;
  totalIncomeByPeriod: number;
  periodLabel: string;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'week' | 'month' | 'year' | null;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Determine date range based on period or parameters
    let startDate: Date, endDate: Date;
    const now = new Date();
    
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      endDate = now;
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    } else { // Default to month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Format the period label for display
    let periodLabel = '';
    if (startDateParam && endDateParam) {
      periodLabel = `${new Date(startDateParam).toLocaleDateString()} - ${new Date(endDateParam).toLocaleDateString()}`;
    } else {
      periodLabel = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }

    // Fetch transactions for the period
    const periodTransactions = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        walletId: transactions.walletId,
        budgetId: transactions.budgetId,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        type: transactions.type,
        amount: transactions.amount,
        note: transactions.note,
        date: transactions.date,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
          eq(transactions.type, 'expense') // Only expenses for highest/lowest analysis
        )
      )
      .orderBy(desc(transactions.amount));

    // Get highest transactions (top 10)
    const highestTransactions = periodTransactions.slice(0, 10);

    // Get lowest transactions (sort by amount ascending, get top 10)
    const lowestTransactions = [...periodTransactions].sort((a, b) => 
      parseFloat(a.amount) - parseFloat(b.amount)
    ).slice(0, 10);

    // Get top categories by spending
    const categorySpending = await db
      .select({
        categoryName: categories.name,
        totalSpent: sql<number>`sum(${transactions.amount})`.as('totalSpent'),
        transactionCount: count(transactions.id).as('count'),
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
          eq(transactions.type, 'expense')
        )
      )
      .groupBy(categories.name)
      .orderBy(desc(sql<number>`sum(${transactions.amount})`));

    const topCategories = categorySpending.map(item => ({
      name: item.categoryName || 'Uncategorized',
      amount: parseFloat(item.totalSpent.toString()),
      count: parseInt(item.transactionCount.toString()),
    })).slice(0, 10);

    // Calculate total spending and income in the period
    const totalSpendingResult = await db
      .select({
        total: sum(transactions.amount).mapWith(Number),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
          eq(transactions.type, 'expense')
        )
      );

    const totalIncomeResult = await db
      .select({
        total: sum(transactions.amount).mapWith(Number),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
          eq(transactions.type, 'income')
        )
      );

    const totalSpendingByPeriod = totalSpendingResult[0]?.total || 0;
    const totalIncomeByPeriod = totalIncomeResult[0]?.total || 0;

    // Prepare the response
    const response: AnalyticsResponse = {
      highestTransactions,
      lowestTransactions,
      topCategories,
      totalSpendingByPeriod,
      totalIncomeByPeriod,
      periodLabel,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new Response('Internal server error', { status: 500 });
  }
}