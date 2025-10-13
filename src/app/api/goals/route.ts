// src/app/api/goals/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { goals, wallets } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { and, eq, desc } from 'drizzle-orm';
import { CreateGoalSchema } from '@/lib/zod';

export async function GET(request: NextRequest) {
  try {
    // Use BetterAuth instead of Clerk
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    const userId = session?.user?.id;
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get filter parameters
    const status = request.nextUrl.searchParams.get('status');
    const includeInactive = request.nextUrl.searchParams.get('includeInactive') === 'true';

    // Build the where conditions
    const filters = [
      eq(goals.userId, userId),
      status ? eq(goals.status, status as any) : undefined,
      includeInactive ? undefined : eq(goals.isActive, true),
    ].filter(Boolean) as any[];
    
    const whereCondition = filters.length > 1 ? and(...filters) : filters[0];

    const goalsResult = await db
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
      .where(whereCondition)
      .orderBy(desc(goals.createdAt));

    return new Response(
      JSON.stringify(goalsResult),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching goals:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use BetterAuth instead of Clerk
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    const userId = session?.user?.id;
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const parsedBody = CreateGoalSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedData = parsedBody.data;
    const { name, description, targetAmount, currency, targetDate, walletId } = validatedData;

    // If walletId is provided, verify it belongs to the user
    if (walletId) {
      const userWallet = await db
        .select()
        .from(wallets)
        .where(and(eq(wallets.id, walletId), eq(wallets.userId, userId)));

      if (userWallet.length === 0) {
        return new Response('Wallet not found', { status: 404 });
      }
    }

    // Create the goal
    const [newGoal] = await db
      .insert(goals)
      .values({
        userId,
        name,
        description: description || null,
        targetAmount,
        currency: currency || 'IDR',
        targetDate: targetDate || null,
        walletId: walletId || null,
      })
      .returning();

    return new Response(JSON.stringify(newGoal), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    return new Response('Internal server error', { status: 500 });
  }
}