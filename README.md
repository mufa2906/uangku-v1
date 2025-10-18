# Uangku - Your Personal Finance Companion

## Financial Control, Simplified

**Uangku** is a lightweight, mobile-first personal finance tracking application designed specifically for Indonesian users who want to take control of their finances without the complexity of traditional finance apps. With intuitive design, comprehensive features, and localized functionality, Uangku makes personal finance management accessible and effortless.

## Key Features

### 🏦 Multi-Wallet Management
- **Track multiple money sources**: Cash, bank accounts, e-wallets, credit cards, and savings
- **Real-time balance updates**: Automatic balance adjustments when transactions occur
- **Currency support**: Full support for IDR and other Southeast Asian currencies
- **Visual wallet overview**: See all your money in one place

### 💳 Smart Transaction Tracking
- **Quick entry**: Add transactions in under 5 seconds with smart defaults
- **Categorization**: Automatic and manual categorization of income and expenses
- **Budget integration**: Transactions automatically count toward your budgets
- **Note-taking**: Add details to remember what each transaction was for

### 📊 Comprehensive Budgeting
- **Flexible budget types**: 
  - Category-linked budgets (e.g., "Food & Dining")
  - Custom named budgets (e.g., "Bali Trip 2025")
  - Hybrid approach combining both methods
- **Multiple methodologies**: Support for 50/30/20, zero-based, and envelope budgeting
- **Progress visualization**: Clear progress bars showing budget usage
- **Period options**: Weekly, monthly, or yearly budget periods

### 🎯 Financial Goal Tracking
- **Progress monitoring**: Track your savings goals with visual progress indicators
- **Deadline setting**: Set target dates for achieving your financial objectives
- **Flexible naming**: Create goals for any financial objective (emergency fund, vacation, etc.)

### 🔌 Enhanced Offline Functionality
- **Robust storage**: IndexedDB-based storage with localStorage fallback for maximum reliability
- **Seamless sync**: Automatic synchronization when connectivity is restored
- **Persistent data**: Transactions saved locally until synced to server
- **Migration system**: Automatic migration from localStorage to IndexedDB for existing users

### ♿ Enhanced Accessibility Features
- **High contrast mode**: Improved contrast ratios for better readability in bright conditions
- **Adjustable font sizes**: Small, normal, large, and extra-large text options
- **Reduced motion**: Disable animations for users sensitive to motion
- **Keyboard navigation**: Enhanced focus indicators for keyboard-only users
- **Screen reader support**: Proper semantic HTML and ARIA attributes
- **Accessibility settings page**: Dedicated page for configuring accessibility preferences

### 🔐 Secure Authentication
- **Self-hosted auth**: Migrated from third-party Clerk to BetterAuth for reduced dependencies
- **Password hashing**: Secure password storage with industry-standard encryption
- **Session management**: Persistent sessions with configurable expiration
- **Social login**: Google OAuth integration for easy sign-in
- **Goal creation**: Set specific financial goals like "Emergency Fund" or "New Car"
- **Progress tracking**: Monitor current amount vs. target amount
- **Status management**: Goals can be active, paused, completed, or cancelled
- **Target dates**: Set completion deadlines for your financial objectives
- **Linked wallets**: Connect goals to specific wallets for automated contributions
- **Goal overview**: Visual dashboard showing progress toward all financial goals

### 📈 Intelligent Insights
- **Weekly trend analysis**: Track spending patterns over time
- **Visual charts**: Easy-to-understand bar charts showing income vs expense
- **Spending summaries**: Quick overview of your financial health
- **Balance tracking**: Real-time total balance across all wallets
- **Data export**: Export your transactions to various formats for external analysis

### 🔐 Secure & Private
- **Industry-standard authentication**: Powered by BetterAuth for secure login
- **Self-hosted authentication**: No dependency on third-party authentication services
- **Personal data protection**: Your financial data stays private and secure
- **No sharing**: We don't share your data with third parties

### 💬 Enhanced User Experience
- **Toast notifications**: Real-time feedback for user actions
- **Intuitive workflows**: Streamlined transaction management with smart defaults
- **Automatic budget/wallet management**: Smart system prevents invalid associations

## Why Choose Uangku?

### 🇮🇩 Indonesian-Focused Design
- **IDR-optimized**: Currency formatting specifically designed for Indonesian Rupiah
- **Local financial habits**: Features that align with Indonesian spending and saving patterns
- **Regional currencies**: Support for SGD, THB, MYR for travelers and digital nomads

### ⚡ Lightning Fast
- **Mobile-first architecture**: Optimized for mobile devices and small screens
- **Quick actions**: Add transactions with just a few taps
- **Instant updates**: Real-time balance and budget updates
- **Offline-ready**: Essential functionality works even without internet

### 🎯 Goal-Oriented
- **Budget variety**: Plan for anything from daily expenses to long-term goals
- **Progress tracking**: Visual indicators to keep you motivated
- **Goal-focused**: Move money toward what matters most to you

### 👤 User Profile & Management
- **Account information**: View your profile details and account creation date
- **Currency settings**: Manage your preferred currency display
- **Secure logout**: Easy and secure sign-out functionality
- **Account management**: Access to settings and preferences

### 🎨 Beautiful & Intuitive
- **Clean design**: Uncluttered interface that reduces decision fatigue
- **Visual feedback**: Clear indicators for budget status (green/yellow/red)
- **Easy navigation**: Simple bottom navigation for core features
- **Customizable**: Personalize categories and budget names

## Core Functionality

### Dashboard Overview
- **Total balance**: Real-time sum of all wallet balances
- **Income & Expense summary**: Clear breakdown of your financial activity
- **Net calculation**: Income minus expenses for quick health check
- **Weekly trends**: Visual charts showing your spending patterns

### Transaction Management
- **Quick add**: Floating action button for instant transaction entry
- **Detailed editing**: Modify dates, amounts, categories, and notes
- **Wallet selection**: Choose which wallet the transaction comes from/goes to
- **Budget assignment**: Link transactions to specific budgets

### Wallet System
- **Multiple account types**: Cash, bank, credit card, e-wallet, savings
- **Balance tracking**: Real-time balance updates
- **Account overview**: See balances across all money sources

### Budget Tracking
- **Progress indicators**: Visual progress bars showing budget usage
- **Spending vs. Budget**: Clear comparison of actual vs. planned spending
- **Remaining amounts**: How much is left in each budget
- **Category and custom budgets**: Flexibility to budget however you prefer

## Getting Started

1. **Sign up** with your email
2. **Create your wallets** (cash, bank accounts, etc.)
3. **Set up budgets** for your spending categories
4. **Start tracking** by adding your first transaction

## For Developers

Uangku is built with cutting-edge technology:

- **Frontend**: Next.js (App Router) with TypeScript
- **Styling**: TailwindCSS and shadcn/ui for beautiful components
- **Authentication**: BetterAuth for secure self-hosted user management
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **Charts**: Recharts for data visualization
- **Deployment**: Vercel for fast global delivery

## Technical Improvements

### Enhanced Accessibility Features
- **High Contrast Mode**: Improved contrast ratios for better readability in bright outdoor conditions
- **Adjustable Font Sizes**: Four font size options (small, normal, large, extra-large) for users with visual impairments
- **Reduced Motion**: Option to disable animations for users with vestibular disorders
- **Keyboard Navigation**: Enhanced focus indicators and keyboard shortcuts for keyboard-only users
- **Screen Reader Support**: Proper semantic HTML and ARIA attributes for assistive technology compatibility
- **Accessibility Settings Page**: Dedicated interface for users to customize their accessibility preferences

### Improved Offline Functionality
- **IndexedDB Storage**: Robust client-side storage using IndexedDB as primary storage with localStorage fallback
- **Automatic Sync**: Seamless synchronization of offline transactions when connectivity is restored
- **Persistent Data**: Transactions saved locally until successfully synced to server
- **Storage Migration**: Automatic migration from localStorage to IndexedDB for existing users
- **Error Handling**: Graceful degradation with comprehensive error handling for network issues

### Progressive Web App (PWA) Features
- **Installable**: Native-like installation experience on mobile and desktop devices
- **Push Notifications**: Real-time notifications for bill reminders and budget warnings
- **Offline Transaction Entry**: Create transactions even when offline with background sync
- **Service Worker**: Intelligent caching strategies for fast loading and offline access
- **Web App Manifest**: Proper metadata for installable app experience with custom icons

### Authentication System
- **Self-Hosted Solution**: Migration from third-party Clerk to BetterAuth for reduced dependencies
- **Secure Sessions**: Industry-standard password hashing and session management
- **Social Login**: Google OAuth integration for convenient sign-in
- **Account Linking**: Seamless linking of multiple authentication methods to single account

## Privacy & Security

- Your financial data is never shared with third parties
- End-to-end encryption for sensitive information
- Regular security updates and monitoring
- Compliance with data protection regulations

## Mission

We believe that financial wellness should be accessible to everyone. Uangku removes the intimidation from personal finance management, making it easy for anyone to track their money, stick to budgets, and achieve their financial goals.

---

*Ready to take control of your finances? Download Uangku today and experience financial management that works the way you do.*

**[Get Started Now] | [Learn More] | [Contact Us]**

## Support

Need help? Our team is ready to assist you:
- Email: support@uangku.com
- In-app chat support
- Comprehensive help documentation

*Uangku - Your Path to Financial Peace of Mind*