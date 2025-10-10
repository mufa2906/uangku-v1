# Uangku Immediate Development Tasks

## Priority 1: Complete Core Functionality

### Task 1: Logout Feature Completion
- **Status**: Planned
- **Priority**: High
- **Estimate**: 2-3 days
- **Implementation Steps**:
  1. Add logout button to profile page with confirmation dialog
  2. Implement Clerk signOut with proper session clearing
  3. Ensure redirect to in-app sign-in page (not Clerk-hosted)
  4. Test session security and proper cleanup
  5. Add success/error feedback for user

### Task 2: Navigation Enhancement
- **Status**: Planned  
- **Priority**: High
- **Estimate**: 3-4 days
- **Implementation Steps**:
  1. Create "Manage" page/component with Wallets/Budgets/Goals/Categories
  2. Update AppBottomNav to have 4 items: Dashboard, Transactions, Manage, Profile
  3. Ensure Categories remain easily accessible for transaction creation
  4. Test navigation flow and user experience
  5. Update all affected pages with new navigation structure

## Priority 2: Platform Enhancements

### Task 3: PWA Implementation
- **Status**: Planned
- **Priority**: Medium
- **Estimate**: 4-5 days
- **Implementation Steps**:
  1. Add service worker for offline functionality
  2. Implement offline transaction entry capability
  3. Add app manifest for installability
  4. Add push notification support for bills/budgets
  5. Test offline functionality thoroughly

## Development Guidelines
- Create feature branch for each task
- Follow existing code patterns and architecture
- Update TypeScript interfaces and Zod schemas as needed
- Ensure responsive design and accessibility
- Add proper error handling and user feedback
- Update documentation as implemented
- Test on mobile devices