// src/server/services/insightService.ts
import { db } from '@/lib/db';
import { transactions } from '@/lib/schema';
import { eq, and, gte, lte, sum } from 'drizzle-orm';
import { differenceInDays, startOfWeek, endOfWeek, addDays } from 'date-fns';

interface WeeklySummary {
  date: string;
  income: number;
  expense: number;
  net: number;
}

interface InsightData {
  weeklySummary: WeeklySummary[];
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

function createDefaultInsightData(): InsightData {
  const weeklySummary: WeeklySummary[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    weeklySummary.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      income: 0,
      expense: 0,
      net: 0,
    });
  }
  
  return {
    weeklySummary,
    totalIncome: 0,
    totalExpense: 0,
    net: 0,
    weeklyTrend: {
      currentWeek: 0,
      previousWeek: 0,
      change: 0,
      changePercentage: 0,
    },
  };
}

export async function getWeeklyInsights(userId: string): Promise<InsightData> {
  // Get data for the last 2 weeks
  const now = new Date();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(now.getDate() - 14);

  let allTransactions;
  
  try {
    // Get transactions from the last 2 weeks
    allTransactions = await db
      .select({
        type: transactions.type,
        amount: transactions.amount,
        date: transactions.date,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, twoWeeksAgo),
          lte(transactions.date, now)
        )
      );
  } catch (error) {
    console.error('Error fetching transactions for insights:', error);
    // Return default values if there's an error
    return createDefaultInsightData();
  }

  // Calculate total income and expense
  let totalIncome = 0;
  let totalExpense = 0;

  allTransactions.forEach(transaction => {
    const amount = parseFloat(transaction.amount);
    if (transaction.type === 'income') {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }
  });

  // Prepare weekly summary data for the last 7 days
  const lastWeekStart = startOfWeek(addDays(now, -7), { weekStartsOn: 0 }); // Monday
  const lastWeekEnd = endOfWeek(addDays(now, -7), { weekStartsOn: 0 }); // Sunday
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 }); // Monday
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 0 }); // Sunday

  // Get data for current week
  const currentWeekTransactions = allTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= currentWeekStart && transactionDate <= currentWeekEnd;
  });

  // Get data for previous week
  const previousWeekTransactions = allTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= lastWeekStart && transactionDate <= lastWeekEnd;
  });

  // Calculate weekly values
  const currentWeekIncome = currentWeekTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const currentWeekExpense = currentWeekTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const previousWeekIncome = previousWeekTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const previousWeekExpense = previousWeekTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Calculate weekly data for the chart (last 7 days)
  const weeklySummary: WeeklySummary[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getDate() === date.getDate() &&
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getFullYear() === date.getFullYear()
      );
    });
    
    const dayIncome = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const dayExpense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    weeklySummary.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      income: dayIncome,
      expense: dayExpense,
      net: dayIncome - dayExpense,
    });
  }

  return {
    weeklySummary,
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    weeklyTrend: {
      currentWeek: currentWeekIncome - currentWeekExpense,
      previousWeek: previousWeekIncome - previousWeekExpense,
      change: (currentWeekIncome - currentWeekExpense) - (previousWeekIncome - previousWeekExpense),
      changePercentage: previousWeekIncome + previousWeekExpense > 0 
        ? ((currentWeekIncome - currentWeekExpense) - (previousWeekIncome - previousWeekExpense)) / (previousWeekIncome + previousWeekExpense) * 100
        : 0,
    },
  };
}