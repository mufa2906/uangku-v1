# Uangku — Tech Stack & Development Guidelines

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.33 (App Router, TypeScript)
- **Styling**: TailwindCSS 3.4.3 (utility-first CSS framework)
- **UI Components**: shadcn/ui (accessible, customizable components)
- **Charts**: Recharts 2.13.0 (declarative charting library)
- **Icons**: lucide-react 0.400.0 (consistent icon set)

### Backend
- **API**: Next.js Route Handlers (RESTful endpoints)
- **Validation**: Zod 3.23.8 (schema validation)
- **Logging**: Optional (pino 7.11.0 for server logs)
- **Runtime**: Node.js (with Edge runtime for lightweight operations)

### Authentication
- **Provider**: Clerk 5.0.0 (user management & authentication)
- **Themes**: @clerk/themes 2.0.0 (customizable UI themes)
- **Session Management**: Clerk's session handling

### Database & ORM
- **Database**: Supabase PostgreSQL (managed Postgres)
- **ORM**: Drizzle ORM 0.33.0 (type-safe database operations)
- **Driver**: node-postgres (pg) dialect
- **Migration Tool**: drizzle-kit 0.20.14

### Deployment & Infrastructure
- **Hosting**: Vercel (Next.js app & API routes)
- **Database Hosting**: Supabase (PostgreSQL hosting)
- **CDN**: Vercel's global edge network

## Development Guidelines

### Code Quality
- **Type Safety**: TypeScript strict mode with comprehensive type coverage
- **Linting**: ESLint 8.57.1 + Prettier for consistent code style
- **Testing**: Vitest/Jest for unit and service testing (planned)
- **Dependencies**: Use latest stable versions compatible with each other

### Architecture Principles
- **Component Modularity**: Isolated, reusable components in dedicated folders
- **Separation of Concerns**: Clear separation between UI, business logic, and data access
- **Accessibility**: Follow WCAG guidelines using Radix UI primitives
- **Mobile-First**: Design and develop for mobile before desktop

### Security
- **Authentication**: Clerk's secure authentication system
- **Authorization**: User data isolation with userId scoping
- **Input Validation**: Zod schema validation for all user inputs
- **Environment Security**: Proper management of environment variables

## API Architecture
- **RESTful**: Consistent REST API patterns
- **Validation**: All inputs validated with Zod schemas
- **Multi-Tenancy**: User data isolation with userId filters
- **Error Handling**: Consistent error response format

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

## Package.json Scripts
- `db:push` - Push schema changes to database
- `db:generate` - Generate migration files
- `db:migrate` - Run pending migrations
- `dev` - Start development server
- `build` - Create production build
- `start` - Start production server