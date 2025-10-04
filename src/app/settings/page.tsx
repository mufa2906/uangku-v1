// src/app/settings/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Check } from 'lucide-react';
import AppBottomNav from '@/components/shells/AppBottomNav';

// Supported currencies
const SUPPORTED_CURRENCIES = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

export default function SettingsPage() {
  const { currency, setCurrency, currencySymbol } = useCurrency();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrency(currencyCode);
    setSuccessMessage(`Currency changed to ${currencyCode} successfully!`);
    // Clear the success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="pb-20"> {/* Space for bottom nav */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold flex-1">Settings</h1>
        </div>

        {/* Currency Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Currency Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select your preferred currency for displaying amounts
              </p>
              
              <div className="grid gap-3">
                {SUPPORTED_CURRENCIES.map((cur) => (
                  <Button
                    key={cur.code}
                    variant={currency === cur.code ? 'secondary' : 'outline'}
                    className="w-full justify-between"
                    onClick={() => handleCurrencyChange(cur.code)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{cur.name}</div>
                      <div className="text-sm text-gray-500">
                        {cur.code} - {cur.symbol}
                      </div>
                    </div>
                    {currency === cur.code && <Check className="h-5 w-5 text-blue-500" />}
                  </Button>
                ))}
              </div>
              
              {successMessage && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                  <p className="text-sm">{successMessage}</p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm">
                  Current selection: <span className="font-semibold">{currency}</span> ({currencySymbol})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  );
}