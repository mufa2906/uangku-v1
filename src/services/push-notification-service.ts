// src/services/push-notification-service.ts
// Service for handling push notifications in the Uangku PWA

import { Bill } from '@/types';

// Check if push notifications are supported
export const isPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Request permission for push notifications
export const requestPushPermission = async (): Promise<boolean> => {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting push permission:', error);
    return false;
  }
};

// Subscribe to push notifications
export const subscribeToPush = async (): Promise<PushSubscription | null> => {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
    });

    // Send subscription to server
    await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (): Promise<boolean> => {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      await removeSubscriptionFromServer(subscription);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

// Send subscription to server
const sendSubscriptionToServer = async (subscription: PushSubscription): Promise<void> => {
  try {
    // In a real implementation, you would send this to your server
    console.log('Sending subscription to server:', subscription);
    
    // Example API call:
    /*
    await fetch('/api/push-subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON()
      }),
    });
    */
  } catch (error) {
    console.error('Error sending subscription to server:', error);
  }
};

// Remove subscription from server
const removeSubscriptionFromServer = async (subscription: PushSubscription): Promise<void> => {
  try {
    // In a real implementation, you would remove this from your server
    console.log('Removing subscription from server:', subscription);
    
    // Example API call:
    /*
    await fetch('/api/push-subscriptions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint
      }),
    });
    */
  } catch (error) {
    console.error('Error removing subscription from server:', error);
  }
};

// Send a test notification
export const sendTestNotification = async (): Promise<void> => {
  try {
    // In a real implementation, you would send this through your server
    console.log('Sending test notification');
    
    // Example API call:
    /*
    await fetch('/api/notifications/send-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    */
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
};

// Send bill reminder notification
export const sendBillReminderNotification = async (bill: Bill, daysUntilDue: number): Promise<void> => {
  try {
    // In a real implementation, you would send this through your server
    console.log(`Sending bill reminder for ${bill.name}: due in ${daysUntilDue} days`);
    
    // Example API call:
    /*
    await fetch('/api/notifications/bill-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billId: bill.id,
        billName: bill.name,
        amount: bill.amount,
        dueDate: bill.dueDate,
        daysUntilDue: daysUntilDue
      }),
    });
    */
  } catch (error) {
    console.error('Error sending bill reminder notification:', error);
  }
};

// Send budget warning notification
export const sendBudgetWarningNotification = async (
  budgetName: string, 
  percentageUsed: number
): Promise<void> => {
  try {
    // In a real implementation, you would send this through your server
    console.log(`Sending budget warning for ${budgetName}: ${percentageUsed}% used`);
    
    // Example API call:
    /*
    await fetch('/api/notifications/budget-warning', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        budgetName: budgetName,
        percentageUsed: percentageUsed
      }),
    });
    */
  } catch (error) {
    console.error('Error sending budget warning notification:', error);
  }
};

// Utility function to convert VAPID public key from base64
const urlBase64ToUint8Array = (base64String: string): BufferSource => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Check if user has granted permission
export const hasPushPermission = (): boolean => {
  return Notification.permission === 'granted';
};

// Check if user has denied permission
export const isPushDenied = (): boolean => {
  return Notification.permission === 'denied';
};

// Get current push subscription
export const getCurrentSubscription = async (): Promise<PushSubscription | null> => {
  if (!isPushSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting current subscription:', error);
    return null;
  }
};