// src/lib/bill-notifications.ts
// Utility functions for bill reminder notifications

import { Bill } from '@/types';

/**
 * Check for bills that are due soon and need notification
 * @param bills List of bills to check
 * @param daysBefore Number of days before due date to notify (default: 3)
 * @returns List of bills that need notification
 */
export function getBillsNeedingNotification(bills: Bill[], daysBefore: number = 3): Bill[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return bills.filter(bill => {
    // Only consider unpaid bills that have autoNotify enabled
    if (bill.isPaid || !bill.autoNotify) return false;
    
    // Calculate the notification date (due date - notifyDaysBefore)
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const notifyDays = parseInt(bill.notifyDaysBefore) || daysBefore;
    const notificationDate = new Date(dueDate);
    notificationDate.setDate(notificationDate.getDate() - notifyDays);
    
    // Check if today is the notification date or later (but before due date)
    return today >= notificationDate && today <= dueDate;
  });
}

/**
 * Check for overdue bills
 * @param bills List of bills to check
 * @returns List of overdue bills
 */
export function getOverdueBills(bills: Bill[]): Bill[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return bills.filter(bill => {
    if (bill.isPaid) return false;
    
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return today > dueDate;
  });
}

/**
 * Check if a bill is due today
 * @param bills List of bills to check
 * @returns List of bills due today
 */
export function getBillsDueToday(bills: Bill[]): Bill[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return bills.filter(bill => {
    if (bill.isPaid) return false;
    
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate.getTime() === today.getTime();
  });
}

/**
 * Calculate next due date based on recurrence pattern
 * @param bill The bill to calculate next due date for
 * @returns Next due date or null if one-time bill
 */
export function calculateNextDueDate(bill: Bill): Date | null {
  if (!bill.recurrencePattern) return null; // One-time bill
  
  const lastDueDate = new Date(bill.dueDate);
  const interval = parseInt(bill.recurrenceInterval || '1');
  
  switch (bill.recurrencePattern) {
    case 'weekly':
      lastDueDate.setDate(lastDueDate.getDate() + (7 * interval));
      return lastDueDate;
    case 'monthly':
      lastDueDate.setMonth(lastDueDate.getMonth() + interval);
      return lastDueDate;
    case 'yearly':
      lastDueDate.setFullYear(lastDueDate.getFullYear() + interval);
      return lastDueDate;
    case 'custom':
      // For custom, we assume it's monthly-based
      lastDueDate.setMonth(lastDueDate.getMonth() + interval);
      return lastDueDate;
    default:
      return null;
  }
}

/**
 * Generate a user-friendly notification message for a bill
 * @param bill The bill to generate message for
 * @returns Notification message
 */
export function generateBillNotificationMessage(bill: Bill): string {
  const dueDate = new Date(bill.dueDate);
  const formattedDate = dueDate.toLocaleDateString();
  const amount = parseFloat(bill.amount);
  
  return `Your ${bill.name} bill for ${bill.currency} ${amount.toLocaleString()} is due on ${formattedDate}.`;
}