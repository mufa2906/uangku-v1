# Authentication Migration (Clerk to BetterAuth)

## Status
PLANNED - Migration plan for moving from Clerk to BetterAuth

## Overview
This document outlines the necessary changes to migrate the Uangku application from using Clerk for authentication to using BetterAuth. This change will reduce dependency on third-party services, provide better offline functionality, and allow more control over authentication flows.

## Issues to Address

### 1. Dependency on Third-Party Clerk Service
**Problem**: The application currently relies on Clerk for authentication, which creates a dependency on an external service.

**Requirements**:
- Remove all Clerk dependencies
- Implement self-hosted authentication using BetterAuth
- Maintain same user experience for authentication flows
- Ensure security standards are maintained or improved

### 2. Offline Authentication Issues
**Problem**: Authentication dependencies prevent proper offline functionality as mentioned in the application-enhancements-v2.md.

**Requirements**:
- Allow users to access basic functionality when offline
- Maintain user data separation and security
- Ensure proper authentication state when connectivity is restored
- Cache authentication state for offline use

### 3. Sign In/Sign Up Page Updates
**Problem**: Need to replace Clerk's pre-built authentication UI with implementation using BetterAuth.

**Requirements**:
- Create custom sign in page using BetterAuth components
- Create custom sign up page using BetterAuth components
- Maintain existing UI/UX design
- Implement authentication flows (email, password, social logins)
- Handle authentication errors and user feedback

### 4. API Route Authentication Updates
**Problem**: All API routes currently use Clerk's `auth()` method.

**Requirements**:
- Replace `auth()` calls with BetterAuth equivalents
- Ensure all security checks continue to work
- Maintain user data isolation
- Update error handling for unauthenticated requests

### 5. Middleware Configuration
**Problem**: Current middleware is configured for Clerk.

**Requirements**:
- Replace Clerk middleware with BetterAuth middleware
- Maintain public/private route protection
- Keep offline routes accessible (like `/offline` route)

## Technical Implementation

### 1. Package Dependencies Update
- Remove: `@clerk/nextjs`, `@clerk/types`, `@clerk/themes`, `@clerk/backend`
- Add: `better-auth`

### 2. Configuration Files
- Create BetterAuth configuration file
- Configure authentication providers (email, social logins)
- Set up session management
- Configure database adapter for user data

### 3. Database Schema Changes
```sql
-- Add users table if not already present
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255), -- For password authentication
  name VARCHAR(255),
  image_url TEXT, -- For profile pictures from social logins
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add sessions table for managing auth sessions
CREATE TABLE user_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add accounts table for social login providers
CREATE TABLE user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id VARCHAR(50) NOT NULL, -- 'google', 'github', etc.
  provider_user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider_id, provider_user_id)
);
```

### 4. Replace Auth Implementation
- Replace all `import { auth } from '@clerk/nextjs/server'` with BetterAuth equivalent
- Replace all `import { useAuth } from '@clerk/nextjs'` with BetterAuth equivalent hook
- Update all API routes to use BetterAuth's authentication methods
- Update all client components that check authentication state

### 5. Middleware Update
- Replace Clerk middleware with BetterAuth middleware
- Update route protection logic
- Maintain public/private route configuration

### 6. API Routes Migration
For each API route, replace:
```typescript
// Clerk
import { auth } from '@clerk/nextjs/server';
const { userId } = auth();

// BetterAuth
import { betterAuth } from '@/lib/better-auth';
const session = await betterAuth.getSessionFromRequest(request);
const userId = session?.user.id;
```

### 7. Client-Side Authentication Migration
For each client component, replace:
```typescript
// Clerk
import { useAuth } from '@clerk/nextjs';
const { userId, isSignedIn, signOut } = useAuth();

// BetterAuth
import { useSession } from '@/hooks/useBetterAuth';
const { user, isLoading, signIn, signOut } = useSession();
```

## Implementation Steps

### Phase 1: Setup BetterAuth
1. Install BetterAuth dependencies
2. Create configuration file
3. Set up database tables
4. Test basic authentication setup

### Phase 2: API Routes Migration
1. Update authentication in all API routes
2. Test API route functionality
3. Ensure security is maintained

### Phase 3: Client-Side Migration
1. Replace useAuth hooks with BetterAuth equivalents
2. Update all components that check authentication
3. Test all pages for proper authentication handling

### Phase 4: Authentication Pages
1. Create custom sign-in page
2. Create custom sign-up page
3. Implement social login providers
4. Test authentication flows

### Phase 5: Middleware Migration
1. Replace Clerk middleware with BetterAuth
2. Test route protection
3. Ensure public/private routes work correctly

### Phase 6: Testing
1. Test full authentication flow
2. Test offline functionality
3. Test API routes
4. Perform security review
5. Migrate user accounts from Clerk (if needed)

## Files to Update

### Dependencies
- `package.json` - Remove Clerk, add BetterAuth

### Server Components & API Routes
- All files in `app/api/` directory that use `auth()`
- `src/app/api/insights/route.ts` (and all other API routes)
- Any server actions that use authentication

### Client Components
- All components using `useAuth` hook
- `src/app/dashboard/page.tsx`
- `src/app/transactions/page.tsx`
- `src/app/wallets/page.tsx`
- `src/app/budgets/page.tsx`
- `src/app/bills/page.tsx`
- `src/app/categories/page.tsx`
- `src/app/goals/page.tsx`
- `src/app/profile/page.tsx`
- All components under `src/components/` that use authentication

### Pages
- `src/app/page.tsx` (home page)
- Create new sign-in and sign-up pages (if not using BetterAuth's default)
- Update profile page to use BetterAuth user data

### Middleware
- `src/middleware.ts` - Replace Clerk middleware

### Contexts
- Update or replace PWA context authentication references
- Update any authentication-related contexts

## Database Migration Considerations

### User Data Migration
- Plan for migrating existing Clerk user data
- Handle user ID mapping between Clerk and new system
- Preserve user preferences and settings
- Migrate social login provider connections

### Session Management
- Update session handling for offline capabilities
- Implement proper session refresh mechanisms
- Ensure secure session storage

## Testing Requirements

### Authentication Flows
- Sign up with email/password
- Sign in with email/password
- Social login (Google, etc.)
- Password reset
- Account verification
- Session management

### API Security
- Unauthorized access to protected routes
- User data isolation
- Correct user ID association
- Session validation

### Offline Functionality
- Access to offline features without authentication
- Proper authentication state when online
- Sync of offline data when connection restored
- User data separation in offline mode

## Known Issues
1. Migration from Clerk user data to self-hosted solution
2. Maintaining same level of security as Clerk
3. Handling social login provider setup
4. Offline authentication state management
5. Session management across app lifecycle

## Future Enhancements
- Email verification system
- Password reset functionality
- Two-factor authentication
- Custom authentication providers
- Advanced user management features
- Account linking for multiple providers

## References & Resources
- BetterAuth documentation
- Next.js authentication best practices
- Security guidelines for authentication
- User data migration strategies
- Offline-first authentication patterns