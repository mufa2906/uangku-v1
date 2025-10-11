# Uangku - Changelog

## v1.5.0 - PWA Implementation & Enhanced Notifications (November 2025)

### Added
- **Progressive Web App (PWA) Support**: Installable app experience with native-like performance
- **Push Notifications**: Real-time bill reminders and budget warnings
- **Offline Transaction Entry**: Create transactions even when offline
- **Background Sync**: Seamless data synchronization when connectivity is restored
- **PWA Settings Panel**: User-controlled PWA feature management
- **Install Prompt**: Contextual app installation prompts
- **Service Worker**: Caching and offline functionality
- **Web App Manifest**: Proper PWA metadata and icons

### Changed
- **Enhanced Service Worker**: Improved caching strategies and offline handling
- **Notification System**: Upgraded to web push notifications
- **UI Components**: Added PWA-specific indicators and controls
- **Settings Page**: Integrated PWA management interface
- **Transaction Flow**: Enhanced offline transaction handling

### Fixed
- **PWA Installation Issues**: Resolved icon and manifest configuration problems
- **Notification Delivery**: Improved reliability of push notifications
- **Offline Sync**: Fixed data synchronization conflicts
- **Service Worker Registration**: Enhanced reliability and error handling

## v1.4.0 - Enhanced User Experience & AI Improvements (October 2025)

### Added
- **Real-Time Form Validation**: Client-side validation with immediate feedback as users type
- **Form Clearing After Success**: Transaction form automatically clears after successful submission
- **Period-Based Transaction Grouping**: Group transactions by daily, weekly, or monthly periods with total calculation
- **Transaction Form Field Reordering**: Improved field sequence for logical transaction entry flow
- **AI Parsing Enhancements**: Better accuracy for Indonesian transaction patterns with preserved description words
- **Dropdown Period Selection**: Improved UI with dropdown for period view selection
- **Enhanced Transaction Sorting**: Proper sorting using createdAt timestamp for more precise ordering
- **Improved AI Amount Extraction**: Fixed partial number detection for more accurate amount parsing

### Changed
- **Transaction Card Design**: Simplified cards to show only essential information (category, notes, price)
- **Period View Controls**: Replaced button row with dropdown selection for better UX
- **Transaction Sorting Logic**: Now uses createdAt instead of date for more precise ordering
- **AI Parsing Flow**: Enhanced pattern detection that preserves food-related words in descriptions (e.g., "nasi" in "makan nasi gudeg")
- **Form Validation**: Added comprehensive validation with real-time feedback and error messages
- **Modal Scrolling**: Fixed AI input overflow issues with proper scrolling behavior
- **Dropdown UI**: Improved period selection with select dropdown instead of multiple buttons

### Fixed
- **AI Parsing Issues**: Fixed "makan sop sapi 23000" to extract full amount (23000) instead of partial (230)
- **Description Preservation**: Fixed "makan nasi gudeg" to preserve "nasi gudeg" in description instead of just "gudeg"
- **Transaction Sorting**: Fixed transaction ordering to properly show newest first within groups
- **Amount In Description**: Fixed issue where extracted amounts remained in transaction descriptions
- **PWA Icon Loading**: Verified proper icon placement and referencing in manifest
- **Form Error Handling**: Added proper validation error display and form state management

## v1.3.0 - Comprehensive Financial Management (October 2025)

### Added
- **Bill Reminder System**: Track recurring and one-time bills with automated notifications
- **AI-Powered Transaction Entry**: Natural language processing for transaction input (e.g., "ate nasi padang 25000")
- **Transaction Learning System**: AI improves suggestions based on user patterns over time
- **Enhanced Budget Tracking**: Proper budget-wallet allocation with allocatedAmount/remainingAmount tracking
- **Upcoming Bills Dashboard**: Visual display of bills due on dashboard with color-coded status
- **Budget-Wallet Mismatch Prevention**: Auto-handling of wallet-budget selection conflicts with user feedback
- **Bill Recurrence Engine**: Automatic next due date calculation for recurring bills
- **Payment Status Tracking**: Mark bills as paid with payment date tracking

### Changed
- **Budget Architecture**: Updated to include allocatedAmount and remainingAmount for precise tracking
- **Transaction Logic**: Fixed double-deduction issue - transactions affect either wallet OR budget (not both)
- **UI/UX Improvements**: Enhanced transaction form with AI input toggle and improved wallet-budget coordination
- **Dashboard Enhancements**: Added upcoming bills section with due date indicators
- **Notification System**: Implemented bill reminder notifications with configurable timing
- **API Validation**: Enhanced budget-wallet validation to prevent mismatch errors
- **Form Workflow**: Improved transaction form with auto-clearing of budgets when wallets change

### Fixed
- **Transaction-Budget Double Deduction**: Fixed issue where money was deducted from both wallet and budget simultaneously
- **Wallet-Budget Mismatch**: Resolved validation errors when changing wallet selection after budget choice
- **Balance Calculation Accuracy**: Ensured proper financial tracking with single money accounting
- **Recurrence Pattern Calculations**: Fixed bill recurrence calculations for various patterns

---

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