// src/lib/auth/middleware.ts
// BetterAuth middleware for protecting routes

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/sign-in', '/sign-up', '/offline', '/sw.js', '/manifest.json', '/icons/'];

// Function to check if a route is public
function isPublicRoute(pathname: string) {
  return publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(route) ||
    pathname.match(/^\/icons\/.*$/)
  );
}

// BetterAuth middleware
export async function betterAuthMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // For API routes, check authentication
  if (pathname.startsWith('/api/')) {
    try {
      // Get session from request
      const session = await auth.api.getSession({
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      });
      
      // If no session and route requires auth, return unauthorized
      if (!session) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Add user info to request headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', session.user.id);
      
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
      return response;
    } catch (error) {
      console.error('Auth middleware error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Authentication error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // For protected pages, check authentication and redirect if needed
  try {
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    if (!session) {
      // Redirect to sign-in page
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('redirect_url', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
    
    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.user.id);
    
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Auth middleware error:', error);
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }
}

// Export the configuration for the middleware matcher
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};