// src/components/test/TestAuthStatus.tsx
// Test component to display authentication status

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function TestAuthStatus() {
  const { user, isSignedIn, isLoaded } = useAuth();
  const [apiStatus, setApiStatus] = useState<{ success: boolean; message?: string; user?: any } | null>(null);

  useEffect(() => {
    const checkApiAuth = async () => {
      if (isSignedIn && isLoaded) {
        try {
          const response = await fetch('/api/test-auth');
          const data = await response.json();
          setApiStatus(data);
        } catch (error) {
          console.error('API auth check failed:', error);
          setApiStatus({ success: false, message: 'Failed to check API authentication' });
        }
      }
    };

    checkApiAuth();
  }, [isSignedIn, isLoaded]);

  if (!isLoaded) {
    return <div className="p-4 text-center">Loading authentication status...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
      
      <div className="space-y-2">
        <p><strong>Status:</strong> {isSignedIn ? 'Signed In' : 'Not Signed In'}</p>
        
        {user && (
          <div>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
          </div>
        )}
        
        {apiStatus && (
          <div className={`mt-3 p-2 rounded ${apiStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p><strong>API Status:</strong> {apiStatus.message}</p>
            {apiStatus.user && (
              <p><strong>API User:</strong> {apiStatus.user.email}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}