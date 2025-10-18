// src/app/accessibility-settings/page.tsx
// Accessibility settings page for Uangku

'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTheme } from 'next-themes';
import { Moon, Sun, Contrast, Type, Move, Keyboard } from 'lucide-react';

export default function AccessibilitySettingsPage() {
  const { 
    highContrast, 
    fontSize, 
    reduceMotion, 
    keyboardNavigation,
    toggleHighContrast, 
    setFontSize, 
    toggleReduceMotion,
    toggleKeyboardNavigation
  } = useAccessibility();
  
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Accessibility Settings</h1>
      
      <div className="space-y-6">
        {/* High Contrast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Contrast className="h-5 w-5" />
              High Contrast
            </CardTitle>
            <CardDescription>
              Increase contrast between text and background for better readability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <input
                type="checkbox"
                id="high-contrast"
                checked={highContrast}
                onChange={() => toggleHighContrast()}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Font Size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Font Size
            </CardTitle>
            <CardDescription>
              Adjust the text size for easier reading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Text Size</Label>
              <Select value={fontSize} onValueChange={(value: 'small' | 'normal' | 'large' | 'extra-large') => setFontSize(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reduce Motion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Move className="h-5 w-5" />
              Motion Settings
            </CardTitle>
            <CardDescription>
              Reduce or disable animations that might cause discomfort
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="reduce-motion">Reduce Motion</Label>
              <input
                type="checkbox"
                id="reduce-motion"
                checked={reduceMotion}
                onChange={() => toggleReduceMotion()}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Navigation
            </CardTitle>
            <CardDescription>
              Enhanced visual indicators for keyboard navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="keyboard-navigation">Keyboard Navigation Mode</Label>
              <input
                type="checkbox"
                id="keyboard-navigation"
                checked={keyboardNavigation}
                onChange={() => toggleKeyboardNavigation()}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Theme
            </CardTitle>
            <CardDescription>
              Choose your preferred color scheme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Accessibility Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Use high contrast mode to improve readability in bright environments</li>
            <li>• Increase font size if you have difficulty reading smaller text</li>
            <li>• Enable reduce motion if animations cause discomfort or distraction</li>
            <li>• Use keyboard navigation mode if you primarily navigate with keyboard</li>
            <li>• Choose a theme that's comfortable for your eyes and lighting conditions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}