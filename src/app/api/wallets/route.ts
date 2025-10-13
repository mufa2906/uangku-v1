// src/app/api/wallets/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { wallets } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { CreateWalletSchema, UpdateWalletSchema } from '@/lib/zod';

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
      eq(wallets.userId, userId),
      includeInactive ? undefined : eq(wallets.isActive, true),
    ].filter(Boolean) as any[];

    const whereCondition = filters.length > 1 ? and(...filters) : filters[0];

    const walletsResult = await db
      .select()
      .from(wallets)
      .where(whereCondition);

    return new Response(
      JSON.stringify(walletsResult),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching wallets:', error);
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
    const parsedBody = CreateWalletSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedData = parsedBody.data;
    const { name, type, currency } = validatedData;
    
    // Create the wallet
    const newWallet = await db
      .insert(wallets)
      .values({
        userId,
        name,
        type,
        currency: currency || 'IDR',
        balance: validatedData.balance || '0',
      })
      .returning();

    return new Response(JSON.stringify(newWallet[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    return new Response('Internal server error', { status: 500 });
  }
}