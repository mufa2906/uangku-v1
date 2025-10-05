# System Design — Uangku (v1.0.0)

## Architecture
- **Frontend+API:** Next.js 14.2.33 (App Router, TypeScript, Edge/Node runtime as needed)
- **Auth:** Clerk 5.0.0
- **DB:** Supabase Postgres
- **ORM:** Drizzle ORM 0.33.0 (node-postgres)
- **UI:** TailwindCSS 3.4.3 + shadcn/ui
- **Chart:** Recharts 2.13.0
- **Icons:** lucide-react 0.400.0
- **Deploy:** Vercel (app & API), Supabase (DB)
- **Observability:** Vercel Analytics (basic), log API (pino) optional

## Simple Flow Diagram
Client ⇄ Next.js (Route Handlers) ⇄ Drizzle ORM (pg) ⇄ Supabase Postgres  
                      ⇅ Clerk (JWT/session)

## Directory Structure
/src
├─ app/
│ ├─ (auth)/sign-in/...
│ ├─ dashboard/page.tsx
│ ├─ transactions/(routes)/page.tsx
│ ├─ categories/(routes)/page.tsx
│ ├─ budgets/(routes)/page.tsx
│ ├─ api/
│ │ ├─ transactions/route.ts # GET, POST
│ │ ├─ transactions/[id]/route.ts # PUT, DELETE
│ │ ├─ categories/route.ts
│ │ ├─ categories/[id]/route.ts
│ │ ├─ budgets/route.ts
│ │ ├─ budgets/[id]/route.ts
│ │ └─ budgets/summary/route.ts
│ ├─ layout.tsx
│ └─ providers.tsx # Clerk & theme providers
├─ components/
│ ├─ ui/ # shadcn generated components
│ ├─ charts/ # Recharts components
│ ├─ shells/ # layout cards, bottom-nav
│ ├─ transactions/ # transaction-specific components
│ └─ budgets/ # budget-specific components
├─ lib/
│ ├─ db.ts # pg pool + drizzle instance
│ ├─ auth.ts # Clerk helpers
│ ├─ constants.ts # app constants
│ ├─ schema.ts # drizzle db schema
│ ├─ zod.ts # validation schemas
│ └─ utils.ts # utility functions
├─ server/
│ └─ services/ # domain logic (insight, summaries, budget calculations)
├─ contexts/
│ └─ CurrencyContext.tsx # currency management
├─ types/ # TypeScript interfaces
└─ drizzle/ # drizzle migrations and schema

## Security & Access
- User validation via Clerk `auth()` in every handler.
- Queries always bound to `userId` (multi-tenant isolation).
- Zod for payload validation; rate limiting (optional) via middleware.
- Middleware to protect routes that can only be accessed by authenticated users.

## Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL` (postgres)
- `NEXT_PUBLIC_APP_URL` (optional for redirect URL)

## Scale & Performance
- Indexes on `transactions(date, user_id)`, `transactions(category_id)`, `budgets(category_id, user_id)`.
- Pagination/limit for listings.
- Edge runtime for lightweight GET requests (optional), Node for heavy DB operations.
- Strict type checking to prevent runtime errors.

## Deployment & Build
- Application must build successfully on Vercel without TypeScript errors.
- Production build cannot use vercel.app domain with Clerk production keys.
- For production, a custom domain is required.

## New Features Architecture (v1.0.0)

### Budgeting Tools Module
- **New API Endpoints**: `/api/budgets`, `/api/budgets/[id]`, `/api/budgets/summary`
- **Flexible Schema**: Budgets can be category-linked or custom named budgets
- **Enhanced UI Components**: Budget form sheets, progress cards, summary views
- **Calculation Engine**: Real-time budget vs. spending calculations
- **Type Safety**: Enhanced TypeScript interfaces for nullable fields

### Currency Support Module
- **Context Management**: Global currency preference with localStorage persistence
- **Formatting Library**: Locale-specific currency formatting for IDR, USD, EUR, GBP, SGD, THB, MYR
- **UI Integration**: Currency selector in settings, current currency display in profile

### Enhanced Component Architecture
- **Modular Design**: Separation of concerns with dedicated component folders
- **Reusable Components**: Progress bars, form sheets, summary cards
- **Consistent UX**: Unified design language across all modules

## Version Information
- **Application Version**: 1.0.0
- **Last Updated**: October 2025
- **Database Schema Version**: v1.2 (includes budgets table)
- **API Version**: v1 (RESTful endpoints)