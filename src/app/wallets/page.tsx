// src/app/wallets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  FloatingButton,
  Plus,
  Edit,
  Trash2,
  Wallet as WalletIcon,
  AlertCircle,
  CheckCircle
} from '@/components/ui/icons';
import AppBottomNav from '@/components/shells/AppBottomNav';
import { Wallet } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function WalletsPage() {
  const { userId } = useAuth();
  const { formatCurrency } = useCurrency();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as 'cash' | 'bank' | 'credit_card' | 'e_wallet' | 'savings',
    currency: 'IDR',
    balance: '0'
  });

  useEffect(() => {
    if (userId) {
      fetchWallets();
    }
  }, [userId]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/wallets');
      if (!response.ok) {
        throw new Error('Failed to fetch wallets');
      }
      
      const data = await response.json();
      setWallets(data);
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setError('Failed to load wallets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = () => {
    setEditingWallet(null);
    setFormData({
      name: '',
      type: 'cash',
      currency: 'IDR',
      balance: '0'
    });
    setIsFormOpen(true);
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      type: wallet.type as 'cash' | 'bank' | 'credit_card' | 'e_wallet' | 'savings',
      currency: wallet.currency,
      balance: wallet.balance
    });
    setIsFormOpen(true);
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!window.confirm('Are you sure you want to delete this wallet? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/wallets/${walletId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete wallet');
      }

      // Refresh the wallets list
      await fetchWallets();
    } catch (err) {
      console.error('Error deleting wallet:', err);
      setError('Failed to delete wallet. Please try again.');
    }
  };

  const handleSubmitWallet = async () => {
    try {
      setError(null);
      
      let response;
      const submitData = {
        ...formData,
        balance: formData.balance || '0' // Ensure balance is at least 0
      };
      
      if (editingWallet) {
        // Update existing wallet
        response = await fetch(`/api/wallets/${editingWallet.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
      } else {
        // Create new wallet
        response = await fetch('/api/wallets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save wallet');
      }

      // Close form and refresh data
      setIsFormOpen(false);
      await fetchWallets();
    } catch (err) {
      console.error('Error saving wallet:', err);
      setError(`Failed to save wallet: ${(err as Error).message}`);
    }
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return '🏦';
      case 'credit_card':
        return '💳';
      case 'e_wallet':
        return '📱';
      case 'savings':
        return '🔒';
      default: // cash
        return '💵';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="pb-20">
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Wallets</h1>
          <div className="text-center py-10 text-gray-500">Loading wallets...</div>
        </div>
        <AppBottomNav />
      </div>
    );
  }

  return (
    <div className="pb-20"> {/* Space for bottom nav */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Wallets</h1>
          <Button onClick={handleCreateWallet}>
            <Plus className="mr-2 h-4 w-4" />
            New Wallet
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {wallets.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <WalletIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No wallets</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first wallet.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateWallet}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <Card key={wallet.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center text-lg">
                        <span className="mr-2 text-xl">{getWalletIcon(wallet.type)}</span>
                        <span>{wallet.name}</span>
                      </CardTitle>
                      <p className="text-sm text-gray-500 capitalize">{wallet.type.replace('_', ' ')} • {wallet.currency}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditWallet(wallet)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteWallet(wallet.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(parseFloat(wallet.balance || '0'), wallet.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Balance
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(wallet.isActive)}`}>
                        {wallet.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Wallet Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWallet ? 'Edit Wallet' : 'Create New Wallet'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
                placeholder="e.g. Cash, BCA Account, Credit Card"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'cash' | 'bank' | 'credit_card' | 'e_wallet' | 'savings') => 
                  setFormData({...formData, type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({...formData, currency: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR (Indonesian Rupiah)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                  <SelectItem value="SGD">SGD (Singapore Dollar)</SelectItem>
                  <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                  <SelectItem value="MYR">MYR (Malaysian Ringgit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                Initial Balance
              </Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({...formData, balance: e.target.value})}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitWallet}>
              {editingWallet ? 'Update' : 'Create'} Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <FloatingButton onClick={handleCreateWallet}>
        <Plus className="h-6 w-6" />
      </FloatingButton>

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  );
}