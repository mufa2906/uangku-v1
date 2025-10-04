// src/app/sign-up/page.tsx
'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <SignUp 
        routing="virtual" 
        signInUrl="/sign-in"
      />
    </div>
  );
}