# To-Do Application

Test assignment for building a task management application similar to Microsoft To Do.

## Project Goal

Build a full-stack application with:

- task CRUD
- task categories
- authentication (`login/logout`)
- pagination for task lists
- search and filtering by category

## Tech Stack

### Backend

- `.NET`
- `ASP.NET Core Web API`
- `Entity Framework Core`
- `Microsoft SQL Server`
- `Dependency Injection`

### Frontend

- `Angular`
- `Bootstrap` or `Tailwind CSS`

### Infrastructure

- `Docker`
- `Docker Compose`

## Planned Architecture

The backend will follow a 4-layer structure:

1. `Controllers`
2. `Services`
3. `Interfaces`
4. `Data Access`

The database will be managed with `EF Core Code First` and `Migrations`.

## Planned Features

### Core Features

- Create tasks
- View task list
- Edit tasks
- Delete tasks
- Add categories to tasks

### User Features

- Login
- Logout

### List Features

- Pagination
- Search
- Filter by category

## Development Plan

The project is tracked in GitHub Project with milestones:

- `M1 - Foundation & Architecture`
- `M2 - Backend API`
- `M3 - Frontend UI`
- `M4 - Integration, QA, Delivery`

## Local Development

The project will use:

- local `SQL Server` in Docker
- backend migrations via `EF Core`
- Angular frontend running locally during development

Detailed setup steps will be added as implementation progresses.

## Repository Structure

```text
TodoApp.sln
src/
  backend/
    TodoApp.Api/
    TodoApp.Services/
    TodoApp.Interfaces/
    TodoApp.DataAccess/
  frontend/
    todo-ui/
# tests/ (planned)
```

## Repository Status

Current status:

- project planning completed
- GitHub issues created
- repository bootstrap in progress

## Next Steps

1. Initialize `.NET` solution and backend projects
2. Initialize Angular application
3. Configure SQL Server in Docker
4. Add EF Core and first migration
5. Implement authentication and task management features
