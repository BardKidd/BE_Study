# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo using Turborepo with pnpm workspaces containing:

- **Backend**: NestJS application with TypeORM + MySQL
- **Frontend**: React application with Vite, TypeScript, and Tailwind CSS
- **Root**: Post module (appears to be a separate NestJS module)

## Common Development Commands

### Root Level Commands
```bash
# Start development for all apps
pnpm dev

# Build all apps
pnpm build

# Run linting across all apps
pnpm lint

# Run type checking across all apps
pnpm check-types

# Format code
pnpm format
```

### Backend Development (apps/Backend/)
```bash
# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start:prod

# Run tests
pnpm test
pnpm test:watch
pnpm test:cov
pnpm test:e2e

# Linting
pnpm lint

# Generate NestJS resources
pnpm nest g resource <name>
```

### Frontend Development (apps/Frontend/)
```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Linting
pnpm lint
```

## Architecture Overview

### Backend Architecture
- **Framework**: NestJS with TypeORM
- **Database**: MySQL with TypeORM entities
- **Configuration**: Environment-based config using @nestjs/config
- **Validation**: class-validator and class-transformer for DTOs
- **API Documentation**: Swagger UI available at `/api`
- **Error Handling**: Global exception filter for consistent error responses
- **Database Connection**: Configured in `app.module.ts` with async factory pattern

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router DOM
- **Permissions**: CASL for role-based access control
- **Form Handling**: React Hook Form with Zod validation

### Key Backend Components
- **User Module**: Complete CRUD operations for user management
- **Post Module**: Basic structure (in root/src/post)
- **Global Exception Filter**: Standardized error response format
- **DTOs**: Input validation with decorators
- **Entities**: TypeORM entities with proper relationships

### Key Frontend Components
- **Permission System**: CASL-based role/permission management
- **UI Components**: shadcn/ui component library
- **Form Components**: Integrated with React Hook Form
- **Route Protection**: Permission-based route access

## Database Setup

The backend requires a MySQL database with connection configured via environment variables in `apps/Backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
```

## Development Workflow

1. **Starting Development**: Use `pnpm dev` from root to start both frontend and backend
2. **API Testing**: Access Swagger UI at `http://localhost:3000/api`
3. **Database Sync**: TypeORM synchronize is enabled for development (disable in production)
4. **Code Generation**: Use NestJS CLI for generating resources, controllers, services, etc.

## Testing

- **Backend**: Jest for unit tests, supertest for e2e tests
- **Frontend**: No specific testing framework currently configured

## Important Notes

- Backend uses global validation pipes and exception filters
- Frontend implements CASL for permission-based access control
- TypeORM synchronize is enabled (development only)
- Both apps use TypeScript with strict type checking
- The project follows NestJS and React best practices for folder structure