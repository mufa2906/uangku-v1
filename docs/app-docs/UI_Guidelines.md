# Uangku UI/UX Guidelines

## Core Principles
- **Mobile-First**: Optimize for mobile devices (375–430px width)
- **Speed**: Transaction entry in under 10 seconds
- **Intuitive**: Familiar patterns, minimal cognitive load
- **Visual**: Clear indicators for financial status

## Design System

### Color Palette
- **Primary**: #3B82F6 (Blue) - Actions and important information
- **Success**: #10B981 (Green) - Positive financial status
- **Warning**: #F59E0B (Amber) - Budget approaching limits
- **Danger**: #EF4444 (Red) - Over budget situations
- **Neutral**: #F3F4F6 (Light Gray) - Background and subtle elements

### Typography
- **Font**: Inter (readable at all sizes)
- **Size**: Minimum 14px for readability
- **Hierarchy**: Clear visual hierarchy with appropriate weights

### Spacing & Layout
- **Radius**: 1rem (2xl) for rounded elements
- **Elevation**: Subtle shadows (shadow-sm) for cards and Floating Action Button
- **Touch Targets**: Minimum 44px for accessibility

## Core Components

### Navigation
- **Bottom Navigation**: 6 primary tabs (Dashboard, Transactions, Wallets, Budgets, Goals, Profile)
- **Floating Action Button**: Always visible for quick transaction entry
- **Progressive Disclosure**: Minimal info upfront, more detail on demand

### Transaction Entry
- **Quick Form**: Max 5 fields for fast input
- **Smart Defaults**: Pre-populate date (today), last used type/category
- **Category Selection**: Intuitive category picker with icons

### Dashboard Elements
- **Summary Cards**: Income, expense, net, total balance
- **Charts**: 7-day bar chart for trend visualization
- **Recent Transactions**: Last 5 transactions for quick review

## Responsive Approach
- Single-column layout optimized for mobile
- Touch-friendly button sizes
- Clear visual hierarchy
- Fast loading with skeleton screens

## Accessibility Standards
- AA contrast ratios
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support