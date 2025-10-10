# Uangku - System Architecture & Technical Overview

## Overview
Uangku is a personal finance tracking application built with modern web technologies, designed for Indonesian users with focus on mobile-first experience, currency localization, and simple yet powerful budgeting tools. The application now includes advanced features like goal tracking, bill reminders, and AI-powered transaction entry.

## Architecture
- **Frontend**: Next.js 14.2.33 (App Router, TypeScript)
- **Styling**: TailwindCSS 3.4.3 + shadcn/ui components
- **Authentication**: Clerk 5.0.0 (with JWT/session management)
- **Backend**: Next.js Route Handlers (REST API)
- **Database**: Supabase PostgreSQL
- **ORM**: Drizzle ORM (node-postgres dialect)
- **Charts**: Recharts 2.13.0
- **Icons**: lucide-react 0.400.0
- **Validation**: Zod 3.23.8 for schema validation
- **Deployment**: Vercel (frontend/API), Supabase (database)

## Data Flow
Client ⇄ Next.js (Route Handlers) ⇄ Drizzle ORM (pg) ⇄ Supabase Postgres  
                      ⇅ Clerk (Authentication)

## Core Features Architecture

### 1. Wallet System
- **wallets** table: id, userId, name, type (cash, bank, credit_card, e_wallet, savings), balance, currency, isActive
- Each transaction is linked to a specific wallet
- Wallet balances update automatically when transactions are created/updated/deleted
- Supports multiple wallet types for comprehensive financial tracking
- Wallet-specific currency configuration

### 2. Transaction System
- **transactions** table: id, userId, walletId, categoryId, budgetId, type (income/expense), amount, note, date
- Links to wallets, categories, and budgets
- Automatic balance updates on wallet when transactions occur
- Supports both budget-linked and standalone transactions
- Implements proper double-deduction prevention (transaction money is either deducted from wallet OR budget, not both)
- Includes advanced filtering and pagination capabilities

### 3. Budget System
- **budgets** table: id, userId, walletId, categoryId (optional), name (for custom budgets), allocatedAmount, remainingAmount, currency, period, startDate, endDate, isActive
- Supports both category-linked and custom named budgets
- Tracks allocated vs. remaining amounts for precise budget tracking
- Implements budget-wallet mismatch prevention
- Calculates spending vs. budget through budget summary API
- Includes period-based budgeting (weekly, monthly, yearly)
- Maintains proper budget balances without double-deduction issues

### 4. Category System
- **categories** table: id, userId, name, icon, type (income/expense)
- Scoped to individual users only
- Supports income and expense categorization
- Used across transactions, budgets, and bills

### 5. Goals System
- **goals** table: id, userId, name, description, targetAmount, currentAmount, currency, targetDate, status (active, paused, completed, cancelled), walletId (optional), isActive
- Supports financial goal tracking with progress monitoring
- Goal-to-wallet association for automatic contributions
- Status management for goal lifecycle (active, paused, completed, cancelled)
- API routes for goal CRUD operations
- Progress tracking with percentage completion

### 6. Bills System
- **bills** table: id, userId, name, description, amount, currency, dueDate, nextDueDate, recurrencePattern, recurrenceInterval, autoNotify, notifyDaysBefore, walletId, categoryId, isPaid, paidDate, isActive
- Bill reminder functionality with automated notifications
- Recurring bill support with various patterns (weekly, monthly, yearly, custom)
- Due date tracking with overdue status
- Bill payments linked to wallets and categories

### 7. AI Transaction Entry
- Natural language processing for transaction input
- Transaction learning system to improve suggestions
- Support for Indonesian spending patterns
- Pattern recognition and learning for improved categorization

## Security & Access Control
- User validation via Clerk `auth()` in every API handler
- All queries bound to `userId` for multi-tenant isolation
- Zod for comprehensive payload validation
- Rate limiting via middleware (optional)
- Middleware to protect routes requiring authentication
- Budget-wallet mismatch prevention for proper financial tracking

## Directory Structure
```
/src
├─ app/                    # Next.js App Router pages
│ ├─ (auth)/              # Authentication routes (sign-in, sign-up)
│ ├─ api/                 # Next.js API route handlers
│ │ ├─ transactions/      # Transaction CRUD operations
│ │ ├─ wallets/           # Wallet management
│ │ ├─ budgets/           # Budget management
│ │ ├─ categories/        # Category management
│ │ ├─ goals/             # Goal tracking
│ │ ├─ bills/             # Bill reminders
│ │ └─ insights/          # Dashboard insights and analytics
│ ├─ dashboard/page.tsx   # Main dashboard
│ ├─ transactions/        # Transaction management
│ ├─ wallets/            # Wallet management
│ ├─ budgets/            # Budget management
│ ├─ categories/         # Category management
│ ├─ goals/              # Goal management
│ ├─ bills/              # Bill reminder system
│ ├─ settings/           # App settings and preferences
│ ├─ profile/            # User profile management
│ ├─ layout.tsx          # Main layout
│ └─ providers.tsx       # Context providers
├─ components/            # Reusable UI components
│ ├─ ui/                 # shadcn generated components
│ ├─ charts/             # Chart components
│ ├─ shells/             # Layout shells (bottom nav, header)
│ ├─ transactions/       # Transaction-specific components
│ ├─ wallets/            # Wallet-specific components
│ ├─ budgets/            # Budget-specific components
│ ├─ goals/              # Goal-specific components
│ ├─ bills/              # Bill-specific components
│ ├─ export/             # Export functionality components
│ ├─ ai/                 # AI-powered transaction entry
│ └─ export/             # Data export functionality
├─ contexts/              # React Context providers
│ └─ CurrencyContext.tsx # Currency management
├─ lib/                  # Libraries and utilities
│ ├─ db.ts               # Database connection and Drizzle instance
│ ├─ auth.ts             # Clerk helpers
│ ├─ constants.ts        # App constants
│ ├─ schema.ts           # Drizzle database schema
│ ├─ zod.ts              # Validation schemas for all API endpoints
│ ├─ currency.ts         # Currency formatting utilities
│ ├─ transaction-nlp.ts  # Natural language processing for transactions
│ └─ transaction-learning.ts # Transaction pattern learning system
├─ types/                # TypeScript interfaces for all entities
│ └─ index.ts            # Type definitions for Transaction, Wallet, Budget, etc.
├─ server/               # Server-side services
│ └─ services/           # Domain logic (insights, summaries, calculations)
└─ drizzle/              # Drizzle migrations and schema generation
```

## Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - App URL (for redirects)

## Database Indexes
- `idx_transactions_user_date` (user_id, date desc) - For date-ordered queries
- `idx_transactions_category` (category_id) - For category-based queries
- `idx_transactions_wallet` (wallet_id) - For wallet-based queries
- `idx_wallets_user` (user_id) - For user wallet queries
- `idx_budgets_user_category_period` (user_id, category_id, period, end_date) - For budget queries
- `idx_goals_user_status` (user_id, status) - For goal queries
- `idx_bills_user_due_date` (user_id, due_date) - For bill queries
- `idx_bills_next_due_date` (next_due_date, is_paid) - For upcoming bills

## Type Safety Features
- Strict TypeScript mode compliance
- Zod schema validation for all user inputs
- Strongly typed API routes with comprehensive interfaces
- Type definitions that prevent null/undefined runtime errors
- Comprehensive schema validation for all CRUD operations

## API Endpoints
- `POST /api/transactions` - Create transaction with proper wallet/budget handling
- `PUT /api/transactions/[id]` - Update transaction with validation
- `DELETE /api/transactions/[id]` - Delete transaction with balance updates
- `GET /api/transactions` - Fetch transactions with filtering and pagination
- `POST /api/budgets` - Create budget with wallet association
- `GET /api/budgets` - Fetch user budgets
- `POST /api/wallets` - Create wallet with balance management
- `GET /api/wallets` - Fetch user wallets
- `POST /api/goals` - Create financial goal with progress tracking
- `GET /api/goals` - Fetch user goals
- `POST /api/bills` - Create bill reminder with recurrence
- `GET /api/bills` - Fetch user bills with filtering
- `GET /api/insights` - Dashboard analytics and summary data

## UI/UX Features
- Mobile-first responsive design optimized for financial tracking
- Floating action button for quick transaction entry
- Bottom navigation with 5 main sections: Dashboard, Transactions, Wallets, Budgets, Goals
- Sheet modals for transaction and form interactions
- Currency context for proper localization
- Toast notifications for user feedback
- Budget progress visualization
- Weekly trend charts and analytics

## Deployment
- Must deploy with custom domain (not vercel.app) for production Clerk keys
- Vercel Analytics for basic observability
- Production builds require proper domain configuration
- Drizzle ORM for database migrations and schema management