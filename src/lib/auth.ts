// src/lib/auth.ts
// Server-side authentication utility using BetterAuth

import { serverAuth } from '@/lib/auth/server-config';

// Export the BetterAuth instance for direct use
export { serverAuth as auth };