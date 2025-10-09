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
  Plus,
  Edit,
  Trash2,
  Wallet as WalletIcon,
  Target
} from 'lucide-react';
import { FloatingButton } from '@/components/ui/floating-button';
import AppBottomNav from '@/components/shells/AppBottomNav';
import { Wallet, Budget } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function WalletsPage() {
  const { userId } = useAuth();
  const { formatCurrency } = useCurrency();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'wallets' | 'budgets'>('wallets');
  const [walletFormOpen, setWalletFormOpen] = useState(false);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  const [walletFormData, setWalletFormData] = useState({
    name: '',
    type: 'cash' as 'cash' | 'bank' | 'credit_card' | 'e_wallet' | 'savings',
    currency: 'IDR',
    balance: '0'
  });
  
  const [budgetFormData, setBudgetFormData] = useState({
    name: '',
    categoryId: '',
    allocatedAmount: '0',
    remainingAmount: '0',
    currency: 'IDR',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    isActive: true
  });

  useEffect(() => {
    if (userId) {
      Promise.all([
        fetchWallets(),
        fetchBudgets(),
        fetchCategories()
      ]).catch(err => {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      });
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

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      
      const data = await response.json();
      setBudgets(data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError('Failed to load budgets. Please try again.');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleCreateWallet = () => {
    setEditingWallet(null);
    setWalletFormData({
      name: '',
      type: 'cash',
      currency: 'IDR',
      balance: '0'
    });
    setWalletFormOpen(true);
  };

  const handleCreateBudget = () => {
    setEditingBudget(null);
    setBudgetFormData({
      name: '',
      categoryId: '',
      allocatedAmount: '0',
      remainingAmount: '0',
      currency: 'IDR',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
      isActive: true
    });
    setBudgetFormOpen(true);
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setWalletFormData({
      name: wallet.name,
      type: wallet.type,
      currency: wallet.currency,
      balance: wallet.balance.toString()
    });
    setWalletFormOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetFormData({
      name: budget.name || '',
      categoryId: budget.categoryId || '',
      allocatedAmount: budget.allocatedAmount,
      remainingAmount: budget.remainingAmount,
      currency: budget.currency,
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
      isActive: budget.isActive
    });
    setBudgetFormOpen(true);
  };

  const handleDeleteWallet = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this wallet?')) return;
    
    try {
      const response = await fetch(`/api/wallets/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete wallet');
      }
      
      setWallets(wallets.filter(wallet => wallet.id !== id));
    } catch (err) {
      console.error('Error deleting wallet:', err);
      setError('Failed to delete wallet. Please try again.');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }
      
      setBudgets(budgets.filter(budget => budget.id !== id));
    } catch (err) {
      console.error('Error deleting budget:', err);
      setError('Failed to delete budget. Please try again.');
    }
  };

  const submitWallet = async () => {
    if (!userId) return;
    
    try {
      const url = editingWallet ? `/api/wallets/${editingWallet.id}` : '/api/wallets';
      const method = editingWallet ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...walletFormData,
          balance: parseFloat(walletFormData.balance),
          userId
        }),
      });
      
      if (!response.ok) {
        throw new Error(editingWallet ? 'Failed to update wallet' : 'Failed to create wallet');
      }
      
      const result = await response.json();
      
      if (editingWallet) {
        setWallets(wallets.map(w => w.id === result.id ? result : w));
      } else {
        setWallets([...wallets, result]);
      }
      
      setWalletFormOpen(false);
    } catch (err) {
      console.error('Error saving wallet:', err);
      setError(editingWallet ? 'Failed to update wallet' : 'Failed to create wallet');
    }
  };

  const submitBudget = async () => {
    if (!userId) return;
    
    try {
      const url = editingBudget ? `/api/budgets/${editingBudget.id}` : '/api/budgets';
      const method = editingBudget ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...budgetFormData,
          allocatedAmount: parseFloat(budgetFormData.allocatedAmount),
          userId
        }),
      });
      
      if (!response.ok) {
        throw new Error(editingBudget ? 'Failed to update budget' : 'Failed to create budget');
      }
      
      const result = await response.json();
      
      if (editingBudget) {
        setBudgets(budgets.map(b => b.id === result.id ? result : b));
      } else {
        setBudgets([...budgets, result]);
      }
      
      setBudgetFormOpen(false);
    } catch (err) {
      console.error('Error saving budget:', err);
      setError(editingBudget ? 'Failed to update budget' : 'Failed to create budget');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cash': return 'bg-yellow-100 text-yellow-800';
      case 'bank': return 'bg-blue-100 text-blue-800';
      case 'credit_card': return 'bg-red-100 text-red-800';
      case 'e_wallet': return 'bg-green-100 text-green-800';
      case 'savings': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && wallets.length === 0) {
    return (
      <div className="pb-20">
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Wallets & Budgets</h1>
          <div className="text-center py-10 text-gray-500">Loading wallets and budgets...</div>
        </div>
        <AppBottomNav />
      </div>
    );
  }

  return (
    <div className="pb-20"> {/* Space for bottom nav */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Wallets & Budgets</h1>
          <div className="flex gap-2">
            <Button variant={activeTab === 'budgets' ? 'default' : 'outline'} onClick={() => setActiveTab('budgets')}>
              <Target className="mr-2 h-4 w-4" />
              Budgets
            </Button>
            <Button variant={activeTab === 'wallets' ? 'default' : 'outline'} onClick={() => setActiveTab('wallets')}>
              <WalletIcon className="mr-2 h-4 w-4" />
              Wallets
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Wallets Tab */}
        {activeTab === 'wallets' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Wallets</h2>
              <Button onClick={handleCreateWallet}>
                <Plus className="mr-2 h-4 w-4" />
                Add Wallet
              </Button>
            </div>
            
            {wallets.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p>No wallets yet.</p>
                  <p className="mt-2 text-gray-500">Create your first wallet to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wallets.map((wallet) => (
                  <Card key={wallet.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{wallet.name}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1 capitalize">{wallet.type.replace('_', ' ')}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(wallet.type)}`}>
                          Active
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold">{formatCurrency(parseFloat(wallet.balance))}</p>
                      <p className="text-sm text-gray-500 mt-2">{wallet.currency}</p>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditWallet(wallet)}
                          className="flex-1"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteWallet(wallet.id)}
                          className="flex-1"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Budgets</h2>
              <Button onClick={handleCreateBudget}>
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </div>
            
            {budgets.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p>No budgets yet.</p>
                  <p className="mt-2 text-gray-500">Create your first budget to manage spending!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map((budget) => {
                  const category = categories.find(cat => cat.id === budget.categoryId);
                  const spentAmount = 0; // In a real implementation, calculate actual spending
                  const remaining = parseFloat(budget.allocatedAmount) - spentAmount;
                  const percentage = (spentAmount / parseFloat(budget.allocatedAmount)) * 100;
                  
                  return (
                    <Card key={budget.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {budget.name || category?.name || 'Unnamed Budget'}
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              {budget.categoryId ? category?.name || 'Uncategorized' : 'Custom Budget'}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            budget.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {budget.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Used: {formatCurrency(spentAmount)}</span>
                            <span>{Math.round(percentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                percentage > 90 ? 'bg-red-500' : 
                                percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`} 
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">Remaining</p>
                            <p className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(remaining)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Limit</p>
                            <p className="font-medium">{formatCurrency(parseFloat(budget.allocatedAmount))}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {budget.period} • {budget.startDate} to {budget.endDate}
                        </p>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditBudget(budget)}
                            className="flex-1"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="flex-1"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Wallet Form Dialog */}
        <Dialog open={walletFormOpen} onOpenChange={setWalletFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingWallet ? 'Edit Wallet' : 'Create New Wallet'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={walletFormData.name}
                  onChange={(e) => setWalletFormData({...walletFormData, name: e.target.value})}
                  placeholder="e.g., My Savings, Credit Card"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={walletFormData.type} onValueChange={(value) => setWalletFormData({...walletFormData, type: value as any})}>
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
              <div>
                <Label htmlFor="balance">Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={walletFormData.balance}
                  onChange={(e) => setWalletFormData({...walletFormData, balance: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={walletFormData.currency} onValueChange={(value) => setWalletFormData({...walletFormData, currency: value})}>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setWalletFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitWallet}>
                {editingWallet ? 'Update' : 'Create'} Wallet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Budget Form Dialog */}
        <Dialog open={budgetFormOpen} onOpenChange={setBudgetFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="budgetName">Budget Name</Label>
                <Input
                  id="budgetName"
                  value={budgetFormData.name}
                  onChange={(e) => setBudgetFormData({...budgetFormData, name: e.target.value})}
                  placeholder="e.g., Groceries, Entertainment"
                />
              </div>
              <div>
                <Label htmlFor="category">Category (optional)</Label>
                <Select value={budgetFormData.categoryId} onValueChange={(value) => setBudgetFormData({...budgetFormData, categoryId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category or leave empty for custom budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={budgetFormData.allocatedAmount}
                  onChange={(e) => setBudgetFormData({...budgetFormData, allocatedAmount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="period">Period</Label>
                <Select value={budgetFormData.period} onValueChange={(value) => setBudgetFormData({...budgetFormData, period: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={budgetFormData.startDate}
                    onChange={(e) => setBudgetFormData({...budgetFormData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={budgetFormData.endDate}
                    onChange={(e) => setBudgetFormData({...budgetFormData, endDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBudgetFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitBudget}>
                {editingBudget ? 'Update' : 'Create'} Budget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Floating Action Button - only show when on Wallets tab */}
        {activeTab === 'wallets' && (
          <FloatingButton onClick={handleCreateWallet}>
            <Plus className="h-6 w-6" />
          </FloatingButton>
        )}
      </div>

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  );
}