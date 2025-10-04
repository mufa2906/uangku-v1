// drizzle/schema-temp.js
var pgCore = require('drizzle-orm/pg-core');

var trxType = pgCore.pgEnum("trx_type", ["income", "expense"]);

var categories = pgCore.pgTable("categories", {
  id: pgCore.uuid("id").primaryKey().defaultRandom(),
  userId: pgCore.varchar("user_id").notNull(),
  name: pgCore.text("name").notNull(),
  icon: pgCore.text("icon"),
  type: trxType("type").notNull(),
  createdAt: pgCore.timestamp("created_at", { withTimezone: true }).defaultNow(),
});

var transactions = pgCore.pgTable("transactions", {
  id: pgCore.uuid("id").primaryKey().defaultRandom(),
  userId: pgCore.varchar("user_id").notNull(),
  categoryId: pgCore.uuid("category_id")
    .notNull()
    .references(function() { return categories.id; }, { onDelete: "cascade" }),
  type: trxType("type").notNull(),
  amount: pgCore.numeric("amount", { precision: 14, scale: 2 }).notNull(),
  note: pgCore.text("note"),
  date: pgCore.timestamp("date", { withTimezone: true }).notNull(),
  createdAt: pgCore.timestamp("created_at", { withTimezone: true }).defaultNow(),
});

module.exports = {
  categories: categories,
  transactions: transactions,
  trxType: trxType
};