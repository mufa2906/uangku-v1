// src/lib/auth/config.ts
// Client-side BetterAuth configuration for Uangku (minimal config for API calls)

import { betterAuth } from 'better-auth';

// Client-side config without database adapter
// This config is used only for client-side API calls to BetterAuth endpoints
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'dev-secret-for-development-please-set-in-production',
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  rateLimit: {
    enabled: true,
  },
  session: {
    // Truly infinite session duration
    expiresIn: 10 * 365 * 24 * 60 * 60, // 10 years in seconds
    cookie: {
      maxAge: 10 * 365 * 24 * 60 * 60, // 10 years in seconds
    },
  },
  cookies: {
    secure: process.env.NODE_ENV === 'production',
  },
  basePath: '/api/auth',
});