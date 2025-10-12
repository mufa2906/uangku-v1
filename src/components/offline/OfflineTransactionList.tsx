// src/components/offline/OfflineTransactionList.tsx
// Component for displaying offline transactions

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { OfflineStorage } from '@/lib/offline-storage';
import { RefreshCw, Database, Wifi, WifiOff } from 'lucide-react';

export default function OfflineTransactionList() {
  const [offlineTransactions, setOfflineTransactions] = useState<any[]>([]);
  const { isOnline, pendingTransactions, syncPendingTransactions, hasPendingTransactions } = useOfflineSync();

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

  const handleSync = async () => {
    await syncPendingTransactions();
    
    // Refresh transaction list
    const transactions = OfflineStorage.getAllOfflineTransactions();
    setOfflineTransactions(transactions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Offline Transactions
          </span>
          <span className="text-sm font-normal">
            {offlineTransactions.length} stored
          </span>
        </CardTitle>
        <CardDescription>
          These transactions will sync when you're back online
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {isOnline && hasPendingTransactions && (
              <Button 
                onClick={handleSync}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now ({pendingTransactions})
              </Button>
            )}
          </div>

          {/* Transaction List */}
          {offlineTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No offline transactions stored</p>
              <p className="text-sm mt-1">
                Create a transaction while offline to see it here
              </p>
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
        </div>
      </CardContent>
    </Card>
  );
}