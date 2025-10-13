// src/app/api/test-auth/route.ts
// Test API route for authentication

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export async function GET(request: Request) {
  try {
    // Get session from request
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Not authenticated' 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Authenticated',
      user: session.user,
      session: session.session
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}