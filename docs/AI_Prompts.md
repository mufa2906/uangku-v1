# AI Prompts — Build with Assistance

## Urutan Eksekusi
1) Generate folder & config (Next.js, Tailwind, shadcn/ui, Clerk, Drizzle)
2) Generate schema & migrasi (Drizzle)
3) Implement API routes (transactions, categories)
4) Implement UI (Dashboard, Transactions, Categories, Profile)
5) Tambah insight service + chart

## Prompt 1 — Bootstrap Project
“Create a Next.js (App Router + TypeScript) project with Tailwind and shadcn/ui. Integrate Clerk for auth and Drizzle with Postgres (Supabase). Configure drizzle-kit and generate initial migrations based on /docs/DataModel.md.”

## Prompt 2 — Drizzle Schema & DB
“Based on /docs/DataModel.md, implement Drizzle schema in src/lib/schema.ts and migrations. Add indexes and enum as specified. Provide npm scripts: db:push, db:generate, db:migrate.”

## Prompt 3 — API
“Implement REST endpoints from /docs/API.md using Next.js route handlers. Validate input with Zod. Ensure all queries are scoped by Clerk userId.”

## Prompt 4 — UI
“Implement UI per /docs/UI_Guidelines.md with shadcn/ui. Add a floating action button (FAB) to add transactions via <Sheet> with quick defaults.”

## Prompt 5 — Insight
“Add a weekly summary service that aggregates income/expense for the last 7 days and returns trend deltas for the dashboard.”

## Prompt 6 — Tests (opsional)
“Add unit tests for server/services and zod validators using Vitest.”
