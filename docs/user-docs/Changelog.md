# Uangku - Changelog

## v1.2.0 - Goals & Enhanced User Experience (October 2025)

### Added
- **Financial Goal Tracking**: Create, manage, and track progress toward specific financial goals
- **Goal Status Management**: Goals can be active, paused, completed, or cancelled
- **Target Amounts & Dates**: Set specific targets and deadlines for your financial objectives
- **Goal-to-Wallet Linking**: Connect goals to specific wallets for automated tracking
- **Export Functionality**: Export transactions to various formats for external analysis
- **Toast Notifications**: Real-time user feedback for actions and system messages
- **Improved Transaction Workflow**: Enhanced wallet/budget selection with automatic association
- **Goal Management Page**: Dedicated UI for creating and managing financial goals

### Changed
- **Navigation Structure**: Added 'Goals' section and restored 'Profile' in bottom navigation
- **Transaction Form Logic**: Improved wallet-budget association with auto-clearing and messaging
- **User Feedback System**: Implemented toast notifications for better UX
- **Schema Definition**: Added goals table with status tracking and target management
- **Validation Schemas**: Added Zod schemas for goal creation and updates
- **Type Definitions**: Added Goal interface with all required properties

---

## v1.1.0 - Wallet-Centric Finance Management (October 2025)

### Added
- **Multi-Wallet System**: Track money across cash, bank accounts, e-wallets, credit cards, and savings
- **Wallet Balance Management**: Real-time balance updates when transactions occur
- **Wallet Selection in Transactions**: Choose which wallet each transaction affects
- **Dashboard Wallet Summary**: Total balance across all wallets displayed prominently
- **Wallet Management Page**: Create, edit, and manage all your wallets in one place
- **Wallet Type Icons**: Visual indicators for different wallet types (cash, bank, card, etc.)

### Changed
- **Transaction Flow**: Now requires wallet selection when adding transactions
- **Budget Tracking**: Transactions still link to budgets but now affect wallet balances
- **Dashboard Layout**: Added total wallet balance card
- **Data Model**: Transactions now link to wallets instead of just categories/budgets
- **API Endpoints**: Updated to support wallet references and balance calculations

### Fixed
- **Financial Tracking**: Now properly shows where money comes from/goes to
- **Balance Accuracy**: Real-time balance updates for accurate financial picture
- **Transaction Context**: Clear indication of which wallet each transaction affects
- **Budget vs Reality**: Budgets now reflect actual money spent from specific wallets

---

## v1.0.0 - Budgeting & Currency Support (October 2025)

### Added
- **Flexible Budgeting Tools**: Support for both category-linked and custom named budgets
- **50/30/20 Methodology**: Budgeting approach for balanced finances
- **Zero-Based Budgeting**: Plan every dollar of income
- **Envelope Method**: Separate budgets for different spending categories
- **Multi-Currency Support**: Full support for IDR, USD, EUR, GBP, SGD, THB, MYR
- **Currency Context**: Global currency preference management
- **Currency Formatting**: Proper locale-specific formatting for each supported currency

### Changed
- **Budget Architecture**: Enhanced to support both traditional and custom budgets
- **UI Components**: Updated with budget visualization and currency selection
- **Type Safety**: Enhanced with nullable field support in TypeScript definitions
- **API Routes**: Updated to handle flexible budget parameters

### Fixed
- **Nullable Field Issues**: Resolved TypeScript compilation errors
- **Budget Summary Calculations**: Fixed handling of nullable category IDs
- **Date Parsing**: Resolved issues in budget API routes
- **Form State Management**: Fixed handling of new optional fields

---

## v0.1.0 - Foundation Release (September 2025)

### Added
- **User Authentication**: Secure login with Clerk
- **Transaction Management**: Add, edit, delete income and expense transactions
- **Category System**: Organize transactions by customizable categories
- **Dashboard**: Overview of financial status with charts
- **Budget Tracking**: Basic budget monitoring and visualization
- **Responsive Design**: Mobile-first interface optimized for smaller screens
- **Type Safety**: Full TypeScript coverage with strict mode compliance
- **API Structure**: RESTful endpoints with Zod validation