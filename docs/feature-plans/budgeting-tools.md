# Feature Plan: Budgeting Tools

## Overview
Implement budgeting functionality allowing users to set spending limits and track their progress with various budgeting methodologies.

## User Stories
- As a user, I want to set monthly budgets for different categories
- As a user, I want to see my spending vs. budget progress visually
- As a user, I want alerts when I'm approaching my budget limits
- As a user, I want to use different budgeting methods (50/30/20, zero-based, envelope method)
- As an Indonesian user, I want budgets in my preferred currency (IDR)

## Requirements
- Allow users to set budgets per category with amounts and time periods
- Visual indicators for budget progress (e.g., progress bars, charts)
- Budget period management (monthly, weekly, etc.)
- Alert system for budget limits
- Support for different budgeting methodologies
- Integration with existing transaction and category systems
- Display budget information in preferred currency

## Technical Implementation
- Add budget table to database (userId, categoryId, budgetAmount, period, startDate, endDate, currency)
- Create API routes for budget CRUD operations (/api/budgets)
- Update dashboard to show budget progress
- Implement notification system for budget alerts
- Create budget setting UI in categories/budgets page
- Integrate with existing CurrencyContext for proper currency display

## Budgeting Methodologies to Support
1. **50/30/20 Rule**: 50% needs, 30% wants, 20% savings
2. **Zero-Based Budgeting**: Income - Expenses = 0
3. **Envelope Method**: Allocate cash to different spending categories
4. **Pay Yourself First**: Automate savings before spending

## UI/UX Considerations
- Add budget setting section to category management or dedicated budget page
- Visual budget progress indicators on dashboard
- Color-coded budget status (green for under budget, red for over)
- Quick budget setting using historical spending data
- Budget summary cards showing progress
- Calendar view for budget periods

## Database Schema
```ts
// In src/lib/schema.ts
export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(), // References users.id (Clerk)
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(), // Budget amount
  currency: varchar("currency", { length: 3 }).notNull().default('IDR'), // Currency code
  period: pgEnum("budget_period", ["weekly", "monthly", "yearly"]).notNull(), // Budget period
  startDate: date("start_date").notNull(), // Start date of budget period
  endDate: date("end_date").notNull(), // End date of budget period
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
```

## API Endpoints to Implement
- `GET /api/budgets` - Get all user budgets
- `GET /api/budgets/:id` - Get specific budget
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update existing budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/summary` - Get budget vs. spending summary

## Acceptance Criteria
- [ ] User can set budgets for each category with specific amounts
- [ ] Budget progress is displayed visually on dashboard
- [ ] System shows spending vs. budget comparison with percentage
- [ ] User can set different budget periods (weekly, monthly, yearly)
- [ ] Budget settings are saved and persist between sessions  
- [ ] Multiple budgeting methodologies are supported
- [ ] Budget information displays in user's preferred currency
- [ ] Users can create, update, and delete budgets

## Future Enhancements
- Budget forecasting based on historical data
- Shared budgets for families/households
- Automatic budget adjustment suggestions
- Budget vs. actual variance analysis
- Integration with goal-based savings
- Recurring budget templates