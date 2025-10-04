// src/app/sign-in/page.tsx
'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <SignIn 
        routing="virtual" 
        signUpUrl="/sign-up"
      />
    </div>
  );
}