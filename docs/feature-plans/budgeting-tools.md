# Feature Plan: Budgeting Tools

## Overview
Implement budgeting functionality allowing users to set spending limits and track their progress with various budgeting methodologies. Supports both category-linked budgets and flexible custom budgets.

## User Stories
- As a user, I want to set monthly budgets for different categories
- As a user, I want to create custom budgets for goals (e.g., "Vacation Fund")
- As a user, I want to see my spending vs. budget progress visually
- As a user, I want alerts when I'm approaching my budget limits
- As a user, I want to use different budgeting methods (50/30/20, zero-based, envelope method)
- As an Indonesian user, I want budgets in my preferred currency (IDR)

## Requirements
- Allow users to set budgets per category OR custom named budgets
- Visual indicators for budget progress (e.g., progress bars, charts)
- Budget period management (monthly, weekly, yearly)
- Alert system for budget limits
- Support for different budgeting methodologies
- Integration with existing transaction and category systems
- Display budget information in preferred currency
- Support for both traditional category budgets and flexible custom budgets

## Technical Implementation
- Add flexible budget table to database with optional categoryId
- Create API routes for budget CRUD operations (/api/budgets)
- Update dashboard to show budget progress
- Implement notification system for budget alerts
- Create dedicated budgets page with comprehensive management
- Integrate with existing CurrencyContext for proper currency display
- Support both category-linked and custom named budgets

## Flexible Budget Architecture
- **Category-Linked Budgets**: Traditional approach linking to existing expense categories
- **Custom Budgets**: Named budgets without category linkage (e.g., "Travel Fund", "Emergency Savings")
- **Hybrid Budgets**: Named budgets with optional category linking

## Budgeting Methodologies to Support
1. **50/30/20 Rule**: 50% needs, 30% wants, 20% savings
2. **Zero-Based Budgeting**: Income - Expenses = 0
3. **Envelope Method**: Allocate funds to different spending categories
4. **Pay Yourself First**: Automate savings before spending
5. **Goal-Based Budgeting**: Custom budgets for specific financial goals

## UI/UX Considerations
- Dedicated budgets page for comprehensive budget management
- Visual budget progress indicators on dashboard
- Color-coded budget status (green for under budget, yellow for approaching, red for over)
- Quick budget creation using historical spending data
- Budget summary cards showing progress with detailed breakdowns
- Calendar view for budget periods
- Support for both category-linked and custom named budgets
- Intuitive form with clear guidance for budget creation

## Database Schema
```ts
// In src/lib/schema.ts
export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(), // References users.id (Clerk)
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }), // Optional category linkage
  name: varchar("name", { length: 100 }), // Custom budget name
  description: text("description"), // Optional description
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(), // Budget amount
  currency: varchar("currency", { length: 3 }).notNull().default('IDR'), // Currency code
  period: pgEnum("budget_period", ["weekly", "monthly", "yearly"]).notNull(), // Budget period
  startDate: date("start_date").notNull(), // Start date of budget period
  endDate: date("end_date").notNull(), // End date of budget period
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
```

## API Endpoints Implemented
- `GET /api/budgets` - Get all user budgets
- `GET /api/budgets/:id` - Get specific budget
- `POST /api/budgets` - Create new budget (category-linked or custom)
- `PUT /api/budgets/:id` - Update existing budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/summary` - Get budget vs. spending summary with calculations

## Key Features Implemented
- [x] Users can create both category-linked and custom named budgets
- [x] Budget progress is calculated and displayed visually on dashboard
- [x] System shows spending vs. budget comparison with percentage
- [x] Users can set different budget periods (weekly, monthly, yearly)
- [x] Budget settings are saved and persist between sessions  
- [x] Multiple budgeting methodologies are supported through flexible architecture
- [x] Budget information displays in user's preferred currency
- [x] Users can create, update, and delete budgets
- [x] Flexible budget architecture supporting both approaches
- [x] Budget summary calculations with real transaction data
- [x] Smart end date calculation with manual override capability

## Future Enhancements
- Budget forecasting based on historical data
- Shared budgets for families/households
- Automatic budget adjustment suggestions
- Budget vs. actual variance analysis
- Integration with goal-based savings
- Recurring budget templates
- Budget notifications and alerts
- Advanced budget analytics and insights