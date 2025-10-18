// src/lib/auth/server-config.ts
// Server-side BetterAuth configuration with database adapter

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import { 
  user, 
  account, 
  session, 
  verification 
} from '@/lib/schema';

export const serverAuth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'dev-secret-for-development-please-set-in-production',
  database: drizzleAdapter(db, {
    schema: {
      user: user,
      account: account,
      session: session,
      verificationToken: verification,
    },
    provider: 'pg', // Specify the database provider
  }),
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
      // Auto-refresh session on each request
      autoRefresh: true,
    },
  },
  cookies: {
    secure: process.env.NODE_ENV === 'production',
  },
  basePath: '/api/auth',
});