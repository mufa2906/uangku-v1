// src/contexts/BillNotificationContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Bill } from '@/types';
import { 
  getBillsNeedingNotification, 
  getOverdueBills, 
  getBillsDueToday,
  generateBillNotificationMessage 
} from '@/lib/bill-notifications';
import { useToast, toast } from '@/components/ui/toast';

// Define the context type
interface BillNotificationContextType {
  checkBillNotifications: (bills: Bill[]) => void;
  markBillAsPaid: (billId: string) => void;
  refreshNotifications: () => void;
}

// Create the context
const BillNotificationContext = createContext<BillNotificationContextType | undefined>(undefined);

// Provider component
export function BillNotificationProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast();
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Function to check and send bill notifications
  const checkBillNotifications = (bills: Bill[]) => {
    const now = new Date();
    
    // Only check if it hasn't been checked recently (to avoid spam)
    if (lastChecked && (now.getTime() - lastChecked.getTime()) < 60000) { // 1 minute
      return;
    }
    
    setLastChecked(now);

    // Check for bills needing notification
    const billsNeedingNotification = getBillsNeedingNotification(bills);
    const overdueBills = getOverdueBills(bills);
    const billsDueToday = getBillsDueToday(bills);

    // Show notifications for bills due soon
    billsNeedingNotification.forEach(bill => {
      const message = generateBillNotificationMessage(bill);
      addToast(toast.info(
        'Bill Reminder',
        message,
        10000 // Show for 10 seconds
      ));
    });

    // Show notifications for overdue bills
    overdueBills.forEach(bill => {
      addToast(toast.error(
        'Overdue Bill',
        `Your ${bill.name} bill is overdue!`,
        15000 // Show for 15 seconds
      ));
    });

    // Show notifications for bills due today
    billsDueToday.forEach(bill => {
      addToast(toast.warn(
        'Bill Due Today',
        `Your ${bill.name} bill is due today!`,
        10000 // Show for 10 seconds
      ));
    });
  };

  // Function to mark a bill as paid (and stop notifications)
  const markBillAsPaid = (billId: string) => {
    // This would typically update the bill in the database
    // For now, we'll just show a success message
    addToast(toast.success('Bill Updated', 'Bill marked as paid successfully'));
  };

  // Function to manually refresh notifications
  const refreshNotifications = () => {
    setLastChecked(null);
  };

  // Check notifications periodically when bills are available
  useEffect(() => {
    // This would typically be triggered when bills are loaded in the app
  }, []);

  const value = {
    checkBillNotifications,
    markBillAsPaid,
    refreshNotifications
  };

  return (
    <BillNotificationContext.Provider value={value}>
      {children}
    </BillNotificationContext.Provider>
  );
}

// Custom hook to use the context
export function useBillNotifications() {
  const context = useContext(BillNotificationContext);
  if (context === undefined) {
    throw new Error('useBillNotifications must be used within a BillNotificationProvider');
  }
  return context;
}