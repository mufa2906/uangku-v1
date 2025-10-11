// src/app/layout-wrapper.tsx
// Wrapper component to include global PWA components in the layout

'use client';

import React from 'react';
import OfflineSyncNotification from '@/components/pwa/OfflineSyncNotification';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <OfflineSyncNotification />
    </>
  );
}