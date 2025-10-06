// src/app/api/wallets/[id]/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { wallets } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { UpdateWalletSchema } from '@/lib/zod';

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

    const walletResult = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, id));

    if (walletResult.length === 0 || walletResult[0].userId !== userId) {
      return new Response('Wallet not found', { status: 404 });
    }

    return new Response(
      JSON.stringify(walletResult[0]),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching wallet:', error);
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
    const parsedBody = UpdateWalletSchema.safeParse(body);
    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsedBody.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedData = parsedBody.data;
    
    // Check if wallet exists and belongs to user
    const existingWallet = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, id));
    
    if (existingWallet.length === 0 || existingWallet[0].userId !== userId) {
      return new Response('Wallet not found', { status: 404 });
    }

    // Update the wallet
    const updatedWallet = await db
      .update(wallets)
      .set({
        ...validatedData,
      })
      .where(eq(wallets.id, id))
      .returning();

    return new Response(JSON.stringify(updatedWallet[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating wallet:', error);
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

    // Check if wallet exists and belongs to user
    const existingWallet = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, id));
    
    if (existingWallet.length === 0 || existingWallet[0].userId !== userId) {
      return new Response('Wallet not found', { status: 404 });
    }

    // Delete the wallet
    await db
      .delete(wallets)
      .where(eq(wallets.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    return new Response('Internal server error', { status: 500 });
  }
}