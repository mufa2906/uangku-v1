// src/app/api/goals/[id]/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { goals, wallets } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { and, eq, sql } from 'drizzle-orm';
import { UpdateGoalSchema } from '@/lib/zod';

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

    const goalResult = await db
      .select({
        id: goals.id,
        userId: goals.userId,
        name: goals.name,
        description: goals.description,
        targetAmount: goals.targetAmount,
        currentAmount: goals.currentAmount,
        currency: goals.currency,
        targetDate: goals.targetDate,
        status: goals.status,
        walletId: goals.walletId,
        walletName: wallets.name,
        isActive: goals.isActive,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .leftJoin(wallets, eq(goals.walletId, wallets.id))
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));

    if (goalResult.length === 0) {
      return new Response('Goal not found', { status: 404 });
    }

    return new Response(
      JSON.stringify(goalResult[0]),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching goal:', error);
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
    const parsedBody = UpdateGoalSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedData = parsedBody.data;

    // Check if goal exists and belongs to user
    const existingGoal = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));

    if (existingGoal.length === 0) {
      return new Response('Goal not found', { status: 404 });
    }

    // If walletId is provided, verify it belongs to the user
    if (validatedData.walletId) {
      const userWallet = await db
        .select()
        .from(wallets)
        .where(and(eq(wallets.id, validatedData.walletId), eq(wallets.userId, userId)));

      if (userWallet.length === 0) {
        return new Response('Wallet not found', { status: 404 });
      }
    }

    // Auto-complete goal if currentAmount reaches or exceeds targetAmount
    let updateData = { ...validatedData };
    if (validatedData.currentAmount && validatedData.targetAmount) {
      const current = parseFloat(validatedData.currentAmount);
      const target = parseFloat(validatedData.targetAmount);
      if (current >= target && existingGoal[0].status !== 'completed') {
        updateData.status = 'completed';
      }
    } else if (validatedData.currentAmount && !validatedData.targetAmount) {
      const current = parseFloat(validatedData.currentAmount);
      const target = parseFloat(existingGoal[0].targetAmount);
      if (current >= target && existingGoal[0].status !== 'completed') {
        updateData.status = 'completed';
      }
    }

    // Update the goal
    const [updatedGoal] = await db
      .update(goals)
      .set({
        ...updateData,
        targetDate: validatedData.targetDate ? new Date(validatedData.targetDate) : undefined,
      } as any)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();

    return new Response(JSON.stringify(updatedGoal), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating goal:', error);
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

    // Check if goal exists and belongs to user
    const existingGoal = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));

    if (existingGoal.length === 0) {
      return new Response('Goal not found', { status: 404 });
    }

    // Delete the goal
    await db
      .delete(goals)
      .where(eq(goals.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

// Add contribution to goal
export async function PATCH(
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
    const { amount, action } = body; // action can be 'contribute' or 'withdraw'

    if (!amount || !action || !['contribute', 'withdraw'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Amount and valid action (contribute/withdraw) are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const contributionAmount = parseFloat(amount);
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount must be a positive number' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if goal exists and belongs to user
    const existingGoal = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));

    if (existingGoal.length === 0) {
      return new Response('Goal not found', { status: 404 });
    }

    const goal = existingGoal[0];

    // Calculate new current amount
    const currentAmount = parseFloat(goal.currentAmount);
    const newAmount = action === 'contribute' 
      ? currentAmount + contributionAmount
      : Math.max(0, currentAmount - contributionAmount); // Prevent negative amounts

    // Check if goal should be completed
    const targetAmount = parseFloat(goal.targetAmount);
    const newStatus = newAmount >= targetAmount && goal.status !== 'completed' ? 'completed' : goal.status;

    // Update the goal
    const [updatedGoal] = await db
      .update(goals)
      .set({
        currentAmount: newAmount.toString(),
        status: newStatus,
      })
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();

    return new Response(JSON.stringify(updatedGoal), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating goal contribution:', error);
    return new Response('Internal server error', { status: 500 });
  }
}