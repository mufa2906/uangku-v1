// src/components/shells/AppBottomNav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Plus, FileText, Folder, User, Settings, Calendar, Wallet, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: FileText,
    },
    {
      name: 'Wallets',
      href: '/wallets',
      icon: Wallet,
    },
    {
      name: 'Budgets',
      href: '/budgets',
      icon: Calendar,
    },
    {
      name: 'Goals',
      href: '/goals',
      icon: Target,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-around items-center py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center',
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}