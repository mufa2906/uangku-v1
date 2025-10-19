// public/ethereum-provider-fix.js
// This script prevents multiple Ethereum wallet extensions from conflicting

(function() {
  'use strict';

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Store the original ethereum property descriptor if it exists
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'ethereum') ||
                            Object.getOwnPropertyDescriptor(window, '__ethereum') ||
                            { writable: true, configurable: true };

  // Check if window.ethereum already exists and if it's a conflicting extension
  if (window.ethereum && !window.ethereum.isUangkuWallet) {
    // If another wallet is already installed, log a message but don't replace it
    // This prevents the assign to read-only property error
    console.log('Another Ethereum provider is already present:', {
      isMetaMask: window.ethereum.isMetaMask,
      isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
      isTrust: window.ethereum.isTrust,
      providerType: window.ethereum.isMetaMask ? 'MetaMask' : 
                   window.ethereum.isCoinbaseWallet ? 'Coinbase Wallet' :
                   window.ethereum.isTrust ? 'Trust Wallet' : 'Other Wallet'
    });
    
    // Store the existing provider for later reference
    const existingProvider = window.ethereum;
    
    // Ensure the existing provider remains unchanged to prevent conflicts
    Object.defineProperty(window, 'ethereum', {
      value: existingProvider,
      writable: false, // Keep it non-writable to prevent other extensions from changing it
      configurable: false, // Keep it non-configurable to prevent redefinition
      enumerable: true
    });
    
    return; // Exit early to prevent conflicts
  }

  // If no provider exists, or it's our own, we can set up safely
  if (!window.ethereum) {
    // This is where you would normally set up your own provider
    // For this application that doesn't use crypto wallets, we'll just ensure
    // any potential provider setup won't break other extensions
    console.log('Uangku: No Ethereum provider detected, safe to proceed');
  }
  
  // Add a marker to identify our provider (if we implement one in the future)
  if (window.ethereum && !window.ethereum.isUangkuWallet) {
    // Add a property to identify that this is not our wallet
    try {
      // Use defineProperty to safely add a property without breaking existing provider
      Object.defineProperty(window.ethereum, 'isUangkuWallet', {
        value: false,
        writable: false,
        configurable: true,
        enumerable: true
      });
    } catch (e) {
      // If we can't define the property, that's fine - just means the provider is very locked down
      console.log('Could not add isUangkuWallet property to existing provider');
    }
  }
})();