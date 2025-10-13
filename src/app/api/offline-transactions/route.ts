// src/app/api/offline-transactions/route.ts
// API route for handling offline transaction sync

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactions, wallets, budgets, categories } from '@/lib/schema';
import { and, eq, sql } from 'drizzle-orm';
import { CreateTransactionSchema } from '@/lib/zod';

// POST /api/offline-transactions - Sync offline transactions
export async function POST(request: Request) {
  try {
    // Use BetterAuth instead of Clerk
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate the request body
    const parsedBody = CreateTransactionSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsedBody.error.flatten() },
        { status: 400 }
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
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Verify that the category belongs to the user (if provided)
    if (categoryId) {
      const userCategory = await db
        .select()
        .from(categories)
        .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

      if (userCategory.length === 0) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
    }

    // If a budgetId is provided, verify it exists and belongs to the user
    if (budgetId) {
      const userBudget = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)));

      if (userBudget.length === 0) {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
      }

      // Check if the budget is linked to the selected wallet
      if (userBudget[0].walletId !== walletId) {
        return NextResponse.json(
          { error: 'Budget wallet mismatch', message: 'Selected budget must be linked to selected wallet' },
          { status: 400 }
        );
      }

      // For expense transactions, check if there's enough budget remaining
      if (type === 'expense') {
        const budgetRemaining = parseFloat(userBudget[0].remainingAmount);
        const transactionAmount = parseFloat(amount);
        
        if (transactionAmount > budgetRemaining) {
          return NextResponse.json(
            { 
              error: 'Insufficient budget', 
              message: `Budget only has ${userBudget[0].remainingAmount} remaining, cannot spend ${amount}`
            },
            { status: 400 }
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
        categoryId: categoryId || null, // Optional category reference
        type,
        amount,
        note: note || null,
        date: new Date(date),
      })
      .returning();

    // Update balances based on transaction type
    const transactionAmount = parseFloat(amount);
    if (budgetId) {
      // If transaction is linked to a budget, update the budget
      if (type === 'income') {
        // For income, increase budget remaining amount
        await db
          .update(budgets)
          .set({
            remainingAmount: sql`${budgets.remainingAmount} + ${transactionAmount}`,
          })
          .where(eq(budgets.id, budgetId));
      } else if (type === 'expense') {
        // For expense, decrease budget remaining amount
        await db
          .update(budgets)
          .set({
            remainingAmount: sql`${budgets.remainingAmount} - ${transactionAmount}`,
          })
          .where(eq(budgets.id, budgetId));
      }
    } else {
      // If transaction is not linked to a budget, update the wallet
      if (type === 'income') {
        // For income, add to wallet
        await db
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} + ${transactionAmount}`,
          })
          .where(eq(wallets.id, walletId));
      } else if (type === 'expense') {
        // For expense, subtract from wallet
        await db
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} - ${transactionAmount}`,
          })
          .where(eq(wallets.id, walletId));
      }
    }

    return NextResponse.json(newTransaction, {
      status: 201,
    });
    
  } catch (error) {
    console.error('Error syncing offline transaction:', error);
    return NextResponse.json(
      { error: 'Failed to sync transaction' },
      { status: 500 }
    );
  }
}