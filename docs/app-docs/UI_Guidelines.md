# Uangku UI/UX Guidelines

## Core Principles
- **Mobile-First**: Optimize for mobile devices (375–430px width)
- **Speed**: Transaction entry in under 10 seconds
- **Intuitive**: Familiar patterns, minimal cognitive load
- **Visual**: Clear indicators for financial status
- **Consistent**: Unified design language across all features
- **Accessible**: Inclusive design for all users

## Design System

### Color Palette
- **Primary**: #3B82F6 (Blue) - Actions and important information
- **Success**: #10B981 (Green) - Positive financial status, completed goals, paid bills
- **Warning**: #F59E0B (Amber) - Budget approaching limits, upcoming bills
- **Danger**: #EF4444 (Red) - Over budget situations, overdue bills
- **Income**: #059669 (Dark Green) - Income-specific elements
- **Expense**: #DC2626 (Dark Red) - Expense-specific elements
- **Neutral**: #F3F4F6 (Light Gray) - Background and subtle elements
- **Text/Primary**: #1F2937 - Primary text color
- **Text/Secondary**: #6B7280 - Secondary text color

### Typography
- **Font**: Inter (readable at all sizes) - loaded from Google Fonts
- **Size**: Minimum 14px for readability, 16px for body text
- **Hierarchy**: Clear visual hierarchy with appropriate weights (400/500/600/700)
- **Line Height**: 1.5 for body text for better readability
- **Heading Scales**: Consistent ratios (1.2x per level) for visual hierarchy

### Spacing & Layout
- **Radius**: 1rem (2xl) for rounded elements
- **Elevation**: Subtle shadows (shadow-sm) for cards and Floating Action Button
- **Touch Targets**: Minimum 44px for accessibility compliance
- **Grid System**: Responsive grid with 16px base unit
- **Padding/Margins**: Consistent spacing using 4px grid (4, 8, 12, 16, 24, 32px)

## Core Components

### Navigation
- **Bottom Navigation**: 5 primary tabs (Dashboard, Transactions, Wallets, Budgets, Goals) with Profile accessed through user menu
- **Floating Action Button**: Always visible with Plus icon for quick transaction entry
- **Progressive Disclosure**: Minimal info upfront, more detail on demand
- **App Shells**: Consistent layout patterns across all pages
- **Header Navigation**: Clean header with wallet balance and user profile

### Transaction Entry
- **Quick Form**: Sheet modal with 6-7 fields (type, wallet, amount, budget, category, date, note)
- **Smart Defaults**: Pre-populate date (today), last used type, wallet selection
- **Category Selection**: Intuitive category picker with income/expense filtering
- **Budget Integration**: Auto-select wallet when budget is chosen
- **Wallet-Budget Coordination**: Automatic handling of wallet-budget mismatch with user feedback
- **AI Transaction Input**: Toggle button to show AI-powered text input for natural language transactions
- **Validation Feedback**: Clear error messages and field validation

### Dashboard Elements
- **Summary Cards**: Income, expense, net, total balance with clear visual distinction
- **Charts**: 7-day bar chart for trend visualization with income/expense differentiation
- **Recent Transactions**: Last 5 transactions for quick review with categorization
- **Budget Summary**: Visual progress indicators for active budgets with color coding
- **Upcoming Bills**: Bill list with due date indicators and overdue warnings
- **Wallet Balance Card**: Prominent total balance display across all wallets

### Wallet Management
- **Wallet Types**: Visual icons for each wallet type (cash, bank, credit card, e-wallet, savings)
- **Balance Display**: Clear balance and currency information with formatting
- **Wallet List**: Cards with name, type, balance, and currency for quick scanning
- **Quick Actions**: Add funds or withdraw with simple interaction patterns

### Budget Tracking
- **Progress Bars**: Visual representation of budget usage with color indicators
- **Time Periods**: Clear labels for budget start and end dates
- **Type Differentiation**: Visual distinction between category-linked and custom named budgets
- **Percentage Indicators**: Clear percentage completion for budget progress

### Goal Tracking
- **Progress Visualization**: Progress bars with percentage completion
- **Status Indicators**: Color-coded status badges (active, paused, completed, cancelled)
- **Timeline Display**: Clear target date and progress toward goal
- **Current vs Target**: Side-by-side comparison of current amount vs target amount

### Bill Reminders
- **Due Date Indicators**: Color-coded due date status (green for upcoming, red for overdue)
- **Recurrence Display**: Clear recurrence pattern information
- **Payment Status**: Visual indicators for paid/unpaid status
- **Notification Settings**: Toggle switches for notification preferences

## Notification System
- **Toast Notifications**: Non-intrusive feedback messages with auto-dismiss
- **Success Messages**: Green toasts for successful operations
- **Error Messages**: Red toasts with actionable information
- **Warning Messages**: Yellow toasts for important information
- **Duration**: Appropriate display duration (4-5 seconds for most messages)
- **Positioning**: Top-center positioning for non-interference with navigation

## Form Components
- **Sheet Modals**: Consistent modal design for forms with proper focus management
- **Select Components**: Custom styled select dropdowns with clear options
- **Input Fields**: Consistent styling with proper validation states
- **Date Pickers**: Native date input for consistency across devices
- **Number Inputs**: Proper decimal formatting and validation for financial amounts
- **Action Buttons**: Clear primary and secondary button styling with appropriate sizing

## Responsive Approach
- Single-column layout optimized for mobile
- Touch-friendly button sizes and spacing
- Clear visual hierarchy that works at all screen sizes
- Adaptive layouts for different screen widths
- Fast loading with skeleton screens for content areas
- Consistent navigation patterns across all breakpoints

## Accessibility Standards
- AA contrast ratios for all text elements
- Semantic HTML elements for proper screen reader navigation
- ARIA labels where needed for interactive elements
- Keyboard navigation support for all interactive components
- Focus management for modals and forms
- Screen reader compatibility for data visualization
- Alt text for all meaningful images and icons

## User Feedback & Interactions
- **Loading States**: Clear loading indicators for data fetching
- **Empty States**: Helpful messages when no data is available
- **Error Handling**: Clear, actionable error messages
- **Confirmation Dialogs**: For destructive actions like deletion
- **Success Feedback**: Visual confirmation of completed actions
- **Progress Indicators**: For operations that take time to complete