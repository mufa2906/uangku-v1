# Data Model — Uangku

## Entitas
### users (dari Clerk; mirror minimal di app bila perlu profiling)
- id (string, Clerk userId)
- email, name (opsional cache)

### categories
- id (uuid, pk)
- user_id (string, ref users.id)
- name (text)
- icon (text, optional)
- type ('income' | 'expense')
- created_at (timestamptz default now())

### transactions
- id (uuid, pk)
- user_id (string, ref users.id)
- category_id (uuid, ref categories.id)
- type ('income' | 'expense')
- amount (numeric(14,2))
- note (text, nullable)
- date (timestamptz)
- created_at (timestamptz default now())

## Relasi
- 1 user → N categories
- 1 user → N transactions
- 1 category → N transactions

## Index & Constraint
- idx_transactions_user_date (user_id, date desc)
- idx_transactions_category (category_id)
- unique per user + kategori name + type (opsional): (user_id, lower(name), type)

## Drizzle Schema (TypeScript)
```ts
// src/lib/schema.ts
import { pgTable, varchar, timestamp, text, uuid, numeric, pgEnum } from "drizzle-orm/pg-core";
export const trxType = pgEnum("trx_type", ["income","expense"]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  type: trxType("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  type: trxType("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  note: text("note"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
  
  
"## Type Safety Enhancements"  
"- Semua API routes sekarang memiliki proper type checking"  
"- Schema Zod digunakan untuk validasi input"  
"- Type definitions yang ketat mencegah null/undefined errors"  
