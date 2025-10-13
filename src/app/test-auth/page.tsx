// src/app/test-auth/page.tsx
// Test page for BetterAuth implementation

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function TestAuthPage() {
  const { user, isSignedIn, signOut, isLoaded } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      if (isSignUp) {
        // Sign up
        const response = await fetch('/api/auth/sign-up', {
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

        const data = await response.json();
        
        if (response.ok) {
          setMessage('Sign up successful! You can now sign in.');
        } else {
          setMessage(`Sign up failed: ${data.error || 'Unknown error'}`);
        }
      } else {
        // Sign in
        const response = await fetch('/api/auth/sign-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          setMessage('Sign in successful!');
          // Refresh the page to update auth state
          window.location.reload();
        } else {
          setMessage(`Sign in failed: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error('Auth error:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold text-center mb-6">BetterAuth Test</h1>
        
        {isSignedIn ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 rounded-lg">
              <h2 className="text-xl font-semibold">You are signed in!</h2>
              <p className="mt-2"><strong>Name:</strong> {user?.name || 'Not provided'}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>User ID:</strong> {user?.id}</p>
            </div>
            
            <button
              onClick={signOut}
              className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-100 rounded-lg">
              <h2 className="text-xl font-semibold">Sign {isSignUp ? 'Up' : 'In'}</h2>
            </div>
            
            {message && (
              <div className={`p-3 rounded-md ${message.includes('failed') || message.includes('error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Your name"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>
            
            <div className="text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-500 hover:text-blue-700 underline"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}