# Student Management System

## Overview

This is a comprehensive Student Management System (SMS) designed for educational institutions. The application provides a complete solution for managing students, courses, attendance, grades, and academic reports. Built as a full-stack web application with modern technologies, it supports role-based access control for administrators, teachers, and students, with multi-tenant architecture for school-level data isolation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design
- **Build Tool**: Vite for fast development and optimized production builds
- **Form Management**: React Hook Form with Zod validation for robust form handling

### Backend Architecture
- **Runtime**: Node.js with TypeScript using ES modules
- **Framework**: Express.js for RESTful API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication using connect-pg-simple
- **Validation**: Zod schemas shared between frontend and backend for consistent data validation
- **Database Migrations**: Drizzle Kit for schema migrations and database management

### Database Design
- **Multi-tenant Architecture**: Row-level security with tenant isolation (designed for school-level separation)
- **Core Entities**: Users, Students, Courses, Enrollments, Attendance, Assessments, and Grades
- **Relationships**: Properly normalized schema with foreign key constraints
- **Enums**: Structured data types for roles, grade levels, attendance status, and assessment types
- **Session Storage**: PostgreSQL-backed session management for scalable authentication

### Authentication & Authorization
- **Identity Provider**: Replit Auth with OpenID Connect
- **Role-Based Access Control**: Three primary roles (Admin, Teacher, Student) with granular permissions
- **Session Management**: Server-side sessions with PostgreSQL storage
- **Security**: Secure cookie configuration with HTTP-only and secure flags

### API Architecture
- **RESTful Design**: Standard HTTP methods with consistent response patterns
- **Route Organization**: Modular route handlers with middleware for authentication
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Request Validation**: Zod schema validation for all API endpoints
- **Response Formatting**: Consistent JSON response structure across endpoints

### UI/UX Design System
- **Component Library**: shadcn/ui built on Radix UI primitives
- **Design Tokens**: CSS custom properties for consistent theming
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities
- **Accessibility**: ARIA-compliant components with keyboard navigation support
- **Dark Mode**: Theme switching capability with CSS variables

### Development Workflow
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Path Aliases**: Organized imports with @ aliases for clean module resolution
- **Development Server**: Hot module replacement with Vite development server
- **Production Build**: Optimized builds with tree shaking and code splitting

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL-compatible serverless database with connection pooling
- **Connection Management**: `@neondatabase/serverless` with WebSocket support for serverless environments

### Authentication Services
- **Replit Auth**: OAuth/OpenID Connect provider for user authentication
- **Session Storage**: PostgreSQL-based session persistence with automatic cleanup

### UI Component Libraries
- **Radix UI**: Headless component primitives for accessible UI components
- **Lucide React**: Icon library for consistent iconography
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Utility for component variant management

### Development Tools
- **TypeScript**: Static type checking and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **React Hook Form**: Performant form library with minimal re-renders
- **TanStack React Query**: Data fetching and caching with background synchronization

### Security & Validation
- **bcrypt**: Password hashing for secure credential storage
- **Zod**: Runtime type validation and schema parsing
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers middleware (referenced in requirements)

### Build & Development
- **Vite**: Frontend build tool with plugin ecosystem
- **esbuild**: Fast JavaScript bundler for backend builds
- **PostCSS**: CSS processing with Tailwind CSS integration
- **tsx**: TypeScript execution for development server