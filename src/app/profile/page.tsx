// src/app/profile/page.tsx
'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppBottomNav from '@/components/shells/AppBottomNav';

export default function ProfilePage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="pb-20">
        <div className="p-4 max-w-4xl mx-auto">
          <p className="text-center py-10 text-gray-500">Loading profile...</p>
        </div>
        <AppBottomNav />
      </div>
    );
  }

  const { signOut } = useClerk();

  return (
    <div className="pb-20"> {/* Space for bottom nav */}
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="text-lg">{user.fullName || 'Not provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-lg">{user.primaryEmailAddress?.emailAddress || 'Not provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Member since</h3>
                <p className="text-lg">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            
            {/* Logout Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="destructive"
                  onClick={() => signOut({ redirectUrl: '/sign-in' })}
                  className="w-full sm:w-auto"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  );
}