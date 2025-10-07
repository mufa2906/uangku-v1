// src/lib/schema.ts
import { pgTable, varchar, timestamp, text, uuid, numeric, pgEnum, date, boolean } from "drizzle-orm/pg-core";

export const trxType = pgEnum("trx_type", ["income", "expense"]);
export const budgetPeriod = pgEnum("budget_period", ["weekly", "monthly", "yearly"]);
export const walletType = pgEnum("wallet_type", ["cash", "bank", "credit_card", "e_wallet", "savings"]);

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
  walletId: uuid("wallet_id")
    .references(() => wallets.id, { onDelete: "cascade" }), // Reference to wallet (nullable initially)
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  budgetId: uuid("budget_id")
    .references(() => budgets.id, { onDelete: "set null" }), // Optional reference to budget
  type: trxType("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  note: text("note"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Cash", "BCA Account", "Credit Card"
  type: walletType("type").notNull(), // cash, bank, credit_card, e_wallet, savings
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull().default('0'), // Current balance
  currency: varchar("currency", { length: 3 }).notNull().default('IDR'), // Currency of this wallet
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "cascade" }), // Source wallet for this budget
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "cascade" }), // Optional category reference
  name: varchar("name", { length: 100 }), // For custom budget names
  description: text("description"), // For budget descriptions
  allocatedAmount: numeric("allocated_amount", { precision: 14, scale: 2 }).notNull(), // Amount allocated to this budget
  remainingAmount: numeric("remaining_amount", { precision: 14, scale: 2 }).notNull(), // Amount remaining in this budget
  currency: varchar("currency", { length: 3 }).notNull().default('IDR'), // Currency code
  period: budgetPeriod("period").notNull(), // Budget period
  startDate: date("start_date").notNull(), // Start date of budget period
  endDate: date("end_date").notNull(), // End date of budget period
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});