// src/app/api/transactions/[id]/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { transactions } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { UpdateTransactionSchema } from '@/lib/zod';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    
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

    const { id } = params;
    const updates = parsedBody.data;

    // Ensure the transaction belongs to the user
    const transaction = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    if (transaction.length === 0) {
      return new Response('Transaction not found', { status: 404 });
    }

    // Update the transaction
    const updateObject: any = { ...updates };
    
    // Handle date conversion if provided
    if (updates.date) {
      updateObject.date = new Date(updates.date);
    }
    
    const updatedTransaction = await db
      .update(transactions)
      .set(updateObject)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();

    return new Response(JSON.stringify(updatedTransaction[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id } = params;

    // Ensure the transaction belongs to the user
    const transaction = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    if (transaction.length === 0) {
      return new Response('Transaction not found', { status: 404 });
    }

    // Delete the transaction
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return new Response('Internal server error', { status: 500 });
  }
}