# Notels - Kanban Board Application

A modern, full-stack Kanban board application built with React, Express, and MySQL.

## Features

- User authentication (Register/Login with JWT)
- Create and manage multiple boards
- Kanban columns with drag-and-drop tasks
- Task management with:
  - Priority levels (Low, Medium, High)
  - Due dates
  - Custom labels/tags
  - Descriptions
- Light/Dark mode toggle
- Snappy animations with Framer Motion
- Fully containerized with Docker

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Framer Motion for animations
- @hello-pangea/dnd for drag-and-drop
- React Router for navigation
- Axios for API calls

### Backend
- Express with TypeScript
- Drizzle ORM
- MySQL 8 database
- JWT authentication with httpOnly cookies
- Zod for validation

## Getting Started

### Prerequisites
- Docker and Docker Compose installed

### Running the Application

1. Clone the repository and navigate to the project folder:
```bash
cd notels
```

2. Start all services with Docker Compose:
```bash
docker-compose up --build
```

3. Wait for all containers to start. You'll see:
   - MySQL database on port 3306
   - Express server on port 3001
   - Vite dev server on port 5173

4. Open your browser and navigate to:
```
http://localhost:5173
```

5. Register a new account and start creating boards!

## Project Structure

```
notels/
├── docker-compose.yml          # Docker orchestration
├── client/                     # React Frontend
│   ├── Dockerfile
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── context/            # React contexts
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   └── types/              # TypeScript types
│   └── ...
└── server/                     # Express Backend
    ├── Dockerfile
    ├── src/
    │   ├── db/                 # Database config & schema
    │   ├── routes/             # API routes
    │   ├── middleware/         # Express middleware
    │   └── utils/              # Utility functions
    └── ...
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Boards
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create board
- `GET /api/boards/:id` - Get board with columns and tasks
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Columns
- `POST /api/boards/:boardId/columns` - Create column
- `PUT /api/boards/columns/:id` - Update column
- `DELETE /api/boards/columns/:id` - Delete column

### Tasks
- `POST /api/tasks/columns/:columnId/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/move` - Move task (drag-drop)
- `DELETE /api/tasks/:id` - Delete task

### Labels
- `GET /api/boards/:boardId/labels` - Get board labels
- `POST /api/boards/:boardId/labels` - Create label
- `DELETE /api/boards/labels/:id` - Delete label

## Environment Variables

### Server
- `DB_HOST` - Database host (default: db)
- `DB_PORT` - Database port (default: 3306)
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `CLIENT_URL` - Frontend URL for CORS

### Client
- `VITE_API_URL` - Backend API URL

## Development

### Running without Docker

**Server:**
```bash
cd server
npm install
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```

Make sure to have MySQL running locally and update the environment variables accordingly.

## License

MIT
