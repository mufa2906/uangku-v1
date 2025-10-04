// src/app/api/budgets/[id]/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { budgets, categories } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for updating budgets
const BudgetUpdateSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places').optional(),
  currency: z.string().length(3).optional(),
  period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id } = params;

    // Fetch the budget and verify it belongs to the user
    const budgetResult = await db
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
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .limit(1);

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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Validate the request body
    const parsedBody = BudgetUpdateSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { categoryId, amount, currency, period, startDate, endDate, isActive } = parsedBody.data;

    // If updating category, verify it belongs to the user
    if (categoryId) {
      const userCategory = await db
        .select()
        .from(categories)
        .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

      if (userCategory.length === 0) {
        return new Response('Category not found or does not belong to user', { status: 404 });
      }
    }

    // Verify that the budget belongs to the user
    const existingBudget = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));

    if (existingBudget.length === 0) {
      return new Response('Budget not found or does not belong to user', { status: 404 });
    }

    // Update the budget
    const updatedBudget = await db
      .update(budgets)
      .set({
        categoryId: categoryId ?? existingBudget[0].categoryId,
        amount: amount ?? existingBudget[0].amount,
        currency: currency ?? existingBudget[0].currency,
        period: period ?? existingBudget[0].period,
        startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : existingBudget[0].startDate,
        endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : existingBudget[0].endDate,
        isActive: isActive !== undefined ? isActive : existingBudget[0].isActive,
      })
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .returning();

    return new Response(JSON.stringify(updatedBudget[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating budget:', error);
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

    // Verify that the budget belongs to the user
    const existingBudget = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));

    if (existingBudget.length === 0) {
      return new Response('Budget not found or does not belong to user', { status: 404 });
    }

    // Delete the budget
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return new Response('Internal server error', { status: 500 });
  }
}