// src/app/api/push-subscriptions/route.ts
// API route for managing push notification subscriptions

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// POST /api/push-subscriptions - Save push subscription
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
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // In a real implementation, you would save the subscription to your database
    // For now, we'll just log it
    console.log('Saving push subscription for user:', userId, subscription);

    // Example of what you might do with a database:
    /*
    await db.insert(pushSubscriptions).values({
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      createdAt: new Date().toISOString()
    });
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription saved successfully' 
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/push-subscriptions - Remove push subscription
export async function DELETE(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would remove the subscription from your database
    // For now, we'll just log it
    console.log('Removing push subscription for user:', userId, endpoint);

    // Example of what you might do with a database:
    /*
    await db.delete(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint)
      ));
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription removed successfully' 
    });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}

// GET /api/push-subscriptions - Get user's push subscriptions
export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real implementation, you would fetch the subscriptions from your database
    // For now, we'll return an empty array
    console.log('Fetching push subscriptions for user:', userId);

    // Example of what you might do with a database:
    /*
    const subscriptions = await db.select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
    */

    return NextResponse.json({ 
      subscriptions: [] // Return empty array for now
    });
  } catch (error) {
    console.error('Error fetching push subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}