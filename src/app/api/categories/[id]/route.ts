// src/app/api/categories/[id]/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { categories, transactions } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, count, not } from 'drizzle-orm';
import { UpdateCategorySchema } from '@/lib/zod';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const parsedBody = UpdateCategorySchema.safeParse(body);
    if (!parsedBody.success) {
      console.error('Validation error:', parsedBody.error.flatten());
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id } = params;
    const updates = parsedBody.data;

    // Ensure the category belongs to the user
    const category = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));

    if (category.length === 0) {
      return new Response('Category not found', { status: 404 });
    }

    // Validate and process name if provided
    if (updates.name !== undefined) {
      if (updates.name === null) {
        // Allow null names
      } else if (typeof updates.name === 'string') {
        if (updates.name.trim() === '') {
          return new Response(
            JSON.stringify({ error: 'Name cannot be empty' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (updates.name.length > 50) {
          return new Response(
            JSON.stringify({ error: 'Name must be less than 50 characters' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        // Check if a category with the same name and type already exists for the user (case-insensitive)
        if (updates.type && updates.name) {
          const allUserCategories = await db
            .select()
            .from(categories)
            .where(
              and(
                eq(categories.userId, userId),
                eq(categories.type, updates.type)
              )
            );

          // Check uniqueness by comparing lowercase versions in memory
          const duplicateCategory = allUserCategories.find(
            cat => cat.id !== id && cat.name && 
                   cat.name.toLowerCase() === updates.name.toLowerCase()
          );

          if (duplicateCategory) {
            return new Response(
              JSON.stringify({ error: 'Category with this name and type already exists' }),
              { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Name must be a string or null' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update the category - store with original case (no conversion needed)
    const updateObject: any = { ...updates };
    
    const updatedCategory = await db
      .update(categories)
      .set(updateObject)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();

    return new Response(JSON.stringify(updatedCategory[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating category:', error);
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

    // Ensure the category belongs to the user
    const category = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));

    if (category.length === 0) {
      return new Response('Category not found', { status: 404 });
    }

    // Check if any transactions are using this category
    const transactionCountResult = await db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.categoryId, id));
    
    const transactionCount = transactionCountResult[0].count;

    if (transactionCount > 0) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete category: it is used by existing transactions' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the category
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return new Response('Internal server error', { status: 500 });
  }
}