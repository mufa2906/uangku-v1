// src/app/api/bills/[id]/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bills, wallets, categories } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq, sql } from 'drizzle-orm';
import { UpdateBillSchema } from '@/lib/zod';

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

    const billResult = await db
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
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));

    if (billResult.length === 0) {
      return new Response('Bill not found', { status: 404 });
    }

    return new Response(
      JSON.stringify(billResult[0]),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching bill:', error);
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
    const parsedBody = UpdateBillSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedData = parsedBody.data;

    // Check if bill exists and belongs to user
    const existingBill = await db
      .select()
      .from(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));

    if (existingBill.length === 0) {
      return new Response('Bill not found', { status: 404 });
    }

    // Verify wallet belongs to user if provided and changing
    if (validatedData.walletId) {
      const userWallet = await db
        .select()
        .from(wallets)
        .where(and(eq(wallets.id, validatedData.walletId), eq(wallets.userId, userId)));

      if (userWallet.length === 0) {
        return new Response('Wallet not found', { status: 404 });
      }
    }

    // Verify category belongs to user if provided and changing
    if (validatedData.categoryId) {
      const userCategory = await db
        .select()
        .from(categories)
        .where(and(eq(categories.id, validatedData.categoryId), eq(categories.userId, userId)));

      if (userCategory.length === 0) {
        return new Response('Category not found', { status: 404 });
      }
    }

    // Update the bill
    const [updatedBill] = await db
      .update(bills)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(eq(bills.id, id), eq(bills.userId, userId)))
      .returning();

    return new Response(JSON.stringify(updatedBill), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating bill:', error);
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

    // Check if bill exists and belongs to user
    const existingBill = await db
      .select()
      .from(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));

    if (existingBill.length === 0) {
      return new Response('Bill not found', { status: 404 });
    }

    // Delete the bill
    await db
      .delete(bills)
      .where(eq(bills.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return new Response('Internal server error', { status: 500 });
  }
}