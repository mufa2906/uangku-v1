// src/app/api/offline-transactions/route.ts
// API route for handling offline transaction sync

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// POST /api/offline-transactions - Sync offline transactions
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // In a real implementation, you would save the transaction to your database
    // For now, we'll just simulate a successful save
    
    console.log('Syncing offline transaction for user:', userId, body);
    
    // Simulate database save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return success with a mock ID
    return NextResponse.json({
      id: `synced_${Date.now()}`,
      userId,
      ...body,
      createdAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error syncing offline transaction:', error);
    return NextResponse.json(
      { error: 'Failed to sync transaction' },
      { status: 500 }
    );
  }
}