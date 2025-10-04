# Feature Plan: Currency Support (IDR Focus)

## Overview
Add support for Indonesian Rupiah (IDR) and allow users to configure their preferred currency.

## User Stories
- As an Indonesian user, I want to see all amounts in IDR format (Rp 10.000,00) 
- As a user, I want to be able to set my default currency
- As a user, I want historical transactions to display in my selected currency format

## Requirements
- Set IDR as default currency for Indonesian users
- Format all currency displays according to Indonesian conventions
- Allow currency settings to be saved to user profile
- Convert amounts properly when displaying in different currencies (future enhancement)

## Technical Implementation
- Add currency preference to user settings/profile
- Create currency formatting utility function
- Update all display components to use currency formatting
- Store currency preference in Clerk metadata or app database
- Use Intl.NumberFormat for proper currency formatting

## Currency Formatting Standards for IDR
- Format: Rp 10.000 (for integers) or Rp 10.000,75 (for decimals)
- Thousands separator: "."
- Decimal separator: "," 
- Currency symbol: "Rp " (placed before amount)

## UI/UX Considerations
- Add currency settings in profile page
- Ensure currency formatting is consistent throughout the app
- Handle very large numbers appropriately (Indonesian spending can involve large nominal amounts)

## Acceptance Criteria
- [ ] User can select their preferred currency (currently defaults to IDR)
- [ ] All amounts display in proper IDR format (Rp 10.000,00)
- [ ] Currency settings persist between sessions
- [ ] Historical transactions show in selected currency format
- [ ] New transactions default to selected currency format

## Future Enhancements
- Multi-currency support for users with multiple currencies
- Exchange rate integration for multi-currency accounts