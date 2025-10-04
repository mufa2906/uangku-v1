# Changelog - Uangku

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-10-04

### Fixed
- Fixed nullable type errors in category API routes (`src/app/api/categories/[id]/route.ts`)
  - Added proper null checks before calling `toLowerCase()` method
  - Used type assertions where appropriate after validation
- Fixed where condition type issues in categories API route (`src/app/api/categories/route.ts`)
  - Resolved TypeScript issue with conditional query building
  - Added proper type validation for enum values
- Fixed where condition type issues in transactions API route (`src/app/api/transactions/route.ts`)
  - Implemented functional approach to build query conditions
  - Added proper Date object conversion for date filtering
- Fixed Clerk theme provider to handle undefined theme properly (`src/app/providers.tsx`)
  - Changed from passing undefined theme to conditional appearance props
- Fixed transaction form type to exclude categoryName from submit data (`src/components/transactions/TransactionFormSheet.tsx`)
  - Created proper TransactionSubmitData type excluding computed fields
  - Fixed UI component className prop placement for Select components
- Fixed missing pg type definitions by installing `@types/pg`

### Changed
- Replaced problematic Zod `omit().extend()` patterns with direct object definitions (`src/lib/zod.ts`)
  - Updated CreateTransactionSchema to direct definition
  - Updated CreateCategorySchema to direct definition for consistency
- Updated documentation files to reflect current implementation state
  - Added deployment considerations to PRD.md
  - Updated SystemDesign.md with current architecture
  - Enhanced TechStack.md with build and type safety details
  - Added theme support to UI_Guidelines.md
  - Added type safety section to DataModel.md
- Created this Changelog.md to track changes

### Added
- Added TypeScript type safety enhancements throughout the application
- Added proper error handling for database interactions
- Added documentation for Clerk production deployment limitations (vercel.app domains)

# [Unreleased] - Currency Support Feature

## Added
- Added comprehensive currency support with IDR as default
- Added support for USD, EUR, GBP, SGD, THB, MYR currencies
- Created currency utility library with locale-specific formatting
- Implemented CurrencyContext for managing currency preferences
- Added dedicated Settings page for currency selection
- Enhanced profile page to display current currency
- Added localStorage persistence for currency preferences
- Added success feedback when currency is changed
- Added proper contrast and visibility in both light and dark modes

## Changed
- Updated dashboard and transactions pages to use currency context
- Improved text contrast in settings and profile pages
- Enhanced UI/UX for currency selection with better visual feedback
- Added regional currencies relevant to Southeast Asian market

### Development Process
- Identified and resolved multiple TypeScript compilation errors that prevented Vercel builds
- Ensured all API routes have proper type checking and validation
- Made application compatible with Vercel deployment requirements
- Documented important limitation: vercel.app domains cannot use Clerk production keys