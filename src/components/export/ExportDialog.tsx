// src/components/export/ExportDialog.tsx
'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Calendar } from 'lucide-react';
import { Wallet, Category } from '@/types';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets?: Wallet[];
  categories?: Category[];
}

export default function ExportDialog({ 
  open, 
  onOpenChange,
  wallets = [],
  categories = []
}: ExportDialogProps) {
  const [formData, setFormData] = useState({
    dataType: 'transactions', // transactions, budgets, goals
    exportType: 'csv', // csv, pdf (pdf not implemented yet)
    startDate: '',
    endDate: '',
    walletId: '',
    categoryId: '',
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Build query parameters
      const params = new URLSearchParams({
        data: formData.dataType,
        type: formData.exportType,
      });

      // Add filters for transactions
      if (formData.dataType === 'transactions') {
        if (formData.startDate) params.append('startDate', formData.startDate);
        if (formData.endDate) params.append('endDate', formData.endDate);
        if (formData.walletId) params.append('walletId', formData.walletId);
        if (formData.categoryId) params.append('categoryId', formData.categoryId);
      }

      // Make the export request
      const response = await fetch(`/api/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : `export_${Date.now()}.${formData.exportType}`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getDataTypeLabel = (type: string) => {
    switch (type) {
      case 'transactions': return 'Transactions';
      case 'budgets': return 'Budgets';
      case 'goals': return 'Goals';
      default: return 'Data';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Data Type Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataType" className="text-right">
              Data Type
            </Label>
            <Select 
              value={formData.dataType} 
              onValueChange={(value) => handleSelectChange('dataType', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transactions">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Transactions
                  </div>
                </SelectItem>
                <SelectItem value="budgets">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Budgets
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Type Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="exportType" className="text-right">
              Format
            </Label>
            <Select 
              value={formData.exportType} 
              onValueChange={(value) => handleSelectChange('exportType', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                <SelectItem value="pdf" disabled>PDF (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filters for Transactions */}
          {formData.dataType === 'transactions' && (
            <>
              <div className="col-span-4">
                <Label className="text-sm font-medium">Filters (Optional)</Label>
                <p className="text-xs text-gray-500 mt-1">Leave empty to export all data</p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>

              {/* Wallet Filter */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="walletId" className="text-right">
                  Wallet
                </Label>
                <Select 
                  value={formData.walletId} 
                  onValueChange={(value) => handleSelectChange('walletId', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="All wallets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All wallets</SelectItem>
                    {wallets.map(wallet => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name} ({wallet.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryId" className="text-right">
                  Category
                </Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => handleSelectChange('categoryId', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Export Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Export Summary</h4>
            <p className="text-sm text-gray-600">
              You will export <strong>{getDataTypeLabel(formData.dataType).toLowerCase()}</strong> in <strong>{formData.exportType.toUpperCase()}</strong> format.
              {formData.dataType === 'transactions' && (formData.startDate || formData.endDate || formData.walletId || formData.categoryId) && (
                <>
                  <br />
                  <span className="text-xs">Filters: {[
                    formData.startDate && `From ${new Date(formData.startDate).toLocaleDateString()}`,
                    formData.endDate && `To ${new Date(formData.endDate).toLocaleDateString()}`,
                    formData.walletId && `Wallet: ${wallets.find(w => w.id === formData.walletId)?.name}`,
                    formData.categoryId && `Category: ${categories.find(c => c.id === formData.categoryId)?.name}`
                  ].filter(Boolean).join(', ')}</span>
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}