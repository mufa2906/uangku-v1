// src/app/profile/page.tsx
'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useState } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
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
  const { currencySymbol } = useCurrency();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: '/sign-in' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
            
            {/* Account Management Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Account Management</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Current Currency: <span className="font-semibold">{currencySymbol}</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/settings" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => setShowLogoutDialog(true)}
                    className="w-full sm:w-auto"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        description="Are you sure you want to sign out? You will need to sign back in to access your financial data."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  );
}