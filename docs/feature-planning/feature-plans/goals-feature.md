# Goals Tracking

## Status
IMPLEMENTED - [Date] - Successfully implemented financial goal tracking functionality

## Overview
Successfully implemented financial goal tracking functionality allowing users to set, track, and achieve specific financial objectives. Users can create goals with target amounts and dates, link them to wallets for automatic tracking, and monitor progress with visual indicators. The feature is currently deployed and available in the application.

## User Stories (if applicable)
- As a user, I want to create financial goals with target amounts and dates
- As a user, I want to track progress toward my financial goals
- As a user, I want to link goals to specific wallets for automatic progress tracking
- As a user, I want to manage my goals with different status options (active, paused, completed, cancelled)
- As a user, I want to see progress visually with percentage completion indicators
- As a user, I want to set goal descriptions to remember their purpose

## Requirements (if applicable)
- Financial goal creation with name, description, target amount, currency, and target date
- Goal progress tracking with current vs. target amount visualization
- Wallet linking for automatic progress tracking
- Goal status management (active, paused, completed, cancelled)
- Visual progress indicators with percentage completion
- Goal management page for comprehensive goal oversight
- Currency support for goal amounts
- Integration with dashboard for quick access to goal progress

## Technical Implementation
- Added goals table to database with proper relationships
- Created API routes for goal CRUD operations (/api/goals)
- Implemented goal status management with enum values
- Updated dashboard to show goal progress and status
- Created dedicated goals page for comprehensive goal management
- Integrated with existing CurrencyContext for proper currency display
- Implemented proper data relationships with wallets and users
- Added Zod validation schemas for goal creation and updates

## Database Schema (if applicable)
```ts
// In src/lib/schema.ts
export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(), // References users.id (Clerk)
  name: varchar("name", { length: 200 }).notNull(), // Goal name like "Emergency Fund", "New Car"
  description: text("description"), // Optional description
  targetAmount: numeric("target_amount", { precision: 14, scale: 2 }).notNull(), // Goal target amount
  currentAmount: numeric("current_amount", { precision: 14, scale: 2 }).notNull().default('0'), // Current progress
  currency: varchar("currency", { length: 3 }).notNull().default('IDR'), // Currency code
  targetDate: date("target_date"), // Optional target completion date
  status: goalStatus("status").notNull().default('active'), // Goal status enum
  walletId: uuid("wallet_id").references(() => wallets.id, { onDelete: "set null" }), // Optional linked wallet
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
```

## API Endpoints (if applicable)
- `GET /api/goals` - Get all user goals with optional status filtering
- `POST /api/goals` - Create new goal with validation
- `PUT /api/goals/:id` - Update existing goal (including status changes)
- `DELETE /api/goals/:id` - Deactivate (not delete) goal
- Integration with transaction system to potentially update goal progress

## Implementation Status
- [x] Users can create goals with target amounts and dates
- [x] Goal progress is calculated and displayed visually on dashboard
- [x] Users can link goals to specific wallets for automatic tracking
- [x] Comprehensive status management (active, paused, completed, cancelled)
- [x] Goal information displays in user's preferred currency
- [x] Users can create, update, and manage goals
- [x] Visual progress indicators with percentage completion
- [x] Dedicated goals management page
- [x] Integration with dashboard for quick access
- [x] Goal descriptions to remember the purpose of each goal

## UI/UX Implementation (if applicable)
- Dedicated goals page for comprehensive goal management
- Visual progress bars showing goal completion percentage
- Clear status indicators (active, paused, completed, cancelled)
- Goal cards showing target vs. current amounts
- Intuitive form with clear guidance for goal creation
- Wallet selection for automatic progress tracking
- Date pickers for target dates
- Currency formatting according to user preferences

## Type Definitions (if applicable)
```ts
// In src/types/index.ts
export interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  targetAmount: string; // Using string to match the decimal type from the database
  currentAmount: string; // Current progress amount
  currency: string;
  targetDate: string | null; // ISO date format
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  walletId: string | null; // Optional linked wallet
  isActive: boolean;
  createdAt: string; // ISO string format
}
```

## Current Implementation Details (if applicable)
- Goal progress tracking with currentAmount vs targetAmount
- Wallet linking enables automatic progress updates
- Status management for goal lifecycle control
- CurrencyContext integration for proper currency formatting
- Responsive design for mobile and desktop usage
- Proper form validation and error handling

## Known Issues (if applicable)
N/A

## Future Enhancements
- Automatic progress updates based on transaction patterns
- Goal sharing for family/household goals
- Goal recommendations based on spending patterns
- Goal forecasting and timeline adjustments
- Recurring goals for regular saving objectives
- Goal notifications when approaching target dates
- Integration with investment tracking
- Advanced goal analytics and insights

## References & Resources
N/A