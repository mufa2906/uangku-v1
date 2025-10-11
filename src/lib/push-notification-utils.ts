// src/lib/push-notification-utils.ts
// Utility functions for sending push notifications in Uangku

import { Bill, Budget } from '@/types';

// Type definitions for push notifications
interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

// Send bill reminder notification
export async function sendBillReminderNotification(
  subscription: PushSubscription, 
  bill: Bill, 
  daysUntilDue: number
): Promise<boolean> {
  try {
    const payload: PushNotificationPayload = {
      title: 'Bill Reminder',
      body: `Your "${bill.name}" bill is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      url: '/bills',
      tag: `bill-reminder-${bill.id}`
    };

    // In a real implementation, you would send this through your push service
    // For example, using web-push library:
    /*
    const webpush = require('web-push');
    
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    await webpush.sendNotification(subscription, JSON.stringify(payload));
    */

    console.log('Sending bill reminder notification:', payload);
    return true;
  } catch (error) {
    console.error('Error sending bill reminder notification:', error);
    return false;
  }
}

// Send budget warning notification
export async function sendBudgetWarningNotification(
  subscription: PushSubscription,
  budget: Budget,
  percentageUsed: number
): Promise<boolean> {
  try {
    const budgetName = budget.name || 'Unnamed Budget';
    const payload: PushNotificationPayload = {
      title: 'Budget Warning',
      body: `You've used ${percentageUsed.toFixed(0)}% of your "${budgetName}" budget`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      url: '/budgets',
      tag: `budget-warning-${budget.id}`
    };

    // In a real implementation, you would send this through your push service
    console.log('Sending budget warning notification:', payload);
    return true;
  } catch (error) {
    console.error('Error sending budget warning notification:', error);
    return false;
  }
}

// Send goal progress notification
export async function sendGoalProgressNotification(
  subscription: PushSubscription,
  goal: any, // Goal type from your schema
  percentageComplete: number
): Promise<boolean> {
  try {
    const payload: PushNotificationPayload = {
      title: 'Goal Progress',
      body: `You're ${percentageComplete.toFixed(0)}% toward your "${goal.name}" goal!`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      url: '/goals',
      tag: `goal-progress-${goal.id}`
    };

    // In a real implementation, you would send this through your push service
    console.log('Sending goal progress notification:', payload);
    return true;
  } catch (error) {
    console.error('Error sending goal progress notification:', error);
    return false;
  }
}

// Send transaction confirmation notification
export async function sendTransactionConfirmationNotification(
  subscription: PushSubscription,
  transaction: any // Transaction type from your schema
): Promise<boolean> {
  try {
    const type = transaction.type === 'income' ? 'Income' : 'Expense';
    const amount = parseFloat(transaction.amount).toLocaleString('id-ID', {
      style: 'currency',
      currency: transaction.currency || 'IDR'
    });
    
    const payload: PushNotificationPayload = {
      title: `${type} Recorded`,
      body: `${type} of ${amount} has been recorded`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      url: '/transactions',
      tag: `transaction-${transaction.id}`
    };

    // In a real implementation, you would send this through your push service
    console.log('Sending transaction confirmation notification:', payload);
    return true;
  } catch (error) {
    console.error('Error sending transaction confirmation notification:', error);
    return false;
  }
}

// Send offline sync complete notification
export async function sendOfflineSyncCompleteNotification(
  subscription: PushSubscription,
  syncedCount: number
): Promise<boolean> {
  try {
    const payload: PushNotificationPayload = {
      title: 'Sync Complete',
      body: `${syncedCount} offline transaction${syncedCount !== 1 ? 's' : ''} synced successfully`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      url: '/transactions',
      tag: 'offline-sync-complete'
    };

    // In a real implementation, you would send this through your push service
    console.log('Sending offline sync complete notification:', payload);
    return true;
  } catch (error) {
    console.error('Error sending offline sync complete notification:', error);
    return false;
  }
}

// Send general notification
export async function sendGeneralNotification(
  subscription: PushSubscription,
  title: string,
  body: string,
  url?: string
): Promise<boolean> {
  try {
    const payload: PushNotificationPayload = {
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      url,
      tag: `general-${Date.now()}`
    };

    // In a real implementation, you would send this through your push service
    console.log('Sending general notification:', payload);
    return true;
  } catch (error) {
    console.error('Error sending general notification:', error);
    return false;
  }
}

// Type definition for PushSubscription (you might need to adjust based on your actual type)
interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}