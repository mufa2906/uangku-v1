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
│ └─ layout.tsx
├─ components/
│ ├─ ui/ # shadcn generated components
│ ├─ charts/ # Recharts components
│ └─ shells/ # layout cards, bottom-nav
├─ lib/
│ ├─ db.ts # pg pool + drizzle instance
│ ├─ auth.ts # Clerk helpers
│ ├─ zod.ts # schemas
│ └─ utils.ts
├─ server/
│ ├─ repos/ # query access (transactions, categories)
│ └─ services/ # domain logic (insight, summaries)
└─ drizzlemigrations/ # drizzle-kit output

## Keamanan & Akses
- Validasi user via Clerk `auth()` di setiap handler.
- Query selalu terikat `userId` (multi-tenant isolation).
- Zod untuk validasi payload; rate limiting (opsional) via middleware.

## Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL` (postgres)
- `NEXTAUTH_URL` (jika diperlukan), `NEXT_PUBLIC_APP_URL` (opsional)

## Skala & Performa
- Index di `transactions(date, user_id)`, `transactions(category_id)`.
- Pagination/limit untuk listing.
- Edge runtime untuk GET ringan (opsional), Node untuk operasi DB berat.
