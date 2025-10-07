// src/app/api/export/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { transactions, categories, budgets, wallets } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq, desc, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get query parameters
    const exportType = request.nextUrl.searchParams.get('type') || 'csv'; // csv or pdf
    const dataType = request.nextUrl.searchParams.get('data') || 'transactions'; // transactions, budgets, goals
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');
    const categoryId = request.nextUrl.searchParams.get('categoryId');
    const walletId = request.nextUrl.searchParams.get('walletId');

    if (dataType === 'transactions') {
      return await exportTransactions(userId, exportType, {
        startDate,
        endDate,
        categoryId,
        walletId,
      });
    } else if (dataType === 'budgets') {
      return await exportBudgets(userId, exportType);
    }

    return new Response('Invalid data type', { status: 400 });
  } catch (error) {
    console.error('Error in export:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

async function exportTransactions(
  userId: string, 
  exportType: string, 
  filters: {
    startDate?: string | null;
    endDate?: string | null;
    categoryId?: string | null;
    walletId?: string | null;
  }
) {
  // Build the where conditions
  const whereConditions = [
    eq(transactions.userId, userId),
    filters.categoryId ? eq(transactions.categoryId, filters.categoryId) : undefined,
    filters.walletId ? eq(transactions.walletId, filters.walletId) : undefined,
    filters.startDate ? gte(transactions.date, new Date(filters.startDate)) : undefined,
    filters.endDate ? lte(transactions.date, new Date(filters.endDate)) : undefined,
  ].filter(Boolean) as any[];
  
  const whereCondition = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

  // Fetch transactions
  const transactionsResult = await db
    .select({
      id: transactions.id,
      date: transactions.date,
      type: transactions.type,
      amount: transactions.amount,
      note: transactions.note,
      categoryName: categories.name,
      walletName: wallets.name,
      budgetName: budgets.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(wallets, eq(transactions.walletId, wallets.id))
    .leftJoin(budgets, eq(transactions.budgetId, budgets.id))
    .where(whereCondition)
    .orderBy(desc(transactions.date));

  if (exportType === 'csv') {
    return generateTransactionsCSV(transactionsResult);
  }

  // For PDF or other formats, you could implement PDF generation here
  return new Response('PDF export not implemented yet', { status: 501 });
}

async function exportBudgets(userId: string, exportType: string) {
  // Fetch budgets with summary data
  const budgetsResult = await db
    .select({
      id: budgets.id,
      name: budgets.name,
      categoryName: categories.name,
      allocatedAmount: budgets.allocatedAmount,
      remainingAmount: budgets.remainingAmount,
      currency: budgets.currency,
      period: budgets.period,
      startDate: budgets.startDate,
      endDate: budgets.endDate,
      status: budgets.isActive,
      walletName: wallets.name,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .leftJoin(wallets, eq(budgets.walletId, wallets.id))
    .where(eq(budgets.userId, userId))
    .orderBy(desc(budgets.createdAt));

  if (exportType === 'csv') {
    return generateBudgetsCSV(budgetsResult);
  }

  return new Response('PDF export not implemented yet', { status: 501 });
}

function generateTransactionsCSV(transactions: any[]) {
  // CSV Headers
  const headers = [
    'Date',
    'Type',
    'Amount',
    'Category',
    'Wallet',
    'Budget',
    'Note'
  ];

  // Generate CSV content
  const csvContent = [
    headers.join(','),
    ...transactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.type,
      transaction.amount,
      transaction.categoryName || '',
      transaction.walletName || '',
      transaction.budgetName || '',
      `"${(transaction.note || '').replace(/"/g, '""')}"` // Escape quotes in notes
    ].join(','))
  ].join('\\n');

  const response = new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });

  return response;
}

function generateBudgetsCSV(budgets: any[]) {
  // CSV Headers
  const headers = [
    'Name',
    'Category',
    'Wallet',
    'Allocated Amount',
    'Remaining Amount',
    'Currency',
    'Period',
    'Start Date',
    'End Date',
    'Status'
  ];

  // Generate CSV content
  const csvContent = [
    headers.join(','),
    ...budgets.map(budget => [
      `"${(budget.name || budget.categoryName || '').replace(/"/g, '""')}"`,
      budget.categoryName || '',
      budget.walletName || '',
      budget.allocatedAmount,
      budget.remainingAmount,
      budget.currency,
      budget.period,
      budget.startDate,
      budget.endDate,
      budget.status ? 'Active' : 'Inactive'
    ].join(','))
  ].join('\\n');

  const response = new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="budgets_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });

  return response;
}