# HRMS - Human Resource Management System

Full-stack application for managing employees and teams with authentication and audit logging.

## Tech Stack

- **Backend**: Node.js, Express, Sequelize, PostgreSQL
- **Frontend**: React, React Router, Axios
- **Deployment**: Render (Backend + DB), Vercel (Frontend)

## Features

- Organisation account creation
- User authentication (JWT)
- Employee CRUD operations
- Team CRUD operations
- Many-to-many employee-team relationships
- Comprehensive audit logging
- Responsive UI

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL
- Git

### Backend Setup

- cd backend
- npm install
- createdb hrms_db
- cp .env.example .env

- Edit .env with your database credentials
- npm run dev


### Frontend Setup

- cd frontend
- npm install
- cp .env.example .env

- Edit .env with backend URL
- npm start


## Deployment

### Backend (Render)

1. Create PostgreSQL database on Render
2. Create Web Service pointing to `backend` directory
3. Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
4. Deploy

### Frontend (Vercel)

1. Create new project from GitHub
2. Set root directory to `frontend`
3. Add `REACT_APP_API_BASE_URL` environment variable
4. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register organisation
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Employees
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Teams
- `GET /api/teams` - List all teams
- `GET /api/teams/:id` - Get team
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:teamId/assign` - Assign employee
- `POST /api/teams/:teamId/unassign` - Unassign employee
- `GET /api/teams/logs` - Get audit logs

## Live URLs

- **Frontend**: [https://your-app.vercel.app](https://hrms-backend-uuhw.onrender.com/)
- **Backend**: [https://your-app.onrender.com](https://frontend-44wvuvbc2-agrim-kumars-projects.vercel.app/login)
