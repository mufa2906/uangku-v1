# Uangku Navigation Migration Checklist

## Pre-Migration Preparation
- [ ] Create backup branch: `git checkout -b navigation-migration-backup`
- [ ] Document current navigation behavior with screenshots
- [ ] List all components that reference old navigation paths
- [ ] Run full test suite to ensure current functionality works
- [ ] Create pull request template for review process

## Implementation Tasks

### 1. Navigation Component Update
- [ ] Update `src/components/shells/AppBottomNav.tsx`
  - [ ] Remove Budgets and Profile items
  - [ ] Add Settings item with correct icon
  - [ ] Verify navigation logic works correctly
  - [ ] Test on different screen sizes

### 2. Settings Page Creation
- [ ] Create `src/app/settings/page.tsx`
  - [ ] Add main settings hub layout
  - [ ] Include navigation to sub-settings
  - [ ] Add AppBottomNav reference
  - [ ] Test responsive behavior

### 3. Sub-Settings Pages
- [ ] Create `src/app/settings/profile/page.tsx`
  - [ ] Migrate profile content from `/profile`
  - [ ] Maintain logout functionality
  - [ ] Preserve currency settings
- [ ] Create `src/app/settings/categories/page.tsx`
  - [ ] Migrate categories content from `/categories`
  - [ ] Maintain all category functionality
- [ ] Create `src/app/settings/budgets/page.tsx`
  - [ ] Migrate budgets content from `/budgets`
  - [ ] Maintain all budget functionality

### 4. Old Route Redirects
- [ ] Create redirect page for `/budgets` → `/settings/budgets`
- [ ] Create redirect page for `/profile` → `/settings/profile`
- [ ] Create redirect page for `/categories` → `/settings/categories`
- [ ] Test all redirects work properly

### 5. Navigation Link Updates
- [ ] Update links in `src/app/dashboard/page.tsx`
- [ ] Update links in `src/app/transactions/page.tsx`
- [ ] Update links in `src/app/wallets/page.tsx`
- [ ] Update links in `src/app/goals/page.tsx`
- [ ] Update links in `src/app/providers.tsx` if applicable
- [ ] Update any other components with navigation references

### 6. Component Updates
- [ ] Update any breadcrumbs referencing old paths
- [ ] Update any sidebar navigation if present
- [ ] Update header navigation links if present
- [ ] Verify all internal links navigate correctly

## Testing Tasks

### 1. Navigation Testing
- [ ] Verify Dashboard navigation works
- [ ] Verify Transactions navigation works
- [ ] Verify Wallets navigation works
- [ ] Verify Goals navigation works
- [ ] Verify Settings navigation works

### 2. Settings Functionality Testing
- [ ] Test Settings page loads correctly
- [ ] Test Profile sub-page access and functionality
- [ ] Test Categories sub-page access and functionality
- [ ] Test Budgets sub-page access and functionality
- [ ] Test logout functionality from Settings → Profile

### 3. Redirect Testing
- [ ] Test `/budgets` redirects to `/settings/budgets`
- [ ] Test `/profile` redirects to `/settings/profile`
- [ ] Test `/categories` redirects to `/settings/categories`

### 4. Feature Testing
- [ ] Test all budget features work from new location
- [ ] Test all category features work from new location
- [ ] Test all profile features work from new location
- [ ] Test all transaction features still work

### 5. Cross-Browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge

### 6. Device Testing
- [ ] Test on mobile devices (375px width)
- [ ] Test on tablet devices (768px width)
- [ ] Test on desktop devices (1024px+ width)

## Documentation Updates
- [ ] Update README.md with new navigation structure
- [ ] Update UI_Guidelines.md with 5-tab structure
- [ ] Update SystemDesign.md with new directory structure
- [ ] Update Changelog.md with navigation changes
- [ ] Update any user guides referencing old navigation

## Post-Migration Tasks
- [ ] Run full test suite again
- [ ] Verify no console errors in browser
- [ ] Check mobile responsiveness
- [ ] Verify all forms submit correctly
- [ ] Confirm all API calls still work
- [ ] Check analytics to ensure no broken paths

## Rollback Preparation
- [ ] Ensure backup branch is up to date
- [ ] Document how to revert each change if needed
- [ ] Prepare revert scripts if necessary

## Deployment Checklist
- [ ] Test on staging environment first
- [ ] Deploy to production
- [ ] Monitor for any navigation errors
- [ ] Update any external documentation
- [ ] Notify users of navigation changes if necessary