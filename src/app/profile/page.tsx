// src/app/profile/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, Folder, Target, FileText, Wallet, Plus, Edit, Trash2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import AppBottomNav from '@/components/shells/AppBottomNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Define wallet type
interface WalletType {
  id: string;
  userId: string;
  name: string;
  type: 'cash' | 'bank' | 'credit_card' | 'e_wallet' | 'savings';
  balance: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { currencySymbol } = useCurrency();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);
  const [deleteWalletId, setDeleteWalletId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [walletForm, setWalletForm] = useState({
    name: '',
    type: 'cash' as 'cash' | 'bank' | 'credit_card' | 'e_wallet' | 'savings',
    balance: '',
    currency: 'IDR',
  });

  const router = useRouter();
  
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

  // Fetch wallets
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await fetch('/api/wallets');
        if (response.ok) {
          const data = await response.json();
          setWallets(data);
        }
      } catch (error) {
        console.error('Error fetching wallets:', error);
      } finally {
        setLoadingWallets(false);
      }
    };

    fetchWallets();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect manually after sign out
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleWalletFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingWallet ? 'PUT' : 'POST';
      const url = editingWallet ? `/api/wallets/${editingWallet.id}` : '/api/wallets';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...walletForm,
          balance: walletForm.balance || '0',
        }),
      });
      
      if (response.ok) {
        const wallet = await response.json();
        
        if (editingWallet) {
          // Update existing wallet in state
          setWallets(wallets.map(w => w.id === editingWallet.id ? wallet : w));
        } else {
          // Add new wallet to state
          setWallets([...wallets, wallet]);
        }
        
        // Reset form
        setWalletForm({
          name: '',
          type: 'cash',
          balance: '',
          currency: 'IDR',
        });
        setShowWalletForm(false);
        setEditingWallet(null);
      } else {
        const error = await response.json();
        console.error('Error saving wallet:', error);
      }
    } catch (error) {
      console.error('Error saving wallet:', error);
    }
  };

  const handleEditWallet = (wallet: WalletType) => {
    setEditingWallet(wallet);
    setWalletForm({
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance,
      currency: wallet.currency,
    });
    setShowWalletForm(true);
  };

  const handleDeleteWalletClick = (walletId: string) => {
    setDeleteWalletId(walletId);
    setShowDeleteDialog(true);
  };

  const handleDeleteWallet = async () => {
    if (!deleteWalletId) return;
    
    try {
      const response = await fetch(`/api/wallets/${deleteWalletId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setWallets(wallets.filter(w => w.id !== deleteWalletId));
        setDeleteWalletId(null);
        setShowDeleteDialog(false);
      } else {
        console.error('Error deleting wallet');
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
    }
  };

  const resetWalletForm = () => {
    setWalletForm({
      name: '',
      type: 'cash',
      balance: '',
      currency: 'IDR',
    });
    setEditingWallet(null);
    setShowWalletForm(false);
  };

  // Get wallet type display name
  const getWalletTypeDisplayName = (type: string) => {
    const typeMap: Record<string, string> = {
      cash: 'Cash',
      bank: 'Bank Account',
      credit_card: 'Credit Card',
      e_wallet: 'E-Wallet',
      savings: 'Savings',
    };
    return typeMap[type] || type;
  };

  return (
    <ProtectedRoute>
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
            
            {/* Wallet Management Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Wallet Management</h3>
                <Button 
                  onClick={() => {
                    resetWalletForm();
                    setShowWalletForm(true);
                  }}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Wallet
                </Button>
              </div>
              
              {showWalletForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>{editingWallet ? 'Edit Wallet' : 'Add New Wallet'}</CardTitle>
                    <CardDescription>
                      {editingWallet ? 'Update your wallet details' : 'Create a new wallet to track your finances'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleWalletFormSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="wallet-name">Wallet Name</Label>
                        <Input
                          id="wallet-name"
                          value={walletForm.name}
                          onChange={(e) => setWalletForm({...walletForm, name: e.target.value})}
                          placeholder="e.g., Cash, BCA Account, Credit Card"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wallet-type">Wallet Type</Label>
                          <Select 
                            value={walletForm.type} 
                            onValueChange={(value: any) => setWalletForm({...walletForm, type: value})}
                          >
                            <SelectTrigger>
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
                        
                        <div className="space-y-2">
                          <Label htmlFor="wallet-currency">Currency</Label>
                          <Select 
                            value={walletForm.currency} 
                            onValueChange={(value: any) => setWalletForm({...walletForm, currency: value})}
                          >
                            <SelectTrigger>
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
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="wallet-balance">Initial Balance</Label>
                        <Input
                          id="wallet-balance"
                          type="number"
                          value={walletForm.balance}
                          onChange={(e) => setWalletForm({...walletForm, balance: e.target.value})}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={resetWalletForm}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingWallet ? 'Update Wallet' : 'Create Wallet'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
              
              {loadingWallets ? (
                <p className="text-center py-4 text-gray-500">Loading wallets...</p>
              ) : wallets.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No wallets</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new wallet.</p>
                  <div className="mt-6">
                    <Button 
                      onClick={() => {
                        resetWalletForm();
                        setShowWalletForm(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Wallet
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {wallets.map((wallet) => (
                    <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{wallet.name}</div>
                        <div className="text-sm text-gray-500">
                          {getWalletTypeDisplayName(wallet.type)} • {wallet.currency} {parseFloat(wallet.balance).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditWallet(wallet)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteWalletClick(wallet.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Finance Management Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Finance Management</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Link href="/categories" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Folder className="mr-2 h-4 w-4" />
                    Categories
                  </Button>
                </Link>
                <Link href="/budgets" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="mr-2 h-4 w-4" />
                    Budgets
                  </Button>
                </Link>
                <Link href="/goals" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="mr-2 h-4 w-4" />
                    Goals
                  </Button>
                </Link>
                <Link href="/bills" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Bills
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Account Management Section */}
            <div className="pt-4 border-t border-gray-200">
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

      {/* Delete Wallet Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteWalletId(null);
        }}
        onConfirm={handleDeleteWallet}
        title="Delete Wallet"
        description="Are you sure you want to delete this wallet? This action cannot be undone and all associated data will be lost."
        confirmText="Delete Wallet"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  </ProtectedRoute>
);
}