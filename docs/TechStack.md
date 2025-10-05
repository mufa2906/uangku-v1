# Tech Stack — Uangku (v1.0.0)

## Frontend
- **Next.js 14.2.33** (App Router, TypeScript)
- **TailwindCSS 3.4.3**
- **shadcn/ui** (komponen UI)
- **Recharts 2.13.0** (chart)
- **lucide-react 0.400.0** (ikon)

## Backend
- **Next.js Route Handlers** (REST)
- Validasi: **Zod 3.23.8**
- Logging: **pino 7.11.0** (opsional)

## Auth
- **Clerk 5.0.0** (Session + UI components)
- **@clerk/themes 2.0.0**

## Database & ORM
- **Supabase Postgres**
- **Drizzle ORM 0.33.0** (dialect: node-postgres `pg`)
- **drizzle-kit 0.20.14** untuk migrasi
- **PostgreSQL 15+** (melalui Supabase)

## Dev & Quality
- Linting: ESLint 8.57.1 + Prettier
- Testing: Vitest/Jest (opsional)
- Types: TypeScript 5.5.3 strict
- Git: Conventional Commits
- Dependencies: Latest stable versions compatible with each other

## Deploy
- **Vercel** (Next.js app & API)
- **Supabase** (managed Postgres)

## Build & Type Safety
- TypeScript strict mode
- Proper type definitions for all API routes and components
- Zod schema validation for all user inputs
- Environment variable type safety

## Additional Libraries & Tools
- **Radix UI** (primitives for accessible UI components)
- **date-fns 3.6.0** (date manipulation)
- **next-themes 0.3.0** (theme management)
- **@radix-ui/react-progress 1.1.0** (progress components)
- **@types/node 20.14.10** (Node.js type definitions)
- **@types/react 18.3.3** (React type definitions)
- **@types/react-dom 18.3.0** (React DOM type definitions)

## ENV (contoh)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...`
- `CLERK_SECRET_KEY=...`
- `DATABASE_URL=postgres://...`
- `NEXT_PUBLIC_APP_URL=https://uangku.vercel.app` (diperlukan custom domain untuk production Clerk)

## Version Information
- **Application Version**: 1.0.0
- **Last Updated**: October 2025
- **Target Platform**: Web (mobile-first responsive design)
- **Supported Browsers**: Modern browsers supporting ES6+
