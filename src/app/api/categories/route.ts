// src/app/api/categories/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';
import { CreateCategorySchema } from '@/lib/zod';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get filter parameters
    const type = request.nextUrl.searchParams.get('type') || '';

    // Build the where conditions
    let whereCondition = eq(categories.userId, userId);
    
    if (type) {
      whereCondition = and(whereCondition, eq(categories.type, type));
    }

    const categoriesResult = await db
      .select()
      .from(categories)
      .where(whereCondition)
      .orderBy(desc(categories.createdAt));

    return new Response(
      JSON.stringify(categoriesResult),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
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
    const parsedBody = CreateCategorySchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, icon, type } = parsedBody.data;

    // Check if a category with the same name and type already exists for the user (case-insensitive)
    // We need to retrieve all categories for this user and type, then check in memory
    const allUserCategories = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.type, type)
        )
      );

    // Check uniqueness by comparing lowercase versions in memory
    const duplicateCategory = allUserCategories.find(
      cat => cat.name && cat.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicateCategory) {
      return new Response(
        JSON.stringify({ error: 'Category with this name and type already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the category - store with original case
    const newCategory = await db
      .insert(categories)
      .values({
        userId,
        name,  // Store with original case
        icon: icon || null,
        type,
      })
      .returning();

    return new Response(JSON.stringify(newCategory[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return new Response('Internal server error', { status: 500 });
  }
}