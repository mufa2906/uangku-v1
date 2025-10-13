// src/app/api/transactions/[id]/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { transactions, categories, budgets, wallets } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { and, eq, sql } from 'drizzle-orm';
import { UpdateTransactionSchema } from '@/lib/zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use BetterAuth instead of Clerk
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    const userId = session?.user?.id;
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
    // Use BetterAuth instead of Clerk
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    const userId = session?.user?.id;
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
        userId: transactions.userId,
        walletId: transactions.walletId,
        budgetId: transactions.budgetId,
        categoryId: transactions.categoryId,
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
    
    // Get the new values, falling back to old values if not provided
    const newWalletId = validatedData.walletId ?? oldTransaction.walletId;
    const newBudgetId = validatedData.budgetId !== undefined ? validatedData.budgetId : oldTransaction.budgetId;
    const newType = validatedData.type ?? oldTransaction.type;
    const newAmount = validatedData.amount ? parseFloat(validatedData.amount) : oldAmount;

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

    // Verify budget exists, belongs to user, and link wallets if needed
    if (newBudgetId) {
      const budgetData = await db
        .select({
          id: budgets.id,
          userId: budgets.userId,
          walletId: budgets.walletId,
          remainingAmount: budgets.remainingAmount,
          allocatedAmount: budgets.allocatedAmount
        })
        .from(budgets)
        .where(and(eq(budgets.id, newBudgetId), eq(budgets.userId, userId)));

      if (budgetData.length === 0) {
        return new Response('Budget not found', { status: 404 });
      }

      // Check if the budget is linked to the selected wallet
      if (budgetData[0].walletId !== newWalletId) {
        return new Response(
          JSON.stringify({ error: 'Budget wallet mismatch', message: 'Selected budget must be linked to selected wallet' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // For expense transactions, check if there's enough budget remaining (after accounting for the old transaction)
      if (newType === 'expense') {
        // Calculate the budget remaining as if the old transaction was reverted and new transaction applied
        const oldTransactionAmount = parseFloat(oldTransaction.amount);
        const budgetRemainingAfterOldReversal = parseFloat(budgetData[0].remainingAmount) + oldTransactionAmount; // Add back old amount
        const budgetRemainingAfterNew = budgetRemainingAfterOldReversal - newAmount;
        
        if (budgetRemainingAfterNew < 0) {
          return new Response(
            JSON.stringify({ 
              error: 'Insufficient budget', 
              message: `Transaction would exceed budget remaining. New amount ${newAmount} exceeds available budget ${budgetRemainingAfterOldReversal}`
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Calculate the adjustment needed for the OLD transaction (reverse its effect)
    if (oldTransaction.budgetId) {
      // If the old transaction was linked to a budget, revert its impact on the budget
      if (oldTransaction.type === 'income') {
        // Remove old income from budget
        await db
          .update(budgets)
          .set({
            remainingAmount: sql`${budgets.remainingAmount} - ${oldAmount}`,
          })
          .where(eq(budgets.id, oldTransaction.budgetId));
      } else if (oldTransaction.type === 'expense') {
        // Add back the old expense to budget
        await db
          .update(budgets)
          .set({
            remainingAmount: sql`${budgets.remainingAmount} + ${oldAmount}`,
          })
          .where(eq(budgets.id, oldTransaction.budgetId));
      }
    } else {
      // If the old transaction was not linked to a budget, revert its impact on the wallet
      if (oldTransaction.type === 'income') {
        // Remove old income from wallet
        await db
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} - ${oldAmount}`,
          })
          .where(oldTransaction.walletId ? eq(wallets.id, oldTransaction.walletId) : sql`FALSE`);
      } else if (oldTransaction.type === 'expense') {
        // Add back the old expense to wallet
        await db
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} + ${oldAmount}`,
          })
          .where(oldTransaction.walletId ? eq(wallets.id, oldTransaction.walletId) : sql`FALSE`);
      }
    }

    // Update the transaction
    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        categoryId: validatedData.categoryId ?? undefined,
        budgetId: validatedData.budgetId ?? undefined,
        walletId: validatedData.walletId ?? undefined,
      } as any)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();

    if (newBudgetId) {
      // If the new transaction is linked to a budget, apply its effect to the budget
      if (newType === 'income') {
        // Add new income to budget
        await db
          .update(budgets)
          .set({
            remainingAmount: sql`${budgets.remainingAmount} + ${newAmount}`,
          })
          .where(eq(budgets.id, newBudgetId));
      } else if (newType === 'expense') {
        // Subtract new expense from budget
        await db
          .update(budgets)
          .set({
            remainingAmount: sql`${budgets.remainingAmount} - ${newAmount}`,
          })
          .where(eq(budgets.id, newBudgetId));
      }
    } else {
      // If the new transaction is not linked to a budget, apply its effect to the wallet
      if (newType === 'income') {
        // Add new income to new wallet
        await db
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} + ${newAmount}`,
          })
          .where(newWalletId ? eq(wallets.id, newWalletId) : sql`FALSE`);
      } else if (newType === 'expense') {
        // Subtract new expense from new wallet
        await db
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} - ${newAmount}`,
          })
          .where(newWalletId ? eq(wallets.id, newWalletId) : sql`FALSE`);
      }
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
    // Use BetterAuth instead of Clerk
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    const userId = session?.user?.id;
    const { id } = params;
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get the existing transaction to adjust balances
    const existingTransaction = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        walletId: transactions.walletId,
        budgetId: transactions.budgetId,
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

    if (transaction.budgetId) {
      // If the transaction was linked to a budget, adjust the budget balance
      if (transaction.type === 'income') {
        // Remove this income from the budget
        await db
          .update(budgets)
          .set({
            remainingAmount: sql`${budgets.remainingAmount} - ${transactionAmount}`,
          })
          .where(eq(budgets.id, transaction.budgetId));
      } else if (transaction.type === 'expense') {
        // Add back this expense to the budget
        await db
          .update(budgets)
          .set({
            remainingAmount: sql`${budgets.remainingAmount} + ${transactionAmount}`,
          })
          .where(eq(budgets.id, transaction.budgetId));
      }
    } else {
      // If the transaction was not linked to a budget, adjust the wallet balance
      if (transaction.type === 'income') {
        // Remove this income from the wallet balance
        await db
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} - ${transactionAmount}`,
          })
          .where(transaction.walletId ? eq(wallets.id, transaction.walletId) : sql`FALSE`);
      } else if (transaction.type === 'expense') {
        // Add back this expense to the wallet balance
        await db
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} + ${transactionAmount}`,
          })
          .where(transaction.walletId ? eq(wallets.id, transaction.walletId) : sql`FALSE`);
      }
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