// src/app/api/auth/[...route]/route.ts
// BetterAuth API route handler

import { serverAuth } from '@/lib/auth/server-config';

// Export the handler methods directly
export const GET = serverAuth.handler;
export const POST = serverAuth.handler;