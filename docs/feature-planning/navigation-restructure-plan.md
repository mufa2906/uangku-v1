# Uangku Navigation Restructuring Plan

## Overview
This document outlines the planned navigation restructuring for Uangku to improve mobile user experience by reducing the number of bottom navigation items from 6 to 5.

## Current Navigation Structure
- **Dashboard** - Financial overview
- **Transactions** - Add/edit financial transactions
- **Wallets** - Manage different money sources
- **Budgets** - Track spending limits
- **Goals** - Track financial objectives (new feature)
- **Profile** - Account management and logout

**Issue**: 6 navigation items exceeds mobile UX best practices (recommended maximum: 5 items)

## Proposed Navigation Structure
- **Dashboard** - Financial overview
- **Transactions** - Add/edit financial transactions
- **Wallets** - Manage different money sources
- **Goals** - Track financial objectives (new feature)
- **Settings** - Consolidated configuration section

## Settings Section Contents
The Settings section will consolidate the following features:
- **Profile Management** - User account details, logout functionality
- **Categories** - Create, edit, delete transaction categories
- **Budgets** - Create, edit, track spending limits
- **App Preferences** - Language, theme, notification settings
- **Currency Settings** - Default currency, display preferences
- **Help & Support** - App documentation, contact support

## User Experience Benefits
1. **Improved Touch Targets** - Larger icons/text with 5 items vs 6
2. **Better Visual Clarity** - Less cramped navigation
3. **Accessibility Compliance** - Better meet minimum touch target requirements
4. **Logical Grouping** - Configuration features grouped together
5. **Maintained Functionality** - All features remain accessible

## Implementation Steps

### 1. Navigation Component Update
- Modify `AppBottomNav.tsx` to show 5 items instead of 6
- Update navigation logic and icons

### 2. Settings Page Creation
- Create `src/app/settings/page.tsx` as the new main settings hub
- Implement sub-sections for each feature area

### 3. Content Migration
- Move Profile functionality to Settings
- Move Categories management to Settings
- Move Budgets management to Settings (or keep some in dashboard)
- Update all internal links and routing

### 4. Documentation Updates
- Update README.md navigation description
- Update UI_Guidelines.md
- Update SystemDesign.md
- Update Changelog.md

## Technical Considerations

### Routing Changes
- `/profile` → `/settings/profile`
- `/categories` → `/settings/categories`
- `/budgets` → `/settings/budgets`

### Backwards Compatibility
- Implement redirects for old URLs to prevent broken links
- Update all internal navigation references

### Data Flow Impact
- No changes to API routes
- No changes to data models
- Only UI routing and navigation flow changes

## User Impact Assessment

### Positive Impacts
- Improved navigation experience on mobile devices
- Better organized configuration features
- More intuitive separation between primary actions and settings

### Potential Challenges
- Existing users need to adapt to new navigation location for Budgets/Categories
- Need clear communication about changes in release notes
- Some power users might prefer direct access to Budgets/Categories

## Alternative Approaches Considered

### Option A: Keep Budgets as Separate Tab
- Keep: Dashboard, Transactions, Wallets, Budgets, Profile
- Move Goals to Dashboard or remove from main navigation
- Issue: Still loses Profile/logout functionality

### Option B: Keep Profile as Separate Tab
- Keep: Dashboard, Transactions, Wallets, Profiles, Goals
- Move Budgets to Dashboard or Settings
- Issue: Loses Budgets accessibility

### Option C: 5 Tabs with "More" Menu
- Keep: Dashboard, Transactions, Wallets, Goals, Profile
- Budgets/Categories in overflow "More" menu
- Issue: Hides important features in secondary menu

## Recommended Approach: Option D (Proposed)
The proposed approach was selected because it:
- Follows mobile UX best practices (≤5 navigation items)
- Groups related configuration features logically
- Maintains access to all critical functions
- Provides a scalable structure for future features
- Aligns with user expectations for app configuration

## Testing Plan
- Verify all navigation paths work correctly
- Test on multiple device sizes
- Ensure all features remain accessible
- Test with actual users to validate ease of use
- Verify no broken links or 404 errors

## Rollout Strategy
1. Implement changes in development branch
2. User testing with navigation changes
3. Update all documentation
4. Deploy to production
5. Monitor user feedback and usage metrics
6. Make adjustments based on user feedback if needed

## Success Metrics
- Reduced navigation errors reported
- Improved user satisfaction with navigation
- Maintained or improved feature discovery rates
- No significant decrease in budget/category usage