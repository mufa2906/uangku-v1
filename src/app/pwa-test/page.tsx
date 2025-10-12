// src/app/pwa-test/page.tsx
// Test page for PWA functionality

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { OfflineStorage } from '@/lib/offline-storage';
import { Wifi, WifiOff, RefreshCw, Database, Cloud, CloudOff } from 'lucide-react';

export default function PwaTestPage() {
  const { isOnline, pendingTransactions, syncPendingTransactions, hasPendingTransactions } = useOfflineSync();
  const [testResult, setTestResult] = useState<string>('');
  const [offlineTransactions, setOfflineTransactions] = useState<any[]>([]);

  // Load offline transactions
  useEffect(() => {
    const loadTransactions = () => {
      const transactions = OfflineStorage.getAllOfflineTransactions();
      setOfflineTransactions(transactions);
    };
    
    loadTransactions();
    
    // Refresh periodically
    const interval = setInterval(loadTransactions, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTestOnline = async () => {
    try {
      const response = await fetch('/api/test-offline');
      const data = await response.json();
      setTestResult(`✅ Online test successful: ${data.message} (${data.timestamp})`);
    } catch (error) {
      setTestResult(`❌ Online test failed: ${(error as Error).message}`);
    }
  };

  const handleTestOfflineStorage = () => {
    try {
      const testTransaction = {
        type: 'expense',
        amount: '150000',
        note: 'Test offline transaction',
        date: new Date().toISOString().split('T')[0],
        categoryId: 'test-category',
        walletId: 'test-wallet'
      };
      
      const id = OfflineStorage.addOfflineTransaction(testTransaction);
      
      if (id) {
        setTestResult(`✅ Offline storage test successful. Transaction ID: ${id}`);
        
        // Refresh transaction list
        const transactions = OfflineStorage.getAllOfflineTransactions();
        setOfflineTransactions(transactions);
      } else {
        setTestResult('❌ Offline storage test failed');
      }
    } catch (error) {
      setTestResult(`❌ Offline storage test failed: ${(error as Error).message}`);
    }
  };

  const handleClearOfflineStorage = () => {
    try {
      OfflineStorage.clearAll();
      setTestResult('✅ Offline storage cleared successfully');
      
      // Refresh transaction list
      const transactions = OfflineStorage.getAllOfflineTransactions();
      setOfflineTransactions(transactions);
    } catch (error) {
      setTestResult(`❌ Failed to clear offline storage: ${(error as Error).message}`);
    }
  };

  const handleForceSync = async () => {
    try {
      await syncPendingTransactions();
      setTestResult('✅ Manual sync initiated');
      
      // Refresh transaction list
      const transactions = OfflineStorage.getAllOfflineTransactions();
      setOfflineTransactions(transactions);
    } catch (error) {
      setTestResult(`❌ Manual sync failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen pb-20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">PWA Test Page</h1>
          <p className="text-gray-600">Test Progressive Web App functionality</p>
        </div>

        {/* Connection Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Current network connectivity status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <Wifi className="h-6 w-6 text-green-500" />
                ) : (
                  <WifiOff className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <h3 className="font-medium">
                    {isOnline ? 'Online' : 'Offline'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isOnline 
                      ? 'Connected to internet' 
                      : 'Working offline'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {pendingTransactions} pending
                </p>
                <p className="text-xs text-gray-500">
                  transactions to sync
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PWA Features */}
        <Card>
          <CardHeader>
            <CardTitle>PWA Features</CardTitle>
            <CardDescription>Test Progressive Web App capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleTestOnline}
                variant={isOnline ? "default" : "secondary"}
                disabled={!isOnline}
              >
                <Cloud className="mr-2 h-4 w-4" />
                Test Online Connectivity
              </Button>
              
              <Button 
                onClick={handleTestOfflineStorage}
                variant="outline"
              >
                <Database className="mr-2 h-4 w-4" />
                Test Offline Storage
              </Button>
              
              <Button 
                onClick={handleForceSync}
                variant="outline"
                disabled={!hasPendingTransactions || !isOnline}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Force Sync ({pendingTransactions})
              </Button>
              
              <Button 
                onClick={handleClearOfflineStorage}
                variant="destructive"
                disabled={offlineTransactions.length === 0}
              >
                <CloudOff className="mr-2 h-4 w-4" />
                Clear Offline Storage
              </Button>
            </div>
            
            {testResult && (
              <div className={`p-3 rounded-lg ${
                testResult.startsWith('✅') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <p className="text-sm">{testResult}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offline Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Offline Transactions</CardTitle>
            <CardDescription>
              Stored transactions awaiting sync ({offlineTransactions.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {offlineTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No offline transactions stored</p>
                <p className="text-sm mt-1">Create a test transaction to see it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...offlineTransactions].reverse().map((tx: any) => (
                  <div 
                    key={tx.id} 
                    className={`p-3 border rounded-lg ${
                      tx.synced 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">
                          {tx.transactionData.note || 'Untitled Transaction'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className={`font-medium ${tx.transactionData.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.transactionData.type === 'income' ? '+' : '-'}
                        {parseFloat(tx.transactionData.amount || '0').toLocaleString('id-ID')}
                      </div>
                    </div>
                    
                    {tx.synced && (
                      <div className="mt-2 text-xs text-green-600">
                        Synced to server
                      </div>
                    )}
                    
                    <div className="mt-1 text-xs text-gray-500">
                      Local ID: {tx.id.substring(0, 12)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Online Testing:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Ensure you have internet connectivity</li>
                  <li>• Click "Test Online Connectivity" to verify API access</li>
                  <li>• Create offline transactions to test sync functionality</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Offline Testing:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Use DevTools → Network → Set to "Offline"</li>
                  <li>• Try creating transactions - they should save locally</li>
                  <li>• Restore network and verify automatic sync</li>
                  <li>• Visit /offline when offline to see enhanced mode</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Verification:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Check that offline transactions appear in the list</li>
                  <li>• Verify sync works when back online</li>
                  <li>• Confirm no data loss during offline/online transitions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}