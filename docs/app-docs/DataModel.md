# Uangku - Data Model

## Core Entities

### Users (Clerk managed)
- `id` (string) - Clerk userId (primary identifier)
- Email, name (cached from Clerk)

### Wallets
- `id` (UUID, primary key) - Unique wallet identifier
- `userId` (string) - References user (Clerk userId)
- `name` (text) - e.g., "Cash", "BCA Account", "GoPay"
- `type` (enum) - cash, bank, credit_card, e_wallet, savings
- `balance` (numeric(14,2)) - Current balance with 2 decimal places
- `currency` (string, default: 'IDR') - Currency code (IDR, USD, etc.)
- `isActive` (boolean, default: true) - Whether wallet is active
- `createdAt` (timestamp) - Creation time

### Categories
- `id` (UUID, primary key) - Unique category identifier
- `userId` (string) - References user (Clerk userId)
- `name` (text) - Category name (e.g., "Food", "Transportation")
- `icon` (text, optional) - Emoji or icon reference
- `type` (enum: income | expense) - Category type
- `createdAt` (timestamp) - Creation time

### Transactions
- `id` (UUID, primary key) - Unique transaction identifier
- `userId` (string) - References user (Clerk userId)
- `walletId` (UUID) - References wallet (where money comes from/goes to)
- `categoryId` (UUID) - References category
- `budgetId` (UUID, optional) - References budget (optional association)
- `type` (enum: income | expense) - Transaction type
- `amount` (numeric(14,2)) - Transaction amount with 2 decimal places
- `note` (text, optional) - Transaction description
- `date` (timestamp) - Transaction date
- `createdAt` (timestamp) - Creation time

### Budgets
- `id` (UUID, primary key) - Unique budget identifier
- `userId` (string) - References user (Clerk userId)
- `categoryId` (UUID, optional) - References category (for category-linked budgets)
- `name` (varchar, optional) - Custom budget name (for custom budgets)
- `description` (text, optional) - Budget description
- `amount` (numeric(14,2)) - Budgeted amount
- `currency` (string, default: 'IDR') - Currency code
- `period` (enum: weekly | monthly | yearly) - Budget period
- `startDate` (date) - Budget start date
- `endDate` (date) - Budget end date
- `isActive` (boolean, default: true) - Whether budget is active
- `createdAt` (timestamp) - Creation time

### Goals
- `id` (UUID, primary key) - Unique goal identifier
- `userId` (string) - References user (Clerk userId)
- `name` (varchar) - Goal name (e.g., "Emergency Fund", "New Car")
- `description` (text, optional) - Goal description
- `targetAmount` (numeric(14,2)) - Target amount for the goal
- `currentAmount` (numeric(14,2), default: '0') - Current progress toward the goal
- `currency` (string, default: 'IDR') - Currency code
- `targetDate` (date, optional) - Target completion date
- `status` (enum: active | paused | completed | cancelled, default: 'active') - Goal status
- `walletId` (UUID, optional) - References wallet for automatic contributions
- `isActive` (boolean, default: true) - Whether goal is active
- `createdAt` (timestamp) - Creation time

## Relationships
- 1 User → N Wallets
- 1 User → N Categories
- 1 User → N Transactions
- 1 User → N Budgets
- 1 User → N Goals
- 1 Wallet → N Transactions
- 1 Wallet → N Goals (optional association for automatic contributions)
- 1 Category → N Transactions
- 1 Category → N Budgets (category-linked budgets)
- 1 Budget → N Transactions (for custom budgets)

## Key Constraints & Indexes
- `idx_transactions_user_date` (userId, date DESC) - For chronological transaction queries
- `idx_transactions_wallet` (walletId) - For wallet-based queries
- `idx_transactions_category` (categoryId) - For category-based queries
- `idx_budgets_user_category_period` (userId, categoryId, period, endDate) - For budget queries
- `idx_wallets_user` (userId) - For user wallet queries

## Type Safety
- All database schemas have corresponding TypeScript interfaces
- Zod schemas ensure data integrity at API boundaries
- Foreign key constraints maintain referential integrity