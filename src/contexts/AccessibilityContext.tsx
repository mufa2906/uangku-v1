// src/contexts/AccessibilityContext.tsx
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  reduceMotion: boolean;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;
  toggleHighContrast: () => void;
  setFontSize: (size: 'small' | 'normal' | 'large' | 'extra-large') => void;
  toggleReduceMotion: () => void;
  toggleKeyboardNavigation: () => void;
  toggleScreenReaderMode: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessibility_highContrast') === 'true';
    }
    return false;
  });

  const [fontSize, setFontSizeState] = useState<'small' | 'normal' | 'large' | 'extra-large'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility_fontSize');
      return (saved as 'small' | 'normal' | 'large' | 'extra-large') || 'normal';
    }
    return 'normal';
  });

  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessibility_reduceMotion') === 'true';
    }
    return false;
  });

  const [keyboardNavigation, setKeyboardNavigation] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessibility_keyboardNavigation') === 'true';
    }
    return false;
  });

  const [screenReaderMode, setScreenReaderMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessibility_screenReaderMode') === 'true';
    }
    return false;
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply high contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply font size
    root.style.fontSize = 
      fontSize === 'small' ? '14px' :
      fontSize === 'large' ? '18px' :
      fontSize === 'extra-large' ? '20px' : '16px';
    
    // Apply reduced motion
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [highContrast, fontSize, reduceMotion]);

  // Handle keyboard navigation preference
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    if (keyboardNavigation) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [keyboardNavigation]);

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem('accessibility_highContrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('accessibility_fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('accessibility_reduceMotion', reduceMotion.toString());
  }, [reduceMotion]);

  useEffect(() => {
    localStorage.setItem('accessibility_keyboardNavigation', keyboardNavigation.toString());
  }, [keyboardNavigation]);

  useEffect(() => {
    localStorage.setItem('accessibility_screenReaderMode', screenReaderMode.toString());
  }, [screenReaderMode]);

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const setFontSize = (size: 'small' | 'normal' | 'large' | 'extra-large') => {
    setFontSizeState(size);
  };

  const toggleReduceMotion = () => {
    setReduceMotion(prev => !prev);
  };

  const toggleKeyboardNavigation = () => {
    setKeyboardNavigation(prev => !prev);
  };

  const toggleScreenReaderMode = () => {
    setScreenReaderMode(prev => !prev);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        fontSize,
        reduceMotion,
        keyboardNavigation,
        screenReaderMode,
        toggleHighContrast,
        setFontSize,
        toggleReduceMotion,
        toggleKeyboardNavigation,
        toggleScreenReaderMode,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}