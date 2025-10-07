import { relations } from "drizzle-orm/relations";
import { budgets, transactions, categories, wallets } from "./schema";

export const transactionsRelations = relations(transactions, ({one}) => ({
	budget: one(budgets, {
		fields: [transactions.budgetId],
		references: [budgets.id]
	}),
	category: one(categories, {
		fields: [transactions.categoryId],
		references: [categories.id]
	}),
	wallet: one(wallets, {
		fields: [transactions.walletId],
		references: [wallets.id]
	}),
}));

export const budgetsRelations = relations(budgets, ({one, many}) => ({
	transactions: many(transactions),
	category: one(categories, {
		fields: [budgets.categoryId],
		references: [categories.id]
	}),
	wallet: one(wallets, {
		fields: [budgets.walletId],
		references: [wallets.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	transactions: many(transactions),
	budgets: many(budgets),
}));

export const walletsRelations = relations(wallets, ({many}) => ({
	transactions: many(transactions),
	budgets: many(budgets),
}));