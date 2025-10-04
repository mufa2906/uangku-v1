// src/components/shells/UserMenu.tsx
'use client';

import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User as UserIcon, LogOut } from 'lucide-react';

export default function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-gray-600" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-2 p-2">
          <p className="text-xs font-medium text-gray-500">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.primaryEmailAddress?.emailAddress || user.fullName || user.id}
          </p>
        </div>
        <DropdownMenuItem 
          onClick={() => signOut({ redirectUrl: '/sign-in' })}
          className="flex items-center cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}