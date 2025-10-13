// src/lib/auth/config.ts
// BetterAuth configuration for Uangku

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import { 
  users, 
  accounts, 
  sessions, 
  verificationTokens 
} from '@/lib/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema: {
      user: users,
      account: accounts,
      session: sessions,
      verificationToken: verificationTokens,
    },
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
  cookies: {
    secure: process.env.NODE_ENV === 'production',
  },
  basePath: '/api/auth',
});