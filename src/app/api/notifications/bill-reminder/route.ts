// src/app/api/notifications/bill-reminder/route.ts
// API route for sending bill reminder notifications

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST /api/notifications/bill-reminder - Send bill reminder notification
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
    const { billId, billName, amount, dueDate, daysUntilDue } = body;

    if (!billId || !billName || !amount || !dueDate || daysUntilDue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, you would get the user's push subscriptions
    // and send a bill reminder notification to each one
    console.log('Sending bill reminder notification to user:', userId, {
      billId,
      billName,
      amount,
      dueDate,
      daysUntilDue
    });

    // Example of what you might do:
    /*
    // Get user's push subscriptions
    const subscriptions = await db.select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    // Send bill reminder notification to each subscription
    for (const subscription of subscriptions) {
      try {
        await sendBillReminderNotification(
          subscription,
          { id: billId, name: billName, amount, dueDate },
          daysUntilDue
        );
      } catch (error) {
        console.error('Failed to send bill reminder to subscription:', subscription.endpoint, error);
      }
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Bill reminder notification sent successfully' 
    });
  } catch (error) {
    console.error('Error sending bill reminder notification:', error);
    return NextResponse.json(
      { error: 'Failed to send bill reminder notification' },
      { status: 500 }
    );
  }
}