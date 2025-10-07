// src/app/api/transactions/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { transactions, categories, budgets, wallets } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq, desc, asc, count, gte, lte, sql } from 'drizzle-orm';
import { CreateTransactionSchema, UpdateTransactionSchema } from '@/lib/zod';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get pagination parameters
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get sorting parameters
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'date';
    const sortOrder = request.nextUrl.searchParams.get('sortOrder') || 'desc';

    // Get filter parameters
    const typeParam = request.nextUrl.searchParams.get('type');
    const type = typeParam && (typeParam === 'income' || typeParam === 'expense') ? typeParam : undefined;
    const categoryId = request.nextUrl.searchParams.get('categoryId') || undefined;
    const walletId = request.nextUrl.searchParams.get('walletId') || undefined;
    const budgetId = request.nextUrl.searchParams.get('budgetId') || undefined;
    const startDate = request.nextUrl.searchParams.get('startDate') || undefined;
    const endDate = request.nextUrl.searchParams.get('endDate') || undefined;

    // Build the where conditions
    const filters = [
      eq(transactions.userId, userId),
      type ? eq(transactions.type, type) : undefined,
      categoryId ? eq(transactions.categoryId, categoryId) : undefined,
      walletId ? eq(transactions.walletId, walletId) : undefined,
      budgetId ? eq(transactions.budgetId, budgetId) : undefined,
      startDate ? gte(transactions.date, new Date(startDate)) : undefined,
      endDate ? lte(transactions.date, new Date(endDate)) : undefined,
    ].filter(Boolean) as any[];
    
    const whereCondition = filters.length > 1 ? and(...filters) : filters[0];

    // Build the query
    let orderCondition = desc(transactions.date);
    if (sortBy === 'date') {
      orderCondition = sortOrder === 'asc' ? asc(transactions.date) : desc(transactions.date);
    } else if (sortBy === 'amount') {
      orderCondition = sortOrder === 'asc' ? asc(transactions.amount) : desc(transactions.amount);
    }

    const transactionsResult = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        walletId: transactions.walletId,
        walletName: wallets.name, // Include wallet name
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        budgetId: transactions.budgetId,
        budgetName: budgets.name, // Add budget name for display
        type: transactions.type,
        amount: transactions.amount,
        note: transactions.note,
        date: transactions.date,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(wallets, eq(transactions.walletId, wallets.id)) // Join with wallets
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(budgets, eq(transactions.budgetId, budgets.id)) // Join with budgets
      .where(whereCondition)
      .orderBy(orderCondition)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.userId, userId));
    const totalCount = Number(totalCountResult[0].count);

    return new Response(
      JSON.stringify({
        transactions: transactionsResult,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const parsedBody = CreateTransactionSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedData = parsedBody.data as {
      walletId: string;
      budgetId?: string | null;
      categoryId?: string | null;
      type: 'income' | 'expense';
      amount: string;
      note?: string | null;
      date: string;
    };
    const { walletId, budgetId, categoryId, type, amount, note, date } = validatedData;

    // Verify that the wallet belongs to the user
    const userWallet = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.id, walletId), eq(wallets.userId, userId)));

    if (userWallet.length === 0) {
      return new Response('Wallet not found', { status: 404 });
    }

    // If no category ID is provided, we'll create a default category
    let validCategoryId = categoryId;
    if (!validCategoryId) {
      // For now, we'll require a category or create a default one
      // In a real app, you might have default categories
      return new Response(
        JSON.stringify({ error: 'Category ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify that the category belongs to the user
    const userCategory = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, validCategoryId), eq(categories.userId, userId)));

    if (userCategory.length === 0) {
      return new Response('Category not found', { status: 404 });
    }

    // If a budgetId is provided, verify it exists and belongs to the user
    let budgetData = null;
    if (budgetId) {
      budgetData = await db
        .select({
          id: budgets.id,
          userId: budgets.userId,
          walletId: budgets.walletId,
          remainingAmount: budgets.remainingAmount,
          allocatedAmount: budgets.allocatedAmount
        })
        .from(budgets)
        .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)));

      if (budgetData.length === 0) {
        return new Response('Budget not found', { status: 404 });
      }

      // Check if the budget is linked to the selected wallet
      if (budgetData[0].walletId !== walletId) {
        return new Response(
          JSON.stringify({ error: 'Budget wallet mismatch', message: 'Selected budget must be linked to selected wallet' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // For expense transactions, check if there's enough budget remaining
      if (type === 'expense') {
        const budgetRemaining = parseFloat(budgetData[0].remainingAmount);
        const transactionAmount = parseFloat(amount);
        
        if (transactionAmount > budgetRemaining) {
          return new Response(
            JSON.stringify({ 
              error: 'Insufficient budget', 
              message: `Budget only has ${budgetData[0].remainingAmount} remaining, cannot spend ${amount}`
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Create the transaction
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        userId,
        walletId, // Source wallet
        budgetId: budgetId || null, // Optional budget reference
        categoryId: validCategoryId,
        type,
        amount,
        note: note || null,
        date: new Date(date),
      })
      .returning();

    // Update balances based on transaction type
    const transactionAmount = parseFloat(amount);
    if (type === 'income') {
      // For income, add to both wallet and, if budget specified, budget remaining
      await db
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${transactionAmount}`,
        })
        .where(eq(wallets.id, walletId));

      // If budget is specified, increase its remaining amount (since income increases available funds)
      if (budgetId && budgetData) {
        await db
          .update(budgets)
          .set({
            remainingAmount: sql`${budgets.remainingAmount} + ${transactionAmount}`,
          })
          .where(eq(budgets.id, budgetId));
      }
    } else if (type === 'expense') {
      // For expense, subtract from both wallet and, if budget specified, budget remaining
      await db
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} - ${transactionAmount}`,
        })
        .where(eq(wallets.id, walletId));

      // If budget is specified, decrease its remaining amount
      if (budgetId && budgetData) {
        await db
          .update(budgets)
          .set({
            remainingAmount: sql`${budgets.remainingAmount} - ${transactionAmount}`,
          })
          .where(eq(budgets.id, budgetId));
      }
    }

    return new Response(JSON.stringify(newTransaction), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response('Internal server error', { status: 500 });
  }
}