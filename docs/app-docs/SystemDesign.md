# Uangku - System Architecture & Technical Overview

## Overview
Uangku is a personal finance tracking application built with modern web technologies, designed for Indonesian users with focus on mobile-first experience, currency localization, and simple yet powerful budgeting tools.

## Architecture
- **Frontend**: Next.js 14.2.33 (App Router, TypeScript)
- **Styling**: TailwindCSS 3.4.3 + shadcn/ui components
- **Authentication**: Clerk 5.0.0 (with JWT/session management)
- **Backend**: Next.js Route Handlers (REST API)
- **Database**: Supabase PostgreSQL
- **ORM**: Drizzle ORM 0.33.0 (node-postgres dialect)
- **Charts**: Recharts 2.13.0
- **Icons**: lucide-react 0.400.0
- **Deployment**: Vercel (frontend/API), Supabase (database)

## Data Flow
Client ⇄ Next.js (Route Handlers) ⇄ Drizzle ORM (pg) ⇄ Supabase Postgres  
                      ⇅ Clerk (Authentication)

## Core Features Architecture

### 1. Wallet System
- **wallets** table: id, userId, name, type (cash, bank, credit_card, e_wallet, savings), balance, currency, isActive
- Each transaction is linked to a specific wallet
- Wallet balances update automatically when transactions are created/updated/deleted

### 2. Transaction System
- **transactions** table: id, userId, walletId, categoryId, budgetId, type (income/expense), amount, note, date
- Links to wallets, categories, and budgets
- Automatic balance updates on wallet when transactions occur

### 3. Budget System
- **budgets** table: id, userId, categoryId (optional), name (for custom budgets), amount, currency, period, startDate, endDate, isActive
- Supports both category-linked and custom named budgets
- Calculates spending vs. budget through budget summary API

### 4. Category System
- **categories** table: id, userId, name, icon, type (income/expense)
- Scoped to individual users only

### 5. Goals System
- **goals** table: id, userId, name, description, targetAmount, currentAmount, currency, targetDate, status (active, paused, completed, cancelled), walletId (optional), isActive
- Supports financial goal tracking with progress monitoring
- Goal-to-wallet association for automatic contributions
- Status management for goal lifecycle (active, paused, completed, cancelled)
- API routes for goal CRUD operations

## Security & Access Control
- User validation via Clerk `auth()` in every API handler
- All queries bound to `userId` for multi-tenant isolation
- Zod for payload validation
- Rate limiting via middleware (optional)
- Middleware to protect routes requiring authentication

## Directory Structure
```
/src
├─ app/                    # Next.js App Router pages
│ ├─ (auth)/              # Authentication routes
│ ├─ dashboard/page.tsx   # Main dashboard
│ ├─ transactions/        # Transaction management
│ ├─ wallets/            # Wallet management
│ ├─ budgets/            # Budget management
│ ├─ categories/         # Category management
│ ├─ goals/              # Goal management
│ ├─ api/                # API route handlers
│ ├─ layout.tsx          # Main layout
│ └─ providers.tsx       # Context providers
├─ components/            # Reusable UI components
│ ├─ ui/                 # shadcn generated components
│ ├─ charts/             # Chart components
│ ├─ shells/             # Layout shells (bottom nav)
│ ├─ transactions/       # Transaction-specific components
│ ├─ wallets/            # Wallet-specific components
│ ├─ budgets/            # Budget-specific components
│ ├─ goals/              # Goal-specific components
│ ├─ export/             # Export functionality components
│ └─ ui/                 # Additional shadcn/ui components (textarea, toast)
├─ lib/                  # Libraries and utilities
│ ├─ db.ts               # Database connection and Drizzle instance
│ ├─ auth.ts             # Clerk helpers
│ ├─ constants.ts        # App constants
│ ├─ schema.ts           # Drizzle database schema
│ ├─ zod.ts              # Validation schemas
│ └─ utils.ts            # Utility functions
├─ contexts/              # React Context providers
│ └─ CurrencyContext.tsx # Currency management
├─ server/                # Server-side services
│ └─ services/           # Domain logic (insights, summaries, calculations)
├─ types/                # TypeScript interfaces
└─ drizzle/              # Drizzle migrations
```

## Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - App URL (for redirects)

## Database Indexes
- `idx_transactions_user_date` (user_id, date desc) - For date-ordered queries
- `idx_transactions_category` (category_id) - For category-based queries
- `idx_wallets_user` (user_id) - For user wallet queries
- `idx_budgets_user_category` (user_id, category_id, start_date) - For budget queries

## Type Safety Features
- Strict TypeScript mode compliance
- Zod schema validation for all user inputs
- Strongly typed API routes
- Type definitions that prevent null/undefined runtime errors

## Deployment
- Must deploy with custom domain (not vercel.app) for production Clerk keys
- Vercel Analytics for basic observability
- Production builds require proper domain configuration