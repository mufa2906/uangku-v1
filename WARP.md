# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
**Uangku** is a personal finance tracking application built for Indonesian users. It's a Next.js 14 app with TypeScript, using Clerk for authentication, Supabase PostgreSQL for data persistence, and shadcn/ui for components.

## Development Commands

### Core Development
- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database Operations
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Testing Individual Components
- Test API routes: `curl http://localhost:3000/api/transactions` (requires auth)
- Use Drizzle Studio for database inspection
- Check Clerk Dashboard for auth issues

## Environment Setup
Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth
- `CLERK_SECRET_KEY` - Clerk server-side auth
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - App URL (default: http://localhost:3000)

## Architecture Overview

### Core Data Models
The app centers around four main entities with clear relationships:
- **Wallets**: User's money sources (cash, bank accounts, e-wallets, etc.)
- **Categories**: Classification for transactions (income/expense types)
- **Budgets**: Spending allocations linked to specific wallets, optionally to categories
- **Transactions**: Money movements between wallets, categorized and optionally budget-linked

### Key Relationships
- Transactions belong to one wallet and one category
- Transactions can optionally be linked to a budget
- Budgets are sourced from specific wallets
- Users can have multiple wallets with different currencies
- Budget balances and wallet balances update automatically with transactions

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # REST API routes
│   │   ├── transactions/  # Transaction CRUD
│   │   ├── wallets/       # Wallet management
│   │   ├── budgets/       # Budget operations
│   │   └── categories/    # Category management
│   ├── dashboard/         # Main dashboard page
│   ├── transactions/      # Transaction management UI
│   ├── budgets/          # Budget management UI
│   └── wallets/          # Wallet management UI
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── transactions/     # Transaction-specific components
│   ├── budgets/          # Budget-specific components
│   └── charts/           # Data visualization
├── lib/                  # Core utilities
│   ├── schema.ts         # Drizzle database schema
│   ├── db.ts            # Database connection
│   ├── zod.ts           # Validation schemas
│   └── currency.ts      # Currency formatting
└── types/               # TypeScript type definitions
```

### API Design
RESTful API with consistent patterns:
- **GET** `/api/{resource}` - List with pagination, filtering, sorting
- **POST** `/api/{resource}` - Create new resource
- **GET** `/api/{resource}/[id]` - Get specific resource
- **PATCH** `/api/{resource}/[id]` - Update resource
- **DELETE** `/api/{resource}/[id]` - Delete resource

All APIs require Clerk authentication and validate input with Zod schemas.

### Database Schema Highlights
- Uses UUID primary keys for all entities
- Decimal precision (14,2) for all monetary values stored as strings
- Comprehensive foreign key relationships with cascade deletes
- Supports multiple currencies (default: IDR)
- Soft deletes via `isActive` flags where appropriate

### Key Business Logic
1. **Transaction Creation**: Automatically updates wallet balances OR budget remaining amounts (not both)
2. **Budget Validation**: Prevents overspending when transactions are budget-linked
3. **Wallet-Budget Linking**: Budgets must be linked to source wallets
4. **Currency Consistency**: Validates currency matching between related entities

### Authentication Flow
- Uses Clerk for authentication with middleware protection
- All API routes require valid user session
- User isolation enforced at database level via userId filtering

### Mobile-First Design
- Optimized for Indonesian users with IDR currency formatting
- Bottom navigation for core features
- Quick transaction entry with floating action button
- Responsive design using TailwindCSS

## Development Notes

### Adding New Features
1. Start with database schema changes in `src/lib/schema.ts`
2. Generate and run migrations: `npm run db:generate && npm run db:migrate`
3. Add validation schemas in `src/lib/zod.ts`
4. Create API routes in `src/app/api/`
5. Build UI components and pages
6. Test with Drizzle Studio for data verification

### Working with Transactions
- Always verify wallet ownership before allowing transactions
- Use database transactions for balance updates to maintain consistency
- Consider budget implications when creating expense transactions
- Validate currency compatibility between wallets, budgets, and transactions

### Component Development
- Follow shadcn/ui patterns for consistency
- Use the existing CurrencyContext for formatting
- Implement proper loading and error states
- Ensure mobile responsiveness

### Database Development
- Use Drizzle Studio for data inspection and manual testing
- Always use parameterized queries via Drizzle ORM
- Consider adding indexes for frequently queried fields
- Test cascade deletes carefully to prevent data loss