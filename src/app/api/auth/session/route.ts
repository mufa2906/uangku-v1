// BetterAuth session endpoint
import { serverAuth } from '@/lib/auth/server-config';

export async function GET(request: Request) {
  try {
    // Get session from BetterAuth
    const session = await serverAuth.api.getSession({
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    // Return user and session data in the format expected by the frontend
    if (session?.user) {
      return new Response(JSON.stringify({ 
        user: session.user,
        session: session.session
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // No active session
      return new Response(JSON.stringify({ 
        user: null,
        session: null
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Session error:', error);
    return new Response(JSON.stringify({ 
      user: null,
      session: null,
      error: 'Failed to get session'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}