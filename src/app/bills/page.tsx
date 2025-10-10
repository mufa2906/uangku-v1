// src/app/bills/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FloatingButton } from '@/components/ui/floating-button';
import { Search, Plus, Calendar, AlertCircle, CheckCircle, Repeat, Clock } from 'lucide-react';
import BillFormSheet from '@/components/bills/BillFormSheet';
import AppBottomNav from '@/components/shells/AppBottomNav';
import { Bill, Category, Wallet } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function BillsPage() {
  const { userId } = useAuth();
  const { formatCurrency } = useCurrency();
  const [bills, setBills] = useState<Bill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userId) {
      Promise.all([
        fetchBills(),
        fetchCategories(),
        fetchWallets()
      ]).catch(err => {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      });
    }
  }, [userId]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/bills');
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
      
      const data = await response.json();
      setBills(data);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to load bills. Please try again.');
    } finally {
      setLoading(false);
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

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/wallets');
      if (!response.ok) {
        throw new Error('Failed to fetch wallets');
      }
      
      const data = await response.json();
      setWallets(data);
    } catch (err) {
      console.error('Error fetching wallets:', err);
    }
  };

  const handleCreateBill = () => {
    setEditingBill(null);
    setIsFormOpen(true);
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setIsFormOpen(true);
  };

  const handleDeleteBill = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bill reminder?')) return;
    
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete bill');
      }
      
      setBills(bills.filter(bill => bill.id !== id));
    } catch (err) {
      console.error('Error deleting bill:', err);
      setError('Failed to delete bill. Please try again.');
    }
  };

  const handleSubmitBill = async (data: Partial<Bill>) => {
    try {
      let response;
      
      if (editingBill) {
        // Update existing bill
        response = await fetch(`/api/bills/${editingBill.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create new bill
        response = await fetch('/api/bills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save bill');
      }

      const result = await response.json();
      
      if (editingBill) {
        setBills(bills.map(b => b.id === result.id ? result : b));
      } else {
        setBills([...bills, result]);
      }
      
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving bill:', err);
      setError('Failed to save bill. Please try again.');
    }
  };

  // Filter bills based on search term
  const filteredBills = bills.filter(bill => 
    bill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.categoryName && bill.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (bill.walletName && bill.walletName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get upcoming bills (due within 7 days)
  const upcomingBills = bills.filter(bill => {
    if (bill.isPaid) return false;
    
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff <= 7 && daysDiff >= 0;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get recurrence display text
  const getRecurrenceText = (pattern: string | null, interval: string | null) => {
    if (!pattern) return 'One-time';
    
    switch (pattern) {
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      case 'custom':
        return interval ? `Every ${interval} months` : 'Custom';
      default:
        return 'One-time';
    }
  };

  if (loading && bills.length === 0) {
    return (
      <div className="pb-20">
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Bill Reminders</h1>
          <div className="text-center py-10 text-gray-500">Loading bills...</div>
        </div>
        <AppBottomNav />
      </div>
    );
  }

  return (
    <div className="pb-20"> {/* Space for bottom nav */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bill Reminders</h1>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search bills..."
                className="pl-8 pr-4 py-2 border rounded-md w-full max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateBill}>
              <Plus className="mr-2 h-4 w-4" />
              Add Bill
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Upcoming Bills Section */}
        {upcomingBills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-yellow-500" />
              Upcoming Bills (Next 7 Days)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingBills.map(bill => (
                <Card key={bill.id} className="border-l-4 border-l-yellow-500 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{bill.name}</h3>
                        <p className="text-sm text-yellow-700">
                          Due: {formatDate(bill.dueDate)} • {formatCurrency(parseFloat(bill.amount))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{bill.walletName || 'No wallet'}</p>
                        <p className="text-xs text-gray-400">{bill.categoryName || 'No category'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Bills */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-500" />
            All Bills
          </h2>
          
          {filteredBills.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bills</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'No bills match your search.' : 'Get started by creating a new bill reminder.'}
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <Button onClick={handleCreateBill}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Bill Reminder
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBills.map(bill => (
                <Card key={bill.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{bill.name}</h3>
                          {bill.isPaid ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium">{formatCurrency(parseFloat(bill.amount))}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Due {formatDate(bill.dueDate)}</span>
                          </div>
                          
                          {bill.recurrencePattern && (
                            <div className="flex items-center text-gray-500">
                              <Repeat className="h-3 w-3 mr-1" />
                              <span>{getRecurrenceText(bill.recurrencePattern, bill.recurrenceInterval)}</span>
                            </div>
                          )}
                          
                          {bill.walletName && (
                            <div className="text-gray-500">
                              <span>{bill.walletName}</span>
                            </div>
                          )}
                        </div>
                        
                        {bill.description && (
                          <p className="mt-2 text-sm text-gray-600 truncate">{bill.description}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end ml-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditBill(bill)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteBill(bill.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </Button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {bill.isPaid ? (
                            <span className="text-green-600">Paid</span>
                          ) : (
                            <span className="text-red-600">Unpaid</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bill Form Sheet */}
      <BillFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitBill}
        bill={editingBill}
        categories={categories}
        wallets={wallets}
      />

      {/* Floating Action Button */}
      <FloatingButton onClick={handleCreateBill}>
        <Plus className="h-6 w-6" />
      </FloatingButton>

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  );
}