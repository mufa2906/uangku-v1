// src/app/api/transactions/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq, desc, asc, count } from 'drizzle-orm';
import { CreateTransactionSchema } from '@/lib/zod';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get pagination parameters
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get sorting parameters
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'date';
    const sortOrder = request.nextUrl.searchParams.get('sortOrder') || 'desc';

    // Get filter parameters
    const type = request.nextUrl.searchParams.get('type') || '';
    const categoryId = request.nextUrl.searchParams.get('categoryId') || '';
    const startDate = request.nextUrl.searchParams.get('startDate') || '';
    const endDate = request.nextUrl.searchParams.get('endDate') || '';

    // Build the where conditions
    let whereCondition = eq(transactions.userId, userId);
    
    if (type) {
      whereCondition = and(whereCondition, eq(transactions.type, type));
    }
    
    if (categoryId) {
      whereCondition = and(whereCondition, eq(transactions.categoryId, categoryId));
    }
    
    if (startDate) {
      whereCondition = and(whereCondition, 
        new Date(transactions.date) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      whereCondition = and(whereCondition, 
        new Date(transactions.date) <= new Date(endDate)
      );
    }

    // Build the query
    let orderCondition = desc(transactions.date);
    if (sortBy === 'date') {
      orderCondition = sortOrder === 'asc' ? asc(transactions.date) : desc(transactions.date);
    } else if (sortBy === 'amount') {
      orderCondition = sortOrder === 'asc' ? asc(transactions.amount) : desc(transactions.amount);
    }

    const transactionsResult = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        type: transactions.type,
        amount: transactions.amount,
        note: transactions.note,
        date: transactions.date,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(whereCondition)
      .orderBy(orderCondition)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.userId, userId));
    const totalCount = Number(totalCountResult[0].count);

    return new Response(
      JSON.stringify({
        transactions: transactionsResult,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
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
    const parsedBody = CreateTransactionSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { categoryId, type, amount, note, date } = parsedBody.data;

    // If no category ID is provided, we'll create a default category
    let validCategoryId = categoryId;
    if (!validCategoryId) {
      // For now, we'll require a category or create a default one
      // In a real app, you might have default categories
      return new Response(
        JSON.stringify({ error: 'Category ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify that the category belongs to the user
    const userCategory = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, validCategoryId), eq(categories.userId, userId)));

    if (userCategory.length === 0) {
      return new Response('Category not found', { status: 404 });
    }

    // Create the transaction
    const newTransaction = await db
      .insert(transactions)
      .values({
        userId,
        categoryId: validCategoryId,
        type,
        amount,
        note: note || null,
        date: new Date(date),
      })
      .returning();

    return new Response(JSON.stringify(newTransaction[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response('Internal server error', { status: 500 });
  }
}