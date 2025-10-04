# System Design — Uangku

## Arsitektur
- **Frontend+API:** Next.js (App Router, TypeScript, Edge/Node runtime sesuai kebutuhan)
- **Auth:** Clerk
- **DB:** Supabase Postgres
- **ORM:** Drizzle (node-postgres)
- **UI:** TailwindCSS + shadcn/ui
- **Chart:** Recharts
- **Ikon:** lucide-react
- **Deploy:** Vercel (app & API), Supabase (DB)
- **Observability:** Vercel Analytics (basic), log API (pino) opsional

## Diagram Alir Sederhana
Client ⇄ Next.js (Route Handlers) ⇄ Drizzle (pg) ⇄ Supabase Postgres  
                      ⇅ Clerk (JWT/session)

## Struktur Direktori
/src
├─ app/
│ ├─ (auth)/sign-in/...
│ ├─ dashboard/page.tsx
│ ├─ transactions/(routes)/page.tsx
│ ├─ categories/(routes)/page.tsx
│ ├─ api/
│ │ ├─ transactions/route.ts # GET, POST
│ │ ├─ transactions/[id]/route.ts # PUT, DELETE
│ │ ├─ categories/route.ts
│ │ └─ categories/[id]/route.ts
│ ├─ layout.tsx
│ └─ providers.tsx # Clerk & theme providers
├─ components/
│ ├─ ui/ # shadcn generated components
│ ├─ charts/ # Recharts components
│ ├─ shells/ # layout cards, bottom-nav
│ └─ transactions/ # transaction-specific components
├─ lib/
│ ├─ db.ts # pg pool + drizzle instance
│ ├─ auth.ts # Clerk helpers
│ ├─ constants.ts # app constants
│ ├─ schema.ts # drizzle db schema
│ ├─ zod.ts # validation schemas
│ └─ utils.ts # utility functions
├─ server/
│ └─ services/ # domain logic (insight, summaries)
├─ types/ # TypeScript interfaces
└─ drizzle/ # drizzle migrations and schema

## Keamanan & Akses
- Validasi user via Clerk `auth()` di setiap handler.
- Query selalu terikat `userId` (multi-tenant isolation).
- Zod untuk validasi payload; rate limiting (opsional) via middleware.
- Middleware untuk proteksi route yang hanya bisa diakses authenticated user.

## Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL` (postgres)
- `NEXT_PUBLIC_APP_URL` (opsional untuk redirect URL)

## Skala & Performa
- Index di `transactions(date, user_id)`, `transactions(category_id)`.
- Pagination/limit untuk listing.
- Edge runtime untuk GET ringan (opsional), Node untuk operasi DB berat.
- Type checking strict untuk mencegah runtime errors.

## Deployment & Build
- Aplikasi harus bisa build di Vercel tanpa error TypeScript.
- Production build tidak bisa menggunakan domain vercel.app jika ingin menggunakan Clerk production keys.
- Untuk production perlu custom domain sendiri.
