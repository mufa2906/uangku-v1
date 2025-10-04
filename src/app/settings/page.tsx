// src/app/settings/page.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Check, Settings } from 'lucide-react';
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

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrency(currencyCode);
  };

  return (
    <div className="pb-20"> {/* Space for bottom nav */}
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Currency Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
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
                    variant={currency === cur.code ? 'default' : 'outline'}
                    className="w-full justify-between"
                    onClick={() => handleCurrencyChange(cur.code)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{cur.name}</div>
                      <div className="text-sm text-gray-500">
                        {cur.code} - {cur.symbol}
                      </div>
                    </div>
                    {currency === cur.code && <Check className="h-5 w-5" />}
                  </Button>
                ))}
              </div>
              
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