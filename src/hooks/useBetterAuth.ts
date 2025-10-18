// src/hooks/useBetterAuth.ts
// Custom hook for BetterAuth integration

import { useState, useEffect } from 'react';

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
        // Get session from API
        const response = await fetch('/api/auth/session');
        
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData?.user) {
            setAuthState({
              user: sessionData.user,
              session: sessionData.session,
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
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          setAuthState({
            user: data.user,
            session: data.session,
            isLoading: false,
            isAuthenticated: true,
          });
          return { success: true, data };
        }
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData?.message || 'Sign in failed' };
      }
      
      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          setAuthState({
            user: data.user,
            session: data.session,
            isLoading: false,
            isAuthenticated: true,
          });
          return { success: true, data };
        }
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData?.message || 'Sign up failed' };
      }
      
      return { success: false, error: 'Sign up failed' };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
      });
      
      if (response.ok) {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return { success: true };
      } else {
        return { success: false, error: 'Sign out failed' };
      }
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