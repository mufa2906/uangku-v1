# Uangku — Product Requirements Document (PRD)

## 1. Vision
A simple, mobile-first personal finance tracking application for Indonesian users to easily manage money across multiple wallets, track expenses, and achieve financial goals with powerful yet intuitive budgeting tools.

## 2. Target Users
- **Primary**: Indonesian millennials and Gen Z (ages 18-35)
- **Students and young professionals** who want to track expenses
- **Freelancers** managing irregular income streams
- **Anyone** seeking a simple, ad-free finance management solution

## 3. Core Problems Solved
- **Complexity**: Many finance apps are overwhelming with too many features
- **Lack of localization**: International apps don't handle IDR well
- **Multiple money sources**: Users need to track cash, bank, e-wallets, credit cards together
- **Budgeting confusion**: Traditional budgets are too rigid for flexible spending

## 4. Solution Overview
### Wallet-Centric Approach
- Track money across all accounts (wallets) in one place
- Support cash, bank accounts, e-wallets, credit cards, and savings

### Flexible Budgeting
- Category-linked budgets for regular expenses (food, transport)
- Custom named budgets for specific goals (vacation, house down payment)
- Support for 50/30/20, zero-based, and envelope budgeting methods

### Mobile-First Experience
- Quick transaction entry in under 10 seconds
- Intuitive bottom navigation for core features
- Visual indicators for budget status

## 5. Core Features
### Essential Features
- **Multi-Wallet Management**: Track balances across cash, bank, e-wallets, credit cards
- **Transaction Tracking**: Quick add with categories, notes, and dates
- **Flexible Budgeting**: Category and custom budget options
- **Dashboard**: Overview of balances, income, expenses, and trends
- **Authentication**: Secure login with Clerk
- **Currency Support**: IDR-focused with support for other Southeast Asian currencies

### Advanced Features
- **Insights**: Weekly trend analysis and spending patterns
- **Goal Tracking**: Specific financial objectives with progress indicators
- **AI-Powered Entry**: Natural language transaction input (planned)
- **Export & Reports**: Financial summaries and export options (planned)

## 6. User Experience Requirements
- **Fast Input**: < 10 seconds to add a transaction
- **Intuitive Navigation**: Bottom navigation for core features
- **Visual Feedback**: Color-coded budget status (green/yellow/red)
- **Mobile-Optimized**: Touch-friendly interface optimized for mobile devices

## 7. Technical Requirements
- **Type Safety**: Full TypeScript coverage with strict mode
- **Secure**: Multi-tenant with user data isolation
- **Responsive**: Mobile-first design with responsive layout
- **Performance**: Fast loading times (< 3s on 3G)

## 8. Success Metrics
- **Adoption**: D1 Retention ≥ 50%
- **Engagement**: Average of 3 transactions per week per active user
- **Usability**: Transaction entry time < 10 seconds
- **Reliability**: ≥ 99.5% crash-free sessions

## 9. Out of Scope
- Bank account synchronization
- OCR receipt scanning (initially)
- Investment tracking (long-term)
- Advanced reporting (initially)
- Multi-user household features (initially)

## 10. Go-to-Market Considerations
- **Localization**: Full support for Indonesian language and cultural finance habits
- **Currency Focus**: Primary focus on IDR with regional currency support
- **Privacy**: Clear privacy-first messaging (no data sharing)
- **Simplicity**: Emphasize ease of use over feature complexity