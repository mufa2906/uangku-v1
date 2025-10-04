# Tech Stack — Uangku

## Frontend
- **Next.js (App Router, TypeScript)**
- **TailwindCSS**
- **shadcn/ui** (komponen UI)
- **Recharts** (chart)
- **lucide-react** (ikon)

## Backend
- **Next.js Route Handlers** (REST)
- Validasi: **Zod**
- Logging: **pino** (opsional)

## Auth
- **Clerk** (Session + UI components)

## Database & ORM
- **Supabase Postgres**
- **Drizzle ORM** (dialect: node-postgres `pg`)
- **drizzle-kit** untuk migrasi

## Dev & Quality
- Linting: ESLint + Prettier
- Testing: Vitest/Jest (opsional)
- Types: TypeScript strict
- Git: Conventional Commits

## Deploy
- **Vercel** (Next.js app & API)
- **Supabase** (managed Postgres)

## ENV (contoh)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...`
- `CLERK_SECRET_KEY=...`
- `DATABASE_URL=postgres://...`
- `NEXT_PUBLIC_APP_URL=https://uangku.vercel.app`
