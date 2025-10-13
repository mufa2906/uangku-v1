// src/app/api/auth/[...route]/route.ts
// BetterAuth API route handler

import { auth } from '@/lib/auth/config';

export const { GET, POST } = auth.handler;