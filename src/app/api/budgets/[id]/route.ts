// src/app/api/budgets/[id]/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { budgets, wallets } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq, sql } from 'drizzle-orm';
import { UpdateBudgetSchema } from '@/lib/zod';

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

    const budgetResult = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));

    if (budgetResult.length === 0) {
      return new Response('Budget not found', { status: 404 });
    }

    return new Response(
      JSON.stringify(budgetResult[0]),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching budget:', error);
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
    const parsedBody = UpdateBudgetSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedData = parsedBody.data;

    // Get existing budget to check previous values
    const existingBudget = await db
      .select({
        id: budgets.id,
        userId: budgets.userId,
        walletId: budgets.walletId,
        allocatedAmount: budgets.allocatedAmount,
        remainingAmount: budgets.remainingAmount,
      })
      .from(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));

    if (existingBudget.length === 0) {
      return new Response('Budget not found', { status: 404 });
    }

    const oldBudget = existingBudget[0];
    const oldAllocatedAmount = parseFloat(oldBudget.allocatedAmount);
    
    // If walletId or allocatedAmount is being updated, handle the balance changes
    if (validatedData.walletId || validatedData.allocatedAmount !== undefined) {
      const newWalletId = validatedData.walletId || oldBudget.walletId;
      const newAllocatedAmount = validatedData.allocatedAmount ? parseFloat(validatedData.allocatedAmount) : oldAllocatedAmount;
      
      // Verify the new wallet belongs to the user
      const newWallet = await db
        .select({ balance: wallets.balance })
        .from(wallets)
        .where(and(eq(wallets.id, newWalletId), eq(wallets.userId, userId)));

      if (newWallet.length === 0) {
        return new Response('New wallet not found', { status: 404 });
      }

      // Check if new wallet has sufficient funds for the new allocation
      const newWalletBalance = parseFloat(newWallet[0].balance);
      
      if (newAllocatedAmount > newWalletBalance) {
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient funds', 
            message: `Cannot allocate ${newAllocatedAmount} from wallet with balance ${newWalletBalance}`
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // If changing wallets, update balances in both wallets
      if (validatedData.walletId && validatedData.walletId !== oldBudget.walletId) {
        // Add old allocated amount back to old wallet
        await db
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} + ${oldAllocatedAmount}`,
          })
          .where(eq(wallets.id, oldBudget.walletId));
          
        // Deduct new allocated amount from new wallet
        await db
          .update(wallets)
          .set({
            balance: sql`${wallets.balance} - ${newAllocatedAmount}`,
          })
          .where(eq(wallets.id, newWalletId));
      } else if (validatedData.allocatedAmount) {
        // Same wallet, different amount
        const difference = newAllocatedAmount - oldAllocatedAmount;
        if (difference > 0) {
          // Increasing allocation - need to deduct from wallet
          await db
            .update(wallets)
            .set({
              balance: sql`${wallets.balance} - ${difference}`,
            })
            .where(eq(wallets.id, oldBudget.walletId));
        } else if (difference < 0) {
          // Decreasing allocation - need to add back to wallet
          await db
            .update(wallets)
            .set({
              balance: sql`${wallets.balance} + ${Math.abs(difference)}`,
            })
            .where(eq(wallets.id, oldBudget.walletId));
        }
      }
      
      // Update the budget
      const [updatedBudget] = await db
        .update(budgets)
        .set({
          ...validatedData,
          remainingAmount: (oldBudget.remainingAmount + (newAllocatedAmount - oldAllocatedAmount)).toString(), // Adjust remaining amount proportionally
          allocatedAmount: newAllocatedAmount.toString(),
          startDate: validatedData.startDate ? new Date(validatedData.startDate).toISOString().split('T')[0] : undefined,
          endDate: validatedData.endDate ? new Date(validatedData.endDate).toISOString().split('T')[0] : undefined,
        })
        .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
        .returning();

      return new Response(JSON.stringify(updatedBudget), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // No walletId or allocatedAmount changes, just update other fields
      const [updatedBudget] = await db
        .update(budgets)
        .set({
          ...validatedData,
          startDate: validatedData.startDate ? new Date(validatedData.startDate).toISOString().split('T')[0] : undefined,
          endDate: validatedData.endDate ? new Date(validatedData.endDate).toISOString().split('T')[0] : undefined,
        })
        .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
        .returning();

      return new Response(JSON.stringify(updatedBudget), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error updating budget:', error);
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

    // Get the budget to access its values
    const existingBudget = await db
      .select({
        id: budgets.id,
        userId: budgets.userId,
        walletId: budgets.walletId,
        allocatedAmount: budgets.allocatedAmount,
      })
      .from(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));

    if (existingBudget.length === 0) {
      return new Response('Budget not found', { status: 404 });
    }

    const budget = existingBudget[0];
    const allocatedAmount = parseFloat(budget.allocatedAmount);
    
    // Add the allocated amount back to the wallet
    await db
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${allocatedAmount}`,
      })
      .where(eq(wallets.id, budget.walletId));

    // Delete the budget
    await db
      .delete(budgets)
      .where(eq(budgets.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return new Response('Internal server error', { status: 500 });
  }
}