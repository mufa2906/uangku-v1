// src/lib/auth/middleware.ts
// BetterAuth middleware for protecting routes

import { NextRequest, NextResponse } from 'next/server';

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
  
  // For API routes, we'll let them through and handle auth in the route handlers
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // For protected pages, we'll let them through and handle auth in the components
  return NextResponse.next();
}

// Export the configuration for the middleware matcher
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};