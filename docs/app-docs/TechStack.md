# Uangku — Tech Stack & Development Guidelines

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.33 (App Router, TypeScript)
- **Styling**: TailwindCSS 3.4.3 (utility-first CSS framework)
- **UI Components**: shadcn/ui (accessible, customizable components)
- **Charts**: Recharts 2.13.0 (declarative charting library)
- **Icons**: lucide-react 0.400.0 (consistent icon set)
- **State Management**: React Context for global state (CurrencyContext, ToastProvider)
- **Dialogs/Modals**: Radix UI primitives for accessible components
- **Client-side Navigation**: Next.js App Router with client-side routing

### Backend
- **API**: Next.js Route Handlers (RESTful endpoints)
- **Validation**: Zod 3.23.8 (schema validation for all inputs)
- **Logging**: Optional (pino 7.11.0 for server logs)
- **Runtime**: Node.js (with Edge runtime for lightweight operations)

### Authentication & User Management
- **Provider**: Clerk 5.0.0 (user management & authentication)
- **Themes**: @clerk/themes 2.0.0 (customizable UI themes)
- **Session Management**: Clerk's session handling with automatic JWT validation
- **Multi-tenancy**: Built-in Clerk user isolation with userId scoping

### Database & ORM
- **Database**: Supabase PostgreSQL (managed Postgres)
- **ORM**: Drizzle ORM (type-safe database operations)
- **Driver**: node-postgres (pg) dialect
- **Migration Tool**: drizzle-kit (database schema management)
- **Query Building**: Drizzle's fluent query API with join support

### AI & Natural Language Processing
- **Transaction Processing**: Custom NLP engine for Indonesian transaction patterns
- **Learning System**: Transaction learning for improved suggestions over time
- **Pattern Recognition**: Rule-based extraction with machine learning features

### Deployment & Infrastructure
- **Hosting**: Vercel (Next.js app & API routes)
- **Database Hosting**: Supabase (PostgreSQL hosting)
- **CDN**: Vercel's global edge network
- **Asset Delivery**: Vercel for optimized static asset delivery

## Development Guidelines

### Code Quality
- **Type Safety**: TypeScript strict mode with comprehensive type coverage
- **Linting**: ESLint + Prettier for consistent code style
- **Testing**: Vitest/Jest for unit and service testing (planned)
- **Dependencies**: Use latest stable versions compatible with each other
- **Code Review**: All changes require peer review before merge

### Architecture Principles
- **Component Modularity**: Isolated, reusable components in dedicated folders
- **Separation of Concerns**: Clear separation between UI, business logic, and data access
- **Accessibility**: Follow WCAG guidelines using Radix UI primitives
- **Mobile-First**: Design and develop for mobile before desktop
- **Performance**: Optimize for Core Web Vitals and mobile performance

### Security
- **Authentication**: Clerk's secure authentication system
- **Authorization**: User data isolation with userId scoping at database and API layers
- **Input Validation**: Zod schema validation for all user inputs at API boundaries
- **Environment Security**: Proper management of environment variables
- **Data Protection**: All queries use parameterized statements to prevent injection

## API Architecture
- **RESTful**: Consistent REST API patterns with standard HTTP methods
- **Validation**: All inputs validated with Zod schemas before database operations
- **Multi-Tenancy**: User data isolation with userId filters on all queries
- **Error Handling**: Consistent error response format with detailed messages
- **Caching**: Next.js data fetching with automatic caching where appropriate
- **Pagination**: Built-in pagination support for large datasets
- **Filtering**: Comprehensive filtering and sorting capabilities

## State Management
- **Global State**: React Context for app-wide state (Currency, Toast)
- **Local State**: Component-level useState and useReducer hooks
- **Server State**: Next.js data fetching and caching strategies
- **Form State**: Local component state for form management

## Environment Variables
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
DATABASE_URL=postgres://...
NEXT_PUBLIC_APP_URL=https://uangku.vercel.app
```

## Build & Deployment
- **Type Safety**: Strict TypeScript compilation ensuring no runtime errors
- **Production**: Custom domain required for Clerk production keys (not vercel.app domains)
- **Performance**: Optimized for fast loading times and responsive interactions
- **Caching**: Multi-layered caching strategy for improved performance
- **Asset Optimization**: Automatic image optimization and compression

## Package.json Scripts
- `db:push` - Push schema changes to database
- `db:generate` - Generate migration files
- `db:migrate` - Run pending migrations
- `db:studio` - Open Drizzle Studio for database management
- `dev` - Start development server
- `build` - Create production build
- `start` - Start production server
- `lint` - Run ESLint for code quality checks

## Data Flow & Architecture
- **Client-Server**: Next.js App Router with API routes for server-side operations
- **Database**: Direct connection from API routes to Supabase via Drizzle ORM
- **Authentication**: Clerk middleware integration for session validation
- **Validation**: Zod schemas at API boundaries with comprehensive error handling
- **Caching**: Next.js built-in caching with manual cache invalidation strategies

## UI/UX Components
- **Form Handling**: Custom forms with validation and error handling
- **Toast Notifications**: Custom toast system for user feedback
- **Modals/Sheets**: Radix UI based modal components for transaction forms
- **Charts**: Recharts for financial data visualization
- **Responsive Design**: Mobile-first approach with responsive breakpoints