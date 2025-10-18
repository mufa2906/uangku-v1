// Test BetterAuth session endpoint
import { serverAuth } from '@/lib/auth/server-config';

export async function GET(request: Request) {
  try {
    // Test if the session endpoint works
    const session = await serverAuth.api.getSession({
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    return new Response(JSON.stringify({ session }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Session test error:', error);
    return new Response(JSON.stringify({ error: 'Session test failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}