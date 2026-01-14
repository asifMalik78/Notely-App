# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Notely is a full-stack Kanban board application with separate backend (Express/TypeScript) and frontend (React/TypeScript) projects.

## Common Commands

### Backend (run from `/backend`)
```bash
npm run dev           # Start dev server with hot reload
npm run build         # Compile TypeScript to dist/
npm run lint          # ESLint check (0 warnings allowed)
npm run lint:fix      # ESLint with auto-fix
npm run typecheck     # TypeScript type checking
npm run format        # Prettier format
npm run db:push       # Push Drizzle schema to database
npm run db:generate   # Generate migration files
npm run db:studio     # Open Drizzle Studio GUI
npm run docker:dev    # Start dev containers (backend + MySQL)
```

### Frontend (run from `/frontend`)
```bash
npm run dev           # Start Vite dev server
npm run build         # TypeScript + Vite production build
npm run lint          # ESLint check
npm run typecheck     # TypeScript type checking
npm run format        # Prettier format
npm run docker:dev    # Start dev container
```

### Docker
```bash
# Development
cd backend && docker compose -f docker-compose.dev.yml up -d
cd frontend && docker compose -f docker-compose.dev.yml up -d

# Production
cd backend && docker compose -f docker-compose.prod.yml up -d
cd frontend && docker compose -f docker-compose.prod.yml up -d

# Rebuild after package.json changes
docker compose -f docker-compose.dev.yml build --no-cache

# Run database migrations in container
docker exec notely-backend-dev npm run db:push

# Reset database (removes volume)
docker compose -f docker-compose.dev.yml down -v
```

## Architecture

### Backend Structure (`/backend/src`)
- **Entry Point**: `index.ts` → `server.ts` → `app.ts`
- **Layers**: Routes → Controllers → Services → Database
- **Database**: Drizzle ORM with MySQL, schema in `db/schema.ts`
- **Auth**: JWT cookies + Passport.js OAuth (Google/GitHub)
- **Validation**: Zod schemas in `validators/`

Key files:
- `app.ts` - Express middleware and route setup
- `db/schema.ts` - All table definitions and relations
- `config/passport.ts` - OAuth strategies with findOrCreateUser
- `controllers/auth.controller.ts` - Auth endpoints including OAuth callbacks
- `services/auth.service.ts` - Auth business logic
- `middleware/auth.ts` - JWT verification

### Frontend Structure (`/frontend/src`)
- **State**: React Context API (`context/AuthContext.tsx`, `context/ThemeContext.tsx`)
- **API**: Axios client with auto-refresh in `services/api.ts`
- **Routing**: React Router with protected/public route guards in `App.tsx`
- **Styling**: TailwindCSS with dark mode and 10 color themes
- **UI Components**: Radix UI primitives with shadcn-style components

Key files:
- `App.tsx` - Route definitions and guards
- `context/AuthContext.tsx` - Auth state and methods
- `context/ThemeContext.tsx` - Theme mode (light/dark) and color themes
- `services/api.ts` - All API calls with interceptors
- `components/ui/` - Reusable UI components (Button, Calendar, DatePicker, Popover, etc.)

### Database Schema
Tables: `users`, `boards`, `columns`, `tasks`, `labels`, `task_labels`
- All use UUID primary keys
- Cascade deletes on foreign keys
- Users can have OAuth (nullable password) or email/password auth

## Code Patterns

### Adding Backend Endpoints
1. Add Zod schema in `validators/`
2. Add service method in `services/`
3. Add controller method in `controllers/`
4. Add route in `routes/`

### Adding Frontend Features
1. Add API methods in `services/api.ts`
2. Add types in `types/index.ts`
3. Create components in `components/`
4. Add page in `pages/` and route in `App.tsx`

### Database Changes
1. Update `backend/src/db/schema.ts`
2. Run `npm run db:push` to apply

### Theme System
- 10 color themes: zinc, rose, blue, green, orange, violet, yellow, cyan, pink, slate
- Each theme has light and dark variants
- CSS variables defined in `frontend/src/index.css`
- Use `ThemePicker` component for theme selection
- Smooth 200ms transitions between themes

## Environment Variables

### Backend
Required: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`

Optional OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

Note: Docker compose maps `DB_*` variables to `MYSQL_*` automatically for container initialization.

### Frontend
Required: `VITE_API_URL`

## Linting Rules
- Both projects use ESLint + Prettier with strict TypeScript
- Backend: `@typescript-eslint` rules, no unused vars (except `_` prefixed)
- Frontend: React hooks rules, no explicit `any`
- Run `npm run lint` before committing - 0 warnings policy

## Docker Hub CI/CD
See `DOCKER_HUB_SETUP.md` for GitHub Actions authentication setup.

Required GitHub Secrets:
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub access token
