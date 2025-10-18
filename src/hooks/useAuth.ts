// src/hooks/useAuth.ts
// Compatibility hook that mimics Clerk's useAuth API using BetterAuth

import { useAuth as useBetterAuth } from '@/contexts/BetterAuthContext';

// Define the return type to match Clerk's useAuth
interface AuthReturnType {
  isLoaded: boolean;
  userId: string | null;
  sessionId: string | null;
  actor: null; // Not implementing actor for now
  orgId: null; // Not implementing organizations for now
  orgRole: null; // Not implementing organizations for now
  orgSlug: null; // Not implementing organizations for now
  has: (params: { permission: string } | { role: string }) => boolean;
  signOut: () => Promise<void>;
  isSignedIn: boolean;
  user: any | null; // Add user object to match Clerk's API (using BetterAuth)
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; data?: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string; data?: any }>;
}

export function useAuth(): AuthReturnType {
  const betterAuth = useBetterAuth();

  const signOut = async () => {
    await betterAuth.signOut();
  };

  const has = (params: { permission: string } | { role: string }): boolean => {
    // Simple implementation - in a real app, you might check permissions/roles
    return true;
  };

  return {
    isLoaded: betterAuth.isLoaded,
    userId: betterAuth.userId,
    sessionId: betterAuth.session?.id || null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has,
    signOut,
    isSignedIn: betterAuth.isSignedIn,
    user: betterAuth.user, // Add user object
    signIn: betterAuth.signIn,
    signUp: betterAuth.signUp,
  };
}