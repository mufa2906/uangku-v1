// src/app/api/notifications/send-test/route.ts
// API route for sending test notifications

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST /api/notifications/send-test - Send test notification
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

    // In a real implementation, you would get the user's push subscriptions
    // and send a test notification to each one
    console.log('Sending test notification to user:', userId);

    // Example of what you might do:
    /*
    // Get user's push subscriptions
    const subscriptions = await db.select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    // Send test notification to each subscription
    for (const subscription of subscriptions) {
      try {
        await sendGeneralNotification(
          subscription,
          'Test Notification',
          'This is a test notification from Uangku',
          '/dashboard'
        );
      } catch (error) {
        console.error('Failed to send test notification to subscription:', subscription.endpoint, error);
      }
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Test notification sent successfully' 
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}