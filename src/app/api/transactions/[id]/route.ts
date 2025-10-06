// src/app/api/transactions/[id]/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { transactions, categories, budgets, wallets } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq, sql } from 'drizzle-orm';
import { UpdateTransactionSchema } from '@/lib/zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    const { id } = params;
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const transactionResult = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        walletId: transactions.walletId,
        walletName: wallets.name,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        budgetId: transactions.budgetId,
        budgetName: budgets.name,
        type: transactions.type,
        amount: transactions.amount,
        note: transactions.note,
        date: transactions.date,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(wallets, eq(transactions.walletId, wallets.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(budgets, eq(transactions.budgetId, budgets.id))
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    if (transactionResult.length === 0) {
      return new Response('Transaction not found', { status: 404 });
    }

    return new Response(
      JSON.stringify(transactionResult[0]),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    const { id } = params;
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const parsedBody = UpdateTransactionSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedData = parsedBody.data;

    // Get the existing transaction to calculate balance adjustments
    const existingTransaction = await db
      .select({
        id: transactions.id,
        walletId: transactions.walletId,
        type: transactions.type,
        amount: transactions.amount,
      })
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    if (existingTransaction.length === 0) {
      return new Response('Transaction not found', { status: 404 });
    }

    const oldTransaction = existingTransaction[0];
    const oldAmount = parseFloat(oldTransaction.amount);
    const newAmount = validatedData.amount ? parseFloat(validatedData.amount) : oldAmount;
    const newType = validatedData.type ?? oldTransaction.type;
    const newWalletId = validatedData.walletId ?? oldTransaction.walletId;

    // Verify new wallet exists and belongs to user if changing wallet
    if (validatedData.walletId && validatedData.walletId !== oldTransaction.walletId) {
      const newWallet = await db
        .select()
        .from(wallets)
        .where(and(eq(wallets.id, validatedData.walletId), eq(wallets.userId, userId)));

      if (newWallet.length === 0) {
        return new Response('New wallet not found', { status: 404 });
      }
    }

    // Verify category exists and belongs to user if provided
    if (validatedData.categoryId) {
      const userCategory = await db
        .select()
        .from(categories)
        .where(and(eq(categories.id, validatedData.categoryId), eq(categories.userId, userId)));

      if (userCategory.length === 0) {
        return new Response('Category not found', { status: 404 });
      }
    }

    // Verify budget exists and belongs to user if provided
    if (validatedData.budgetId) {
      const userBudget = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.id, validatedData.budgetId), eq(budgets.userId, userId)));

      if (userBudget.length === 0) {
        return new Response('Budget not found', { status: 404 });
      }
    }

    // Calculate the adjustment needed for the OLD transaction (reverse its effect)
    if (oldTransaction.type === 'income') {
      // Remove old income from old wallet
      await db
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} - ${oldAmount}`,
        })
        .where(eq(wallets.id, oldTransaction.walletId));
    } else if (oldTransaction.type === 'expense') {
      // Add back the old expense to old wallet (since it was deducted)
      await db
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${oldAmount}`,
        })
        .where(eq(wallets.id, oldTransaction.walletId));
    }

    // Update the transaction
    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();

    // Calculate the adjustment needed for the NEW transaction (apply its effect)
    if (newType === 'income') {
      // Add new income to new wallet
      await db
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${newAmount}`,
        })
        .where(eq(wallets.id, newWalletId));
    } else if (newType === 'expense') {
      // Subtract new expense from new wallet
      await db
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} - ${newAmount}`,
        })
        .where(eq(wallets.id, newWalletId));
    }

    return new Response(JSON.stringify(updatedTransaction), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    const { id } = params;
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get the existing transaction to adjust wallet balance
    const existingTransaction = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        walletId: transactions.walletId,
        type: transactions.type,
        amount: transactions.amount,
      })
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    if (existingTransaction.length === 0) {
      return new Response('Transaction not found', { status: 404 });
    }

    const transaction = existingTransaction[0];
    const transactionAmount = parseFloat(transaction.amount);

    // Adjust wallet balance based on transaction type (reverse the effect)
    if (transaction.type === 'income') {
      // Remove this income from the wallet balance
      await db
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} - ${transactionAmount}`,
        })
        .where(eq(wallets.id, transaction.walletId));
    } else if (transaction.type === 'expense') {
      // Add back this expense to the wallet balance (since it was deducted)
      await db
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${transactionAmount}`,
        })
        .where(eq(wallets.id, transaction.walletId));
    }

    // Delete the transaction
    await db
      .delete(transactions)
      .where(eq(transactions.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return new Response('Internal server error', { status: 500 });
  }
}