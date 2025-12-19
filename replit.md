# Mypropertunity

## Overview

Mypropertunity is a web application that helps homeowners identify profitable home repair and improvement opportunities using AI-powered image analysis. Users upload three photos of their property (front center, front right, and front left views), and the system provides detailed recommendations for repairs and improvements to the house exterior and landscaping, with each suggestion including cost estimates and expected property value increases.

The application is built as a full-stack TypeScript application with a React frontend and Express backend, targeting deployment on Replit with integrated authentication, database, and payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for UI components
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and API caching

**UI Component Library**
- Shadcn/ui components built on Radix UI primitives
- Tailwind CSS v4 for styling with custom design tokens
- Framer Motion for animations and transitions
- Custom fonts: Outfit (sans-serif), Libre Baskerville (serif), Inter

**Key Design Patterns**
- Component composition using Radix UI slot pattern
- Custom hooks for authentication state (`useAuth`) and toast notifications
- File upload handling with react-dropzone for drag-and-drop support
- Multi-image upload workflow requiring three specific property angles

### Backend Architecture

**Server Framework**
- Express.js HTTP server with TypeScript
- Session-based authentication using express-session
- PostgreSQL session store for persistent sessions
- Rate limiting and CORS middleware

**API Design**
- RESTful endpoints for analysis, authentication, and payments
- Multipart/form-data upload handling with Multer (10MB file size limit)
- Protected routes requiring authentication middleware
- Raw body preservation for Stripe webhook signature verification

**Authentication System**
- Replit Auth integration via OpenID Connect (OIDC)
- Passport.js strategy for OIDC authentication
- Session management with 7-day TTL
- User profile synchronization on login

**AI Integration**
- OpenAI API for property image analysis
- Custom prompt engineering for profitable repair identification
- Multi-angle image analysis (front, right, left views)
- Structured JSON response parsing for analysis results

**Business Logic**
- Subscription model with 7-day free trial:
  - Free Trial (7 days): 9 photos (3 analyses), 3 properties, trial expiration enforced
  - Basic ($19.99/month): 10 photos/month, 1 property
  - Pro ($59/month): 50 photos/month, 10 properties, high-res images, PDF export
  - Enterprise ($99.99/month): Unlimited photos, unlimited properties, all features
- ZIP code input required for location-based pricing estimates
- ROI-focused recommendations (value increase must exceed repair cost)
- Three pricing tiers per repair: DIY, budget contractor, premium contractor
- Feature gating enforced at API level based on subscription tier
- Trial expiration check for free users (trialEndsAt field)
- Monthly photo upload limits reset on billing cycle (paid)

### Data Storage

**Database Architecture**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database access
- Schema-first design with shared types between frontend and backend

**Schema Design**
- `sessions`: Express session storage (required for Replit Auth)
- `users`: User profiles with subscription tier, usage quotas, and Stripe integration
- `yard_analyses`: Stored analysis results with JSONB data structure
- Stripe schema managed separately via stripe-replit-sync package

**Data Models**
- User model includes Replit Auth fields (email, firstName, lastName, profileImageUrl)
- Subscription tracking via Stripe customer and subscription IDs
- Usage tracking: photoUploadsThisPeriod, photoUploadsResetAt, propertiesCount
- Subscription tiers: free, basic, pro, enterprise (defined in TIER_LIMITS)
- Analysis results stored as typed JSONB with detailed suggestions array
- UUID primary keys for all tables

### External Dependencies

**Authentication**
- Replit Auth (OIDC) for user authentication
- Environment-based issuer URL configuration
- Automatic user upsert on login

**Payment Processing**
- Stripe for subscription management
- stripe-replit-sync for webhook handling and schema management
- Managed webhook creation with automatic domain detection
- Customer portal integration for subscription management
- Environment-based credential fetching (development vs production)

**AI Services**
- OpenAI API via AI Integrations connector
- Custom base URL and API key from environment variables
- Image analysis with GPT-4 Vision capabilities
- Structured output parsing for repair recommendations

**Database**
- Neon PostgreSQL serverless database
- Connection string via DATABASE_URL environment variable
- Automatic migration support via Drizzle Kit

**File Storage**
- Server-side file storage (implementation abstracted via storage interface)
- Image URL generation for uploaded property photos
- Support for PNG, JPG, JPEG, and WebP formats

**Build and Development Tools**
- Replit-specific Vite plugins for development banner and cartographer
- Custom meta images plugin for OpenGraph/Twitter card URL updates
- ESBuild for server-side bundling with selective dependency bundling
- TypeScript compilation with path aliases (@/, @shared/, @assets/)

**Asset Management**
- Static assets served from attached_assets directory
- Hero images and generated property visualizations
- Favicon and OpenGraph images