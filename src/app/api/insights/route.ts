// src/app/api/insights/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getWeeklyInsights } from '@/server/services/insightService';

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