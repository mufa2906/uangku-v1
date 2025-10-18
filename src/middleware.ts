import { betterAuthMiddleware } from '@/lib/auth/middleware';
import type { NextRequest } from 'next/server';

// Export the middleware as default
export default betterAuthMiddleware;

// Export config for middleware matcher
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};