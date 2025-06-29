# EduCollab Platform

## Overview

EduCollab is a modern educational collaboration platform built with React, TypeScript, and Node.js. It provides a comprehensive learning management system featuring courses, collaborative notes, discussion forums, and user progress tracking. The platform supports multiple user roles (students, tutors, admins) with role-based access control.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Uploads**: Multer middleware for handling file uploads
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Schema**: Defined in shared schema with Zod validation
- **Connection**: Neon Database serverless driver

## Key Components

### User Management
- Multi-role authentication system (student, tutor, admin)
- JWT token-based authentication
- Protected routes with role-based access control
- User profile management with avatar uploads

### Course Management
- Course creation and enrollment system
- Progress tracking for enrolled students
- Category-based course organization
- Tag-based course filtering
- Publishing workflow for course authors

### Collaborative Notes
- Public and private note creation
- Course-associated notes
- Tag-based organization
- Rich text content support

### Discussion Forum
- Threaded discussion topics
- Comment voting system
- Topic pinning and view tracking
- Course-specific forum sections

### File Management
- Image upload support (JPEG, PNG, GIF)
- 5MB file size limit
- Secure file storage with type validation

## Data Flow

### Authentication Flow
1. User credentials sent to `/api/auth/login`
2. Server validates credentials and generates JWT
3. JWT stored in localStorage on client
4. Subsequent requests include JWT in Authorization header
5. Protected routes verify JWT and attach user context

### Course Enrollment Flow
1. Student browses available courses
2. Enrollment request sent to `/api/courses/:id/enroll`
3. Server creates enrollment record with progress tracking
4. Client updates UI to reflect enrollment status

### Forum Interaction Flow
1. User creates topic or comment
2. Content validated against schema
3. Database stores content with user association
4. Real-time updates via query invalidation
5. Vote system updates comment scores

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm and drizzle-zod for database operations
- **Authentication**: jsonwebtoken and bcrypt for security
- **File Handling**: multer for file uploads
- **Validation**: zod for schema validation
- **UI Components**: Complete Radix UI component suite
- **Charts**: Recharts for data visualization
- **State Management**: @tanstack/react-query for server state

### Development Dependencies
- **Build Tools**: Vite with React plugin
- **TypeScript**: Full TypeScript support with strict configuration
- **Styling**: Tailwind CSS with PostCSS
- **Development**: tsx for TypeScript execution
- **Bundling**: esbuild for server-side bundling

## Deployment Strategy

### Build Process
1. Frontend built with Vite to `dist/public`
2. Server bundled with esbuild to `dist/index.js`
3. Database migrations applied via Drizzle Kit
4. Environment variables configured for production

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `NODE_ENV`: Environment mode (development/production)

### Production Setup
- Server serves static files from `dist/public`
- API routes prefixed with `/api`
- Error handling middleware for graceful failures
- Request logging with duration tracking

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```