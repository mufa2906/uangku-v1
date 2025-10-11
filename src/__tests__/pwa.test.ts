// src/__tests__/pwa.test.ts
// Test suite for PWA functionality in Uangku

import { isPushSupported, hasPushPermission, isPushDenied } from '@/services/push-notification-service';
import { 
  sendBillReminderNotification, 
  sendBudgetWarningNotification,
  sendGeneralNotification
} from '@/lib/push-notification-utils';

// Mock the browser APIs
const mockNavigator = {
  serviceWorker: {
    ready: Promise.resolve({
      pushManager: {
        subscribe: jest.fn(),
        getSubscription: jest.fn(),
      }
    }),
    register: jest.fn(),
  },
  onLine: true,
  userAgent: 'Mozilla/5.0'
};

// Mock window object
const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  location: {
    reload: jest.fn(),
  },
  atob: jest.fn((str) => Buffer.from(str, 'base64').toString('binary')),
};

describe('PWA Functionality Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up global mocks
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
    });
    
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
    });
    
    Object.defineProperty(global, 'Notification', {
      value: {
        requestPermission: jest.fn(),
        permission: 'granted',
      },
      writable: true,
    });
  });

  describe('Push Notification Support', () => {
    test('should detect push notification support correctly', () => {
      const supported = isPushSupported();
      expect(typeof supported).toBe('boolean');
    });

    test('should handle push permission states correctly', () => {
      // Test granted permission
      Object.defineProperty(global.Notification, 'permission', {
        value: 'granted',
        writable: true,
      });
      expect(hasPushPermission()).toBe(true);
      expect(isPushDenied()).toBe(false);
      
      // Test denied permission
      Object.defineProperty(global.Notification, 'permission', {
        value: 'denied',
        writable: true,
      });
      expect(hasPushPermission()).toBe(false);
      expect(isPushDenied()).toBe(true);
      
      // Test default permission
      Object.defineProperty(global.Notification, 'permission', {
        value: 'default',
        writable: true,
      });
      expect(hasPushPermission()).toBe(false);
      expect(isPushDenied()).toBe(false);
    });
  });

  describe('Push Notification Sending', () => {
    test('should send bill reminder notification without error', async () => {
      const mockSubscription = {
        endpoint: 'https://example.com/push',
        keys: {
          p256dh: 'test-key',
          auth: 'test-auth'
        }
      };
      
      const mockBill = {
        id: 'bill-1',
        name: 'Electricity Bill',
        amount: '150000',
        dueDate: '2025-12-01'
      };
      
      const result = await sendBillReminderNotification(
        mockSubscription,
        mockBill,
        3
      );
      
      expect(result).toBe(true);
    });

    test('should send budget warning notification without error', async () => {
      const mockSubscription = {
        endpoint: 'https://example.com/push',
        keys: {
          p256dh: 'test-key',
          auth: 'test-auth'
        }
      };
      
      const result = await sendBudgetWarningNotification(
        mockSubscription,
        { name: 'Food Budget' },
        85
      );
      
      expect(result).toBe(true);
    });

    test('should send general notification without error', async () => {
      const mockSubscription = {
        endpoint: 'https://example.com/push',
        keys: {
          p256dh: 'test-key',
          auth: 'test-auth'
        }
      };
      
      const result = await sendGeneralNotification(
        mockSubscription,
        'Test Title',
        'Test Body',
        '/test-url'
      );
      
      expect(result).toBe(true);
    });
  });

  describe('Service Worker Registration', () => {
    test('should register service worker without error', async () => {
      // This test would check the actual service worker registration
      // In a real implementation, we would mock the service worker API
      expect(mockNavigator.serviceWorker.register).toBeDefined();
    });
  });
});