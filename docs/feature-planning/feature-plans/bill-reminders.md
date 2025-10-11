# Bill Reminders

## Status
IMPLEMENTED - [Date] - Successfully implemented bill reminder and tracking functionality

## Overview
Successfully implemented bill reminder and tracking functionality allowing users to manage recurring and one-time bills with due date notifications. Users can set up bills with various recurrence patterns, link them to wallets and categories, and receive automated reminders. The feature is currently deployed and available in the application.

## User Stories (if applicable)
- As a user, I want to set up recurring bills (monthly, weekly, yearly) with automatic due date calculations
- As a user, I want to receive notifications before my bills are due
- As a user, I want to track which bills I've paid and which are upcoming
- As a user, I want to link bills to specific wallets for payment tracking
- As a user, I want to categorize bills for better financial tracking
- As a user, I want to manage one-time bills as well as recurring ones
- As a user, I want to see upcoming bills on my dashboard

## Requirements (if applicable)
- Bill creation with name, description, amount, currency, and due date
- Recurring bill support with various patterns (weekly, monthly, yearly, custom)
- Automated notification system with customizable reminder periods
- Bill payment tracking (paid/unpaid status)
- Wallet and category association for financial tracking
- Bill status management (active/inactive)
- Integration with dashboard for quick access to upcoming bills
- Currency support for bill amounts
- Filter and search capabilities for bill management

## Technical Implementation
- Added bills table to database with proper relationships to wallets and categories
- Created API routes for bill CRUD operations (/api/bills)
- Implemented recurrence pattern calculations for automatic next due date updates
- Added notification settings with customizable reminder periods
- Updated dashboard to show upcoming bills with due date indicators
- Created dedicated bills page for comprehensive bill management
- Integrated with existing CurrencyContext for proper currency display
- Implemented proper data relationships with wallets, categories, and users
- Added Zod validation schemas for bill creation and updates

## Database Schema
```ts
// In src/lib/schema.ts
export const bills = pgTable("bills", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(), // References users.id (Clerk)
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Electricity Bill", "Internet", "Rent"
  description: text("description"), // Optional description
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(), // Bill amount
  currency: varchar("currency", { length: 3 }).notNull().default('IDR'), // Currency code
  dueDate: date("due_date").notNull(), // When the bill is due
  nextDueDate: date("next_due_date").notNull(), // Next due date for recurring bills
  recurrencePattern: varchar("recurrence_pattern", { length: 20 }), // e.g., "monthly", "yearly", "weekly", "custom"
  recurrenceInterval: numeric("recurrence_interval", { precision: 3, scale: 0 }), // e.g., every 2 months
  autoNotify: boolean("auto_notify").notNull().default(true), // Whether to send reminders
  notifyDaysBefore: numeric("notify_days_before", { precision: 2, scale: 0 }).notNull().default('3'), // Days before due date to notify
  walletId: uuid("wallet_id").references(() => wallets.id, { onDelete: "set null" }), // Associated wallet for payment
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }), // Associated category
  isPaid: boolean("is_paid").notNull().default(false), // Whether the bill is paid
  paidDate: date("paid_date"), // Date when the bill was paid
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

## API Endpoints (if applicable)
- `GET /api/bills` - Get all user bills with optional filtering (upcoming only, include inactive, date ranges)
- `POST /api/bills` - Create new bill with validation and recurrence handling
- `PUT /api/bills/:id` - Update existing bill (including payment status changes)
- `DELETE /api/bills/:id` - Deactivate (not delete) bill
- Integration with dashboard insights for upcoming bill display

## Implementation Status
- [x] Users can create bills with due dates and recurrence patterns
- [x] Recurring bill support with automatic next due date calculations
- [x] Bill payment tracking with paid/unpaid status
- [x] Automated notification system with customizable reminder periods
- [x] Bill information displays in user's preferred currency
- [x] Users can link bills to wallets and categories
- [x] Visual due date indicators with color coding
- [x] Dashboard integration showing upcoming bills
- [x] Comprehensive bill management page
- [x] Filter and search capabilities for bill management

## Type Definitions (if applicable)
```ts
// In src/types/index.ts
// Bill reminder type
export interface Bill {
  id: string;
  userId: string;
  name: string; // e.g., "Electricity Bill", "Internet", "Rent"
  description: string | null; // Optional description
  amount: string; // Bill amount
  currency: string; // Currency code
  dueDate: string; // When the bill is due (ISO date string)
  nextDueDate: string; // Next due date for recurring bills (ISO date string)
  recurrencePattern: 'weekly' | 'monthly' | 'yearly' | 'custom' | null; // Recurrence pattern
  recurrenceInterval: string | null; // e.g., every 2 months
  autoNotify: boolean; // Whether to send reminders
  notifyDaysBefore: string; // Days before due date to notify
  walletId: string | null; // Associated wallet for payment
  categoryId: string | null; // Associated category
  isPaid: boolean; // Whether the bill is paid
  paidDate: string | null; // Date when the bill was paid (ISO date string)
  isActive: boolean;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}
```

## UI/UX Implementation (if applicable)
- Dedicated bills page for comprehensive bill management
- Visual due date indicators with color coding (green for upcoming, red for overdue)
- Clear recurrence pattern display
- Payment status indicators with toggle functionality
- Intuitive form with clear guidance for bill creation
- Wallet and category selection for proper financial tracking
- Date pickers for due dates and payment tracking
- Currency formatting according to user preferences
- Dashboard integration showing upcoming bills with quick access

## Type Definitions (if applicable)
N/A

## Current Implementation Details (if applicable)
- Recurrence pattern calculations for automatic next due date updates
- Notification settings with configurable reminder periods
- Color-coded due date status indicators
- CurrencyContext integration for proper currency formatting
- Responsive design for mobile and desktop usage
- Proper form validation and error handling
- Dashboard integration with upcoming bill overview

Dashboard Integration:
- Upcoming bills display on main dashboard
- Due date calculations with visual indicators
- Color-coded status (green for upcoming, red for overdue)
- Quick access to bill details from dashboard

## Known Issues (if applicable)
N/A

## Future Enhancements
- Automated bill payment integration
- Bill splitting for shared expenses
- Bill forecasting and budget integration
- Advanced recurrence patterns (custom intervals)
- Bill history and analytics
- Integration with banking APIs for automatic bill tracking
- Bill reminder notifications (push notifications)
- Bill export and reporting features