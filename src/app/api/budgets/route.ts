// src/app/api/budgets/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { budgets, categories } from '@/lib/schema';
import { and, eq, desc, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for creating/updating budgets
const BudgetSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places'),
  currency: z.string().length(3).optional(),
  period: z.enum(['weekly', 'monthly', 'yearly']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const categoryId = searchParams.get('categoryId');

    // Build the where conditions
    let whereConditions = [eq(budgets.userId, userId)];
    
    if (period) {
      whereConditions.push(eq(budgets.period, period as "weekly" | "monthly" | "yearly"));
    }
    
    if (categoryId) {
      whereConditions.push(eq(budgets.categoryId, categoryId));
    }

    const whereCondition = and(...whereConditions);

    // Fetch budgets
    const budgetsResult = await db
      .select({
        id: budgets.id,
        userId: budgets.userId,
        categoryId: budgets.categoryId,
        categoryName: categories.name,
        amount: budgets.amount,
        currency: budgets.currency,
        period: budgets.period,
        startDate: budgets.startDate,
        endDate: budgets.endDate,
        isActive: budgets.isActive,
        createdAt: budgets.createdAt,
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(whereCondition)
      .orderBy(desc(budgets.createdAt));

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
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const parsedBody = BudgetSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { categoryId, amount, currency, period, startDate, endDate, isActive } = parsedBody.data;

    // Verify that the category belongs to the user
    const userCategory = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

    if (userCategory.length === 0) {
      return new Response('Category not found or does not belong to user', { status: 404 });
    }

    // Create the budget
    const newBudget = await db
      .insert(budgets)
      .values({
        userId,
        categoryId,
        amount,
        currency: currency || 'IDR',
        period,
        startDate: new Date(startDate).toISOString().split('T')[0],
        endDate: new Date(endDate).toISOString().split('T')[0],
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    return new Response(JSON.stringify(newBudget[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    return new Response('Internal server error', { status: 500 });
  }
}