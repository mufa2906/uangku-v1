# Feature Plan: Logout Functionality

## Overview
Add logout capability to allow users to sign out and switch accounts.

## User Stories
- As a user, I want to be able to log out so I can switch to a different account.
- As a user, I want to be redirected to the sign-in page after logout.
- As a user, I want my session to be properly cleared after logout.
- As a user of a financial app, I want to confirm important actions like logout.

## Requirements
- Add a logout button/option in the user profile page
- Implement Clerk's logout function
- Redirect user to sign-in page after logout
- Clear any local state/cache related to the user session
- Add confirmation dialog for logout to prevent accidental logouts
- Keep authentication pages on our domain rather than redirecting to Clerk's hosted domain

## Technical Implementation
- Use Clerk's `signOut()` function from `@clerk/nextjs`
- Add logout option to profile page with confirmation dialog
- Handle the redirect to sign-in page after successful logout
- Update sign-in and sign-up pages to use virtual routing to stay on domain
- Remove user menu from bottom navigation for simplified UX

## UI/UX Considerations
- Place logout option in profile page under Account Management section
- Add confirmation dialog for logout with security-focused message
- Keep authentication flows on our domain for better user trust
- Simplify bottom navigation to focus on main app features

## Acceptance Criteria
- [ ] User can see and click a logout button on the profile page
- [ ] Clicking logout shows a confirmation dialog
- [ ] User confirms logout action through the dialog
- [ ] Clicking logout calls Clerk's signOut function after confirmation
- [ ] User is redirected to sign-in page after logout
- [ ] User session is properly cleared
- [ ] User cannot access protected routes after logout
- [ ] Sign-in and sign-up flows stay on the application domain

## Testing Scenarios
- Clicking logout button shows confirmation dialog
- Canceling logout keeps user on profile page
- Confirming logout successfully signs user out
- User is redirected to sign-in page after logout
- User cannot access dashboard or other protected routes after logout
- Another user can sign in after logout
- Sign-in and sign-up flows happen on the app domain, not Clerk's hosted domain