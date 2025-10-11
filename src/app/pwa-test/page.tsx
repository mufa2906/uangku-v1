// src/app/pwa-test/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { OfflineStorage } from '@/lib/offline-storage';
import AppBottomNav from '@/components/shells/AppBottomNav';

export default function PwaTestPage() {
  const { isOnline, pendingTransactions, syncPendingTransactions, hasPendingTransactions } = useOfflineSync();
  const [testResult, setTestResult] = useState<string>('');
  const [networkStatus, setNetworkStatus] = useState<string>('Checking...');

  useEffect(() => {
    setNetworkStatus(isOnline ? 'Online' : 'Offline');
  }, [isOnline]);

  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/test-offline');
      const data = await response.json();
      setTestResult(`API working at: ${data.timestamp}`);
    } catch (error) {
      setTestResult('API not available (expected when offline)');
    }
  };

  const addOfflineTransaction = () => {
    // Commented out for now - causing type issues
    // const testData = {
    //   walletId: 'test-wallet-id',
    //   categoryId: 'test-category-id',
    //   type: 'expense' as const,
    //   amount: '10000',
    //   note: 'Test offline transaction',
    //   date: new Date().toISOString(),
    //   userId: 'test-user-id',
    //   createdAt: new Date().toISOString(),
    //   walletName: 'Test Wallet',
    //   categoryName: 'Test Category'
    // } as any;

    // const id = OfflineStorage.addOfflineTransaction(testData);
    setTestResult(`Offline transaction feature test commented out`);
  };

  const syncNow = async () => {
    await syncPendingTransactions();
    setTestResult('Sync attempted');
  };

  return (
    <div className="pb-20">
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">PWA Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Network Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-lg ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                Status: {networkStatus}
              </p>
              <p className="mt-2">
                Pending offline transactions: {pendingTransactions}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Offline Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Has pending: {hasPendingTransactions ? 'Yes' : 'No'}</p>
              <p className="mt-2">Total stored: {OfflineStorage.getPendingCount()}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Functions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={testApiConnection}>
                Test API Connection
              </Button>
              <Button onClick={addOfflineTransaction} variant="secondary">
                Add Offline Transaction
              </Button>
              <Button onClick={syncNow} disabled={!isOnline}>
                Sync Now
              </Button>
            </div>
            
            {testResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="font-mono text-sm">{testResult}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PWA Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Manifest configured: /manifest.json
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Service Worker: /sw.js
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Offline transaction storage
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Auto-sync when online
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Accessibility context
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <AppBottomNav />
    </div>
  );
}