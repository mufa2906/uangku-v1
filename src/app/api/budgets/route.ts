// src/app/api/budgets/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { budgets, wallets, categories } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { CreateBudgetSchema, UpdateBudgetSchema } from '@/lib/zod';

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

    // Get query parameters for filtering
    const includeInactive = request.nextUrl.searchParams.get('includeInactive') === 'true';

    // Build the where conditions
    const filters = [
      eq(budgets.userId, userId),
      includeInactive ? undefined : eq(budgets.isActive, true),
    ].filter(Boolean) as any[];

    const whereCondition = filters.length > 1 ? and(...filters) : filters[0];

    const budgetsResult = await db
      .select({
        id: budgets.id,
        userId: budgets.userId,
        walletId: budgets.walletId,
        walletName: wallets.name, // Include wallet name
        categoryId: budgets.categoryId,
        categoryName: categories.name, // Include category name if linked
        name: budgets.name,
        description: budgets.description,
        allocatedAmount: budgets.allocatedAmount,
        remainingAmount: budgets.remainingAmount,
        currency: budgets.currency,
        period: budgets.period,
        startDate: budgets.startDate,
        endDate: budgets.endDate,
        isActive: budgets.isActive,
        createdAt: budgets.createdAt,
      })
      .from(budgets)
      .leftJoin(wallets, eq(budgets.walletId, wallets.id))
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(whereCondition);

    return new Response(
      JSON.stringify(budgetsResult),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching budgets:', error);
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
    const parsedBody = CreateBudgetSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedData = parsedBody.data;
    const { walletId, allocatedAmount, startDate, endDate, ...rest } = validatedData;
    
    // Verify that the wallet belongs to the user
    const userWallet = await db
      .select({
        id: wallets.id,
        balance: wallets.balance
      })
      .from(wallets)
      .where(and(eq(wallets.id, walletId), eq(wallets.userId, userId)));

    if (userWallet.length === 0) {
      return new Response('Wallet not found', { status: 404 });
    }

    // Check if allocated amount exceeds wallet balance
    const walletBalance = parseFloat(userWallet[0].balance);
    const allocatedAmountNum = parseFloat(allocatedAmount);
    
    if (allocatedAmountNum > walletBalance) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient funds', 
          message: `Cannot allocate ${allocatedAmount} from wallet with balance ${userWallet[0].balance}`
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the budget
    const [newBudget] = await db
      .insert(budgets)
      .values({
        userId: userId as any,
        walletId: walletId as any,
        allocatedAmount: allocatedAmount as any,
        remainingAmount: allocatedAmount as any, // Initially, remaining equals allocated
        startDate: new Date(startDate).toISOString().split('T')[0] as any,
        endDate: new Date(endDate).toISOString().split('T')[0] as any,
        ...rest,
      } as any)
      .returning();

    // Deduct the allocated amount from the wallet balance
    await db
      .update(wallets)
      .set({
        balance: (walletBalance - allocatedAmountNum).toString(),
      })
      .where(eq(wallets.id, walletId));

    return new Response(JSON.stringify(newBudget), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    return new Response('Internal server error', { status: 500 });
  }
}