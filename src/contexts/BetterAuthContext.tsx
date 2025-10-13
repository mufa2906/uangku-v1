// src/contexts/BetterAuthContext.tsx
// BetterAuth context provider

'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { auth } from '@/lib/auth/config';

interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BetterAuthContextType {
  user: User | null;
  session: Session | null;
  userId: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; data?: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string; data?: any }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
}

const BetterAuthContext = createContext<BetterAuthContextType | undefined>(undefined);

export function BetterAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentSession = await auth.api.getSession();
        
        if (currentSession) {
          setUser(currentSession.user);
          setSession(currentSession.session);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    checkAuthStatus();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await auth.api.signInEmail({
        email,
        password,
      });
      
      if (response) {
        setUser(response.user);
        setSession(response.session);
        return { success: true, data: response };
      }
      
      return { success: false, error: 'Sign in failed' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const response = await auth.api.signUpEmail({
        email,
        password,
        name,
      });
      
      if (response) {
        setUser(response.user);
        setSession(response.session);
        return { success: true, data: response };
      }
      
      return { success: false, error: 'Sign up failed' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  };

  const signOut = async () => {
    try {
      await auth.api.signOut();
      setUser(null);
      setSession(null);
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  };

  return (
    <BetterAuthContext.Provider value={{
      user,
      session,
      userId: user?.id || null,
      isLoaded,
      isSignedIn: !!user,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </BetterAuthContext.Provider>
  );
}

// Export a useAuth function that matches Clerk's API for compatibility
export function useAuth() {
  return useBetterAuthContext();
}