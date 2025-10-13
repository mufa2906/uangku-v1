// src/hooks/useBetterAuth.ts
// Custom hook for BetterAuth integration

import { useState, useEffect } from 'react';
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

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useBetterAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Get session from BetterAuth
        const session = await auth.api.getSession();
        
        if (session) {
          setAuthState({
            user: session.user,
            session: session.session,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
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
        setAuthState({
          user: response.user,
          session: response.session,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true, data: response };
      }
      
      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
        setAuthState({
          user: response.user,
          session: response.session,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true, data: response };
      }
      
      return { success: false, error: 'Sign up failed' };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const signOut = async () => {
    try {
      await auth.api.signOut();
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
}