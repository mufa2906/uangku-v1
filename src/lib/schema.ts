// src/lib/schema.ts
import { pgTable, varchar, timestamp, text, uuid, numeric, pgEnum, date, boolean, primaryKey, integer } from "drizzle-orm/pg-core";

export const trxType = pgEnum("trx_type", ["income", "expense"]);
export const budgetPeriod = pgEnum("budget_period", ["weekly", "monthly", "yearly"]);
export const walletType = pgEnum("wallet_type", ["cash", "bank", "credit_card", "e_wallet", "savings"]);
export const goalStatus = pgEnum("goal_status", ["active", "paused", "completed", "cancelled"]);

// BetterAuth tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id", { length: 50 }).notNull(), // 'google', 'github', etc.
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: integer("expires_at"),
  tokenType: varchar("token_type", { length: 50 }),
  scope: varchar("scope", { length: 255 }),
  idToken: text("id_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  
}, (table) => {
  return {
    compoundKey: primaryKey({ columns: [table.providerId, table.providerAccountId] }),
  };
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
  
}, (table) => {
  return {
    compoundKey: primaryKey({ columns: [table.identifier, table.token] }),
  };
});

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

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(), // Goal name like "Emergency Fund", "New Car"
  description: text("description"), // Optional description
  targetAmount: numeric("target_amount", { precision: 14, scale: 2 }).notNull(), // Goal target amount
  currentAmount: numeric("current_amount", { precision: 14, scale: 2 }).notNull().default('0'), // Current progress
  currency: varchar("currency", { length: 3 }).notNull().default('IDR'), // Currency code
  targetDate: date("target_date"), // Optional target completion date
  status: goalStatus("status").notNull().default('active'),
  walletId: uuid("wallet_id")
    .references(() => wallets.id, { onDelete: "set null" }), // Optional linked wallet for auto-contributions
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Bill reminders/scheduled payments
export const bills = pgTable("bills", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Electricity Bill", "Internet", "Rent"
  description: text("description"), // Optional description
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(), // Bill amount
  currency: varchar("currency", { length: 3 }).notNull().default('IDR'), // Currency code
  dueDate: date("due_date").notNull(), // When the bill is due
  nextDueDate: date("next_due_date").notNull(), // Next due date for recurring bills
  recurrencePattern: varchar("recurrence_pattern", { length: 20 }), // e.g., "monthly", "yearly", "weekly", "custom"
  recurrenceInterval: numeric("recurrence_interval", { precision: 3, scale: 0 }), // e.g., every 2 months
  autoNotify: boolean("auto_notify").notNull().default(true), // Whether to send reminders
  notifyDaysBefore: numeric("notify_days_before", { precision: 2, scale: 0 }).notNull().default('3'), // Days before due date to notify
  walletId: uuid("wallet_id")
    .references(() => wallets.id, { onDelete: "set null" }), // Associated wallet for payment
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "set null" }), // Associated category
  isPaid: boolean("is_paid").notNull().default(false), // Whether the bill is paid
  paidDate: date("paid_date"), // Date when the bill was paid
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
