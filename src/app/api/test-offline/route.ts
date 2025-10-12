// src/app/api/test-offline/route.ts
// Test API route for offline functionality

import { NextResponse } from 'next/server';

// GET /api/test-offline - Test endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Online test endpoint working',
    timestamp: new Date().toISOString()
  });
}

// POST /api/test-offline - Test POST endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'Online POST test endpoint working',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}