# Uangku - Data Model

## Core Entities

### Users (Clerk managed)
- `id` (string) - Clerk userId (primary identifier)
- Email, name (cached from Clerk)

### Wallets
- `id` (UUID, primary key) - Unique wallet identifier
- `userId` (string) - References user (Clerk userId)
- `name` (varchar(100)) - e.g., "Cash", "BCA Account", "GoPay"
- `type` (enum: cash, bank, credit_card, e_wallet, savings) - Wallet type
- `balance` (numeric(14,2)) - Current balance with 2 decimal places (default: '0')
- `currency` (varchar(3), default: 'IDR') - Currency code (IDR, USD, etc.)
- `isActive` (boolean, default: true) - Whether wallet is active
- `createdAt` (timestamp with timezone) - Creation time

### Categories
- `id` (UUID, primary key) - Unique category identifier
- `userId` (string) - References user (Clerk userId)
- `name` (text) - Category name (e.g., "Food", "Transportation")
- `icon` (text, optional) - Emoji or icon reference
- `type` (enum: income | expense) - Category type
- `createdAt` (timestamp with timezone) - Creation time

### Transactions
- `id` (UUID, primary key) - Unique transaction identifier
- `userId` (string) - References user (Clerk userId)
- `walletId` (UUID) - References wallet (where money comes from/goes to) with cascade delete
- `categoryId` (UUID) - References category with cascade delete
- `budgetId` (UUID, optional) - References budget with set null on delete
- `type` (enum: income | expense) - Transaction type
- `amount` (numeric(14,2)) - Transaction amount with 2 decimal places
- `note` (text, optional) - Transaction description
- `date` (timestamp with timezone) - Transaction date
- `createdAt` (timestamp with timezone) - Creation time

### Budgets
- `id` (UUID, primary key) - Unique budget identifier
- `userId` (string) - References user (Clerk userId)
- `walletId` (UUID) - References source wallet (required for budget allocation) with cascade delete
- `categoryId` (UUID, optional) - References category (for category-linked budgets) with cascade delete
- `name` (varchar(100), optional) - Custom budget name (for custom budgets)
- `description` (text, optional) - Budget description
- `allocatedAmount` (numeric(14,2)) - Amount allocated to this budget
- `remainingAmount` (numeric(14,2)) - Amount remaining in this budget
- `currency` (varchar(3), default: 'IDR') - Currency code
- `period` (enum: weekly | monthly | yearly) - Budget period
- `startDate` (date) - Budget start date
- `endDate` (date) - Budget end date
- `isActive` (boolean, default: true) - Whether budget is active
- `createdAt` (timestamp with timezone) - Creation time

### Goals
- `id` (UUID, primary key) - Unique goal identifier
- `userId` (string) - References user (Clerk userId)
- `name` (varchar(200)) - Goal name (e.g., "Emergency Fund", "New Car")
- `description` (text, optional) - Goal description
- `targetAmount` (numeric(14,2)) - Target amount for the goal
- `currentAmount` (numeric(14,2), default: '0') - Current progress toward the goal
- `currency` (varchar(3), default: 'IDR') - Currency code
- `targetDate` (date, optional) - Target completion date
- `status` (enum: active | paused | completed | cancelled, default: 'active') - Goal status
- `walletId` (UUID, optional) - References wallet for automatic contributions with set null on delete
- `isActive` (boolean, default: true) - Whether goal is active
- `createdAt` (timestamp with timezone) - Creation time

### Bills
- `id` (UUID, primary key) - Unique bill identifier
- `userId` (string) - References user (Clerk userId)
- `name` (varchar(100)) - Bill name (e.g., "Electricity Bill", "Internet", "Rent")
- `description` (text, optional) - Optional description
- `amount` (numeric(14,2)) - Bill amount
- `currency` (varchar(3), default: 'IDR') - Currency code
- `dueDate` (date) - When the bill is due
- `nextDueDate` (date) - Next due date for recurring bills
- `recurrencePattern` (varchar(20)) - e.g., "monthly", "yearly", "weekly", "custom"
- `recurrenceInterval` (numeric(3,0)) - e.g., every 2 months
- `autoNotify` (boolean, default: true) - Whether to send reminders
- `notifyDaysBefore` (numeric(2,0), default: '3') - Days before due date to notify
- `walletId` (UUID, optional) - Associated wallet for payment with set null on delete
- `categoryId` (UUID, optional) - Associated category with set null on delete
- `isPaid` (boolean, default: false) - Whether the bill is paid
- `paidDate` (date, optional) - Date when the bill was paid
- `isActive` (boolean, default: true) - Whether bill reminder is active
- `createdAt` (timestamp with timezone) - Creation time
- `updatedAt` (timestamp with timezone) - Last update time

## Relationships
- 1 User → N Wallets
- 1 User → N Categories
- 1 User → N Transactions
- 1 User → N Budgets
- 1 User → N Goals
- 1 User → N Bills
- 1 Wallet → N Transactions
- 1 Wallet → N Goals (optional association for automatic contributions)
- 1 Wallet → N Budgets (wallets can have multiple budgets)
- 1 Category → N Transactions
- 1 Category → N Budgets (category-linked budgets)
- 1 Budget → N Transactions (transactions can be linked to budgets)
- 1 Wallet → N Bills (optional association for bill payments)
- 1 Category → N Bills (optional association for categorization)

## Key Constraints & Indexes
- `idx_transactions_user_date` (userId, date DESC) - For chronological transaction queries
- `idx_transactions_wallet` (walletId) - For wallet-based queries
- `idx_transactions_category` (categoryId) - For category-based queries
- `idx_budgets_user_category_period` (userId, categoryId, period, endDate) - For budget queries
- `idx_wallets_user` (userId) - For user wallet queries
- `idx_goals_user_status` (userId, status) - For goal queries by status
- `idx_bills_user_due_date` (userId, dueDate) - For upcoming bill queries
- `idx_bills_next_due_date` (nextDueDate, isPaid) - For bill recurrence queries

## Type Safety
- All database schemas have corresponding TypeScript interfaces
- Zod schemas ensure data integrity at API boundaries
- Foreign key constraints maintain referential integrity
- All amounts use numeric type for precision in financial calculations
- Proper timezone handling for date/timestamp fields
- Enum types ensure data consistency across the application