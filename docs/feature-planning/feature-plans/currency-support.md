# Feature Plan: Currency Support (IDR Focus)

## Overview
Add support for Indonesian Rupiah (IDR) and allow users to configure their preferred currency with focus on Southeast Asian markets.

## User Stories
- As an Indonesian user, I want to see all amounts in IDR format (Rp 10.000,00) 
- As a user, I want to be able to set my default currency
- As a user, I want historical transactions to display in my selected currency format
- As a user from Southeast Asia, I want to see relevant regional currencies (SGD, THB, MYR)

## Requirements
- Set IDR as default currency for Indonesian users
- Format all currency displays according to locale-specific conventions
- Allow currency settings to be saved to user profile via localStorage
- Support multiple currencies: IDR, USD, EUR, GBP, SGD, THB, MYR
- Use Intl.NumberFormat for proper currency formatting
- Provide real-time updates when currency is changed
- Show current currency preference in profile page

## Currency Formatting Standards
- **IDR (Indonesian Rupiah)**: Format: Rp 10.000 (for integers) or Rp 10.000,75 (for decimals)
  - Thousands separator: "."
  - Decimal separator: "," 
  - Currency symbol: "Rp " (placed before amount)
- **USD (US Dollar)**: Format: $10,000.00 (for integers) or $10,000.75 (for decimals)
  - Thousands separator: ","
  - Decimal separator: "." 
  - Currency symbol: "$" (placed before amount)
- **EUR (Euro)**: Format: 10.000,00 € (for integers) or 10.000,75 € (for decimals)
  - Thousands separator: "."
  - Decimal separator: "," 
  - Currency symbol: "€" (placed after amount in some locales)
- **GBP (British Pound)**: Format: £10,000.00 (for integers) or £10,000.75 (for decimals)
  - Thousands separator: ","
  - Decimal separator: "." 
  - Currency symbol: "£" (placed before amount)
- **SGD (Singapore Dollar)**: Format: S$10,000.00 (for integers) or S$10,000.75 (for decimals)
  - Thousands separator: ","
  - Decimal separator: "." 
  - Currency symbol: "S$" (placed before amount)
- **THB (Thai Baht)**: Format: ฿10,000.00 (for integers) or ฿10,000.75 (for decimals)
  - Thousands separator: ","
  - Decimal separator: "." 
  - Currency symbol: "฿" (placed before amount)
- **MYR (Malaysian Ringgit)**: Format: RM10,000.00 (for integers) or RM10,000.75 (for decimals)
  - Thousands separator: ","
  - Decimal separator: "." 
  - Currency symbol: "RM" (placed before amount)

## UI/UX Considerations
- Add currency settings in dedicated Settings page accessible from profile
- Ensure currency formatting is consistent throughout the app
- Handle very large numbers appropriately (Indonesian spending can involve large nominal amounts)
- Provide clear visual feedback when currency is changed
- Display current currency selection in profile page
- Support both light and dark mode text contrast
- Add success confirmation when currency is changed

## Acceptance Criteria
- [x] User can select their preferred currency from a list of supported options
- [x] All amounts display in selected currency format (IDR defaults to Rp 10.000,00)
- [x] Currency settings persist between sessions using localStorage
- [x] Historical transactions show in selected currency format
- [x] New transactions default to selected currency format
- [x] Supported currencies: IDR, USD, EUR, GBP, SGD, THB, MYR
- [x] Real-time updates when currency is changed
- [x] Current currency preference displayed in profile page
- [x] Settings page with clear currency selection UI
- [x] Success feedback when currency is changed
- [x] Proper contrast and visibility in both light and dark modes

## Implementation Details
- Created currency utility library with configurations for each supported currency
- Implemented CurrencyContext for managing currency preferences across the app
- Updated dashboard and transactions pages to use currency context
- Created dedicated settings page for currency selection
- Added currency preference to profile page with link to settings
- Implemented persistent storage using localStorage
- Added regional currencies relevant to Southeast Asian market