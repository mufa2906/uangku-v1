// src/app/api/bills/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bills, wallets, categories } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq, desc, gte, lte, sql } from 'drizzle-orm';
import { CreateBillSchema, UpdateBillSchema } from '@/lib/zod';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get query parameters
    const includeInactive = request.nextUrl.searchParams.get('includeInactive') === 'true';
    const upcomingOnly = request.nextUrl.searchParams.get('upcomingOnly') === 'true';
    const dueDateFrom = request.nextUrl.searchParams.get('dueDateFrom');
    const dueDateTo = request.nextUrl.searchParams.get('dueDateTo');

    // Build the where conditions
    let filters = [
      eq(bills.userId, userId),
      includeInactive ? undefined : eq(bills.isActive, true),
      upcomingOnly ? eq(bills.isPaid, false) : undefined,
      dueDateFrom ? gte(bills.dueDate, dueDateFrom) : undefined,
      dueDateTo ? lte(bills.dueDate, dueDateTo) : undefined,
    ].filter(Boolean) as any[];

    const whereCondition = filters.length > 1 ? and(...filters) : filters[0] || eq(bills.userId, userId);

    const billsResult = await db
      .select({
        id: bills.id,
        userId: bills.userId,
        name: bills.name,
        description: bills.description,
        amount: bills.amount,
        currency: bills.currency,
        dueDate: bills.dueDate,
        nextDueDate: bills.nextDueDate,
        recurrencePattern: bills.recurrencePattern,
        recurrenceInterval: bills.recurrenceInterval,
        autoNotify: bills.autoNotify,
        notifyDaysBefore: bills.notifyDaysBefore,
        walletId: bills.walletId,
        walletName: wallets.name,
        categoryId: bills.categoryId,
        categoryName: categories.name,
        isPaid: bills.isPaid,
        paidDate: bills.paidDate,
        isActive: bills.isActive,
        createdAt: bills.createdAt,
        updatedAt: bills.updatedAt,
      })
      .from(bills)
      .leftJoin(wallets, eq(bills.walletId, wallets.id))
      .leftJoin(categories, eq(bills.categoryId, categories.id))
      .where(whereCondition)
      .orderBy(desc(bills.dueDate));

    return new Response(
      JSON.stringify(billsResult),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching bills:', error);
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
    const parsedBody = CreateBillSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedData = parsedBody.data;

    // Verify wallet belongs to user if provided
    if (validatedData.walletId) {
      const userWallet = await db
        .select()
        .from(wallets)
        .where(and(eq(wallets.id, validatedData.walletId), eq(wallets.userId, userId)));

      if (userWallet.length === 0) {
        return new Response('Wallet not found', { status: 404 });
      }
    }

    // Verify category belongs to user if provided
    if (validatedData.categoryId) {
      const userCategory = await db
        .select()
        .from(categories)
        .where(and(eq(categories.id, validatedData.categoryId), eq(categories.userId, userId)));

      if (userCategory.length === 0) {
        return new Response('Category not found', { status: 404 });
      }
    }

    // Create the bill
    const [newBill] = await db
      .insert(bills)
      .values({
        userId,
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return new Response(JSON.stringify(newBill), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    return new Response('Internal server error', { status: 500 });
  }
}