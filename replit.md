# Overview

Quiztech is a gamified microlearning platform for software engineers that delivers daily lessons and quizzes to help users prepare for interviews, revise concepts, and learn new topics. The application features streak tracking, leaderboards, badges, and a comprehensive admin dashboard for content management.

## Recent Changes

### August 2025
- **GitHub Integration Setup**: Created comprehensive .gitignore file for proper version control
- **Database Seeding**: Added sample content including 5 topics, 6 quiz questions, 2 lessons, and 5 badges
- **TypeScript Error Resolution**: Fixed all compilation errors across frontend components
- **Authentication System**: Fully implemented Replit OAuth with session management
- **Mobile UI Implementation**: Complete mobile-first design with app container pattern
- **Admin Dashboard**: Full CRUD functionality for content management
- **Quiz System**: Working question progression, scoring, and results display
- **Gamification Features**: Streak tracking, badges, and leaderboard functionality

## User Preferences

Preferred communication style: Simple, everyday language.

## Version Control & GitHub Integration

### Git Repository Status
- ✅ Git repository initialized
- ✅ Comprehensive .gitignore configured for Node.js/TypeScript projects
- ✅ Excludes sensitive files: environment variables, node_modules, build artifacts, cache files
- ✅ Ready for GitHub integration

### GitHub Setup Instructions
1. **Create GitHub Repository**:
   - Go to GitHub.com and create a new repository
   - Name it "quiztech" or your preferred name
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)
   - Make it public or private as preferred

2. **Connect to GitHub** (run these commands in the terminal):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git add .
   git commit -m "Initial QuizTech MVP implementation - Full-stack gamified microlearning platform"
   git branch -M main
   git push -u origin main
   ```

3. **Ongoing Development**:
   ```bash
   # After making changes:
   git add .
   git commit -m "Description of changes"
   git push
   ```

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Responsive design with mobile app container components

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API endpoints with structured error handling
- **Session Management**: Express sessions with PostgreSQL session store
- **Development**: Hot module replacement with Vite integration

### Authentication System
- **Provider**: Replit OAuth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: JWT-based authentication with secure session cookies
- **Authorization**: Route-level authentication middleware

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Key Tables**: 
  - Users (profiles, points, streaks)
  - Topics (subject categories)
  - Content Items (lessons and quiz questions)
  - Quizzes (daily quiz generation)
  - Attempts (quiz submissions and scoring)
  - Badges (gamification achievements)
  - Leaderboards (ranking system)

### Content Management
- **Admin Dashboard**: Full CRUD operations for topics, questions, and badges
- **Content Types**: Multiple choice questions, lessons with code snippets
- **Content Sourcing**: Admin-uploaded primary content with AI-generated fallback options
- **Quality Control**: Content validation and duplicate detection

### Gamification Features
- **Scoring System**: Points for correct answers with streak bonuses
- **Streak Tracking**: Daily completion tracking with calendar heatmap
- **Badge System**: Achievement unlocks for milestones (3-day, 7-day streaks, topic mastery)
- **Leaderboards**: Weekly and monthly rankings with social features

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **express**: Web application framework
- **passport**: Authentication middleware

### Development Tools
- **tsx**: TypeScript execution for development
- **vite**: Build tool and development server
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development plugins

### Authentication
- **openid-client**: OpenID Connect client for Replit OAuth
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session management middleware

### Validation and Forms
- **zod**: Runtime type validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers

### Utilities
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Conditional CSS class utilities
- **clsx**: CSS class name utility
- **wouter**: Lightweight routing library

## Deployment Configuration

### Environment Variables
Required environment variables (automatically provided by Replit):
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key  
- `REPL_ID`: Replit application ID for OAuth
- `REPLIT_DOMAINS`: Authorized domains for authentication
- `ISSUER_URL`: OAuth provider endpoint (defaults to Replit OIDC)

### Database Management
- **Schema Sync**: Run `npm run db:push` to apply schema changes
- **Sample Data**: Run `node scripts/seed.js` to populate with demo content
- **Production**: Session storage uses PostgreSQL for persistence across restarts

### Production Deployment
- Mobile-responsive design works across all screen sizes
- Authentication supports multi-domain deployment
- Database connection pooling optimized for serverless environments
- Build artifacts served efficiently via Vite production build