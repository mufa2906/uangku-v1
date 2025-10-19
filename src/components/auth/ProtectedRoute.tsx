// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode; // Optional fallback component while loading
}

export default function ProtectedRoute({ children, fallback = null }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Redirect to sign-in page if not authenticated
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show fallback or nothing while loading or redirecting
  if (!isLoaded || (isLoaded && !isSignedIn)) {
    return fallback;
  }

  // Only render children if user is authenticated and loaded
  return <>{children}</>;
}