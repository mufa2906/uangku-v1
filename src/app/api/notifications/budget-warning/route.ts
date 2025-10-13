// src/app/api/notifications/budget-warning/route.ts
// API route for sending budget warning notifications

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST /api/notifications/budget-warning - Send budget warning notification
export async function POST(request: Request) {
  try {
    // Use BetterAuth instead of Clerk
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { budgetName, percentageUsed } = body;

    if (!budgetName || percentageUsed === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, you would get the user's push subscriptions
    // and send a budget warning notification to each one
    console.log('Sending budget warning notification to user:', userId, {
      budgetName,
      percentageUsed
    });

    // Example of what you might do:
    /*
    // Get user's push subscriptions
    const subscriptions = await db.select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    // Send budget warning notification to each subscription
    for (const subscription of subscriptions) {
      try {
        await sendBudgetWarningNotification(
          subscription,
          { name: budgetName },
          percentageUsed
        );
      } catch (error) {
        console.error('Failed to send budget warning to subscription:', subscription.endpoint, error);
      }
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Budget warning notification sent successfully' 
    });
  } catch (error) {
    console.error('Error sending budget warning notification:', error);
    return NextResponse.json(
      { error: 'Failed to send budget warning notification' },
      { status: 500 }
    );
  }
}