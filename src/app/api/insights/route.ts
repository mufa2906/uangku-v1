// src/app/api/insights/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getWeeklyInsights } from '@/server/services/insightService';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const insights = await getWeeklyInsights(userId);
    
    return new Response(
      JSON.stringify(insights),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching insights:', error);
    return new Response('Internal server error', { status: 500 });
  }
}