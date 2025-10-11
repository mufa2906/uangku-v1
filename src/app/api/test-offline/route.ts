// src/app/api/test-offline/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      message: 'API is working',
      timestamp: new Date().toISOString(),
      endpoint: '/api/test-offline'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}