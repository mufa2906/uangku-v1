import { pgTable, uuid, varchar, numeric, boolean, timestamp, text, foreignKey, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const budgetPeriod = pgEnum("budget_period", ['weekly', 'monthly', 'yearly'])
export const trxType = pgEnum("trx_type", ['income', 'expense'])
export const walletType = pgEnum("wallet_type", ['cash', 'bank', 'credit_card', 'e_wallet', 'savings'])


export const wallets = pgTable("wallets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	type: walletType().notNull(),
	balance: numeric({ precision: 14, scale:  2 }).default('0').notNull(),
	currency: varchar({ length: 3 }).default('IDR').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	name: text().notNull(),
	icon: text(),
	type: trxType().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const transactions = pgTable("transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	categoryId: uuid("category_id").notNull(),
	type: trxType().notNull(),
	amount: numeric({ precision: 14, scale:  2 }).notNull(),
	note: text(),
	date: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	budgetId: uuid("budget_id"),
	walletId: uuid("wallet_id"),
}, (table) => [
	foreignKey({
			columns: [table.budgetId],
			foreignColumns: [budgets.id],
			name: "transactions_budget_id_budgets_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "transactions_category_id_categories_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.walletId],
			foreignColumns: [wallets.id],
			name: "transactions_wallet_id_wallets_id_fk"
		}).onDelete("cascade"),
]);

export const budgets = pgTable("budgets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	categoryId: uuid("category_id"),
	currency: varchar({ length: 3 }).default('IDR').notNull(),
	period: budgetPeriod().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	name: varchar({ length: 100 }),
	description: text(),
	walletId: uuid("wallet_id").notNull(),
	allocatedAmount: numeric("allocated_amount", { precision: 14, scale:  2 }).default('0').notNull(),
	remainingAmount: numeric("remaining_amount", { precision: 14, scale:  2 }).default('0').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "budgets_category_id_categories_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.walletId],
			foreignColumns: [wallets.id],
			name: "budgets_wallet_id_fkey"
		}).onDelete("cascade"),
]);
