# Notely - Kanban Board Application

A modern, full-stack Kanban board application built with React, Express, and MySQL.

## Features

- **Authentication**
  - Email/Password registration and login
  - OAuth with Google and GitHub
  - JWT-based authentication with httpOnly cookies
- **User Profile**
  - Avatar upload
  - Profile management (name, DOB, description)
- **Kanban Boards**
  - Create and manage multiple boards
  - Drag-and-drop columns and tasks
  - Task priorities (Low, Medium, High)
  - Due dates with shadcn calendar picker
  - Custom labels with colors
- **UI/UX**
  - Light/Dark mode toggle
  - 10 color themes (Zinc, Rose, Blue, Green, Orange, Violet, Yellow, Cyan, Pink, Slate)
  - Smooth theme transitions
  - Responsive design
  - Animations with Framer Motion

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Radix UI + shadcn-style components
- Framer Motion for animations
- @hello-pangea/dnd for drag-and-drop
- React Router for navigation
- react-day-picker for calendar

### Backend
- Express with TypeScript
- Drizzle ORM
- MySQL 8 database
- Passport.js for OAuth
- JWT authentication
- Zod for validation

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repo-url>
cd notely
```

2. Copy environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start backend (includes MySQL):
```bash
cd backend
docker compose -f docker-compose.dev.yml up -d
```

4. Wait for MySQL to initialize, then run migrations:
```bash
docker exec notely-backend-dev npm run db:push
```

5. Start frontend:
```bash
cd frontend
docker compose -f docker-compose.dev.yml up -d
```

6. Open your browser:
```
http://localhost:5173
```

### Running Locally (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run db:push    # Push schema to database
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
notely/
├── backend/
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── src/
│   │   ├── app.ts              # Express app config
│   │   ├── server.ts           # Server startup
│   │   ├── index.ts            # Entry point
│   │   ├── config/             # Configuration (env, passport)
│   │   ├── controllers/        # Route controllers
│   │   ├── db/                 # Database schema
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Utilities
│   │   └── validators/         # Input validation
│   └── drizzle.config.ts
├── frontend/
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── ui/             # Base components (Button, Calendar, etc.)
│   │   │   ├── layout/         # Layout components (ThemePicker, etc.)
│   │   │   └── board/          # Board-specific components
│   │   ├── context/            # React contexts (Auth, Theme)
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   └── types/              # TypeScript types
│   └── ...
└── .github/
    └── workflows/
        ├── backend.yml         # Backend CI/CD
        └── frontend.yml        # Frontend CI/CD
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile |
| POST | `/api/auth/me/avatar` | Upload avatar |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/github` | GitHub OAuth |

### Boards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | Get all boards |
| POST | `/api/boards` | Create board |
| GET | `/api/boards/:id` | Get board with columns/tasks |
| PUT | `/api/boards/:id` | Update board |
| DELETE | `/api/boards/:id` | Delete board |

### Columns
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/boards/:boardId/columns` | Create column |
| PUT | `/api/boards/columns/:id` | Update column |
| DELETE | `/api/boards/columns/:id` | Delete column |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks/columns/:columnId/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/move` | Move task |
| DELETE | `/api/tasks/:id` | Delete task |

### Labels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards/:boardId/labels` | Get board labels |
| POST | `/api/boards/:boardId/labels` | Create label |
| DELETE | `/api/boards/labels/:id` | Delete label |

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Environment (development/production) |
| `PORT` | Server port (default: 3001) |
| `DB_HOST` | Database host |
| `DB_PORT` | Database port |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `CLIENT_URL` | Frontend URL for CORS |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

## Docker Commands

```bash
# Start development services
cd backend && docker compose -f docker-compose.dev.yml up -d
cd frontend && docker compose -f docker-compose.dev.yml up -d

# View logs
docker logs notely-backend-dev -f
docker logs notely-frontend-dev -f

# Rebuild after package changes
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d

# Reset database
cd backend && docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d

# Run database migrations
docker exec notely-backend-dev npm run db:push
```

## CI/CD

GitHub Actions pipelines for both frontend and backend:

1. **Lint** - ESLint check
2. **Typecheck** - TypeScript validation
3. **Build** - Production build
4. **Docker** - Build and push image to Docker Hub (on main branch)

### Required GitHub Secrets
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub access token

## License

MIT
