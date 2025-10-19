// src/contexts/BetterAuthContext.tsx
// BetterAuth context provider with infinite session support

'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

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
  refreshSession: () => Promise<void>;
}

const BetterAuthContext = createContext<BetterAuthContextType | undefined>(undefined);

export function BetterAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Check auth status on mount using fetch to API routes
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Use the correct BetterAuth session endpoint
        const response = await fetch('/api/auth/session');
        
        if (response.ok) {
          const data = await response.json();
          if (data?.user) {
            setUser(data.user);
            setSession(data.session);
          }
        } else if (response.status === 401) {
          // Not authenticated, clear user data
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // On network error, assume not authenticated but don't crash
        setUser(null);
        setSession(null);
      } finally {
        setIsLoaded(true);
      }
    };

    checkAuthStatus();
    
    // Set up periodic session refresh (every 15 minutes)
    const interval = setInterval(async () => {
      await refreshSession();
    }, 15 * 60 * 1000); // 15 minutes
    
    setSessionCheckInterval(interval as any);
    
    // Cleanup interval on unmount
    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, []);

  // Refresh session function
  const refreshSession = async () => {
    if (!isLoaded) return; // Don't refresh if not loaded yet
    
    try {
      const response = await fetch('/api/auth/session');
      
      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          setUser(data.user);
          setSession(data.session);
        } else {
          // Session expired or invalid, clear user data
          setUser(null);
          setSession(null);
        }
      } else if (response.status === 401) {
        // Not authenticated, clear user data
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      // Network error, but don't automatically log out
      console.warn('Session refresh network error:', error);
    }
  };

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
          setUser(data.user);
          setSession(data.session);
          return { success: true, data };
        }
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData?.message || 'Sign in failed' };
      }
      
      return { success: false, error: 'Sign in failed' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error?.message || 'Unknown error' };
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
          setUser(data.user);
          setSession(data.session);
          return { success: true, data };
        }
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData?.message || 'Sign up failed' };
      }
      
      return { success: false, error: 'Sign up failed' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  };

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
      });
      
      if (response.ok) {
        setUser(null);
        setSession(null);
        return { success: true };
      } else {
        return { success: false, error: 'Sign out failed' };
      }
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
      refreshSession,
    }}>
      {children}
    </BetterAuthContext.Provider>
  );
}

// Export a useAuth function that matches Clerk's API for compatibility
export function useAuth() {
  const context = useContext(BetterAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a BetterAuthProvider');
  }
  return context;
}