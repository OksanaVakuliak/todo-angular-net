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

### Full Stack in Docker

1. Create a local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Update `MSSQL_SA_PASSWORD` in `.env`.
   SQL Server requires a strong password with upper/lowercase letters, numbers, and a symbol.

3. Start the full application stack:

   ```powershell
   docker compose up -d --build
   ```

4. Check that the containers are running:

   ```powershell
   docker compose ps
   ```

5. Open the apps:

   - Frontend: `http://localhost:4200`
   - Backend Swagger: `http://localhost:8080/swagger`
   - Health endpoint: `http://localhost:8080/api/health`

The frontend container proxies `/api/*` requests to the backend container, so the UI and API work together without extra local setup.

The SQL Server files are stored in a Docker named volume called `sqlserver-data`, so data persists between container restarts without relying on a host bind mount.

### Connection Details

- Host: `localhost`
- Port: `1433` by default, or `MSSQL_PORT` from `.env`
- Username: `sa`
- Password: `MSSQL_SA_PASSWORD` from `.env`
- Default database for the first connection: `master`

The backend container receives `ConnectionStrings__DefaultConnection` automatically through `docker-compose.yml` and targets the `sqlserver` service on the internal Docker network. The tracked `appsettings*.json` files intentionally keep `ConnectionStrings:DefaultConnection` empty so database credentials are not committed.

When running the backend directly from Git Bash, set the connection string through the environment before `dotnet run`:

```bash
export ConnectionStrings__DefaultConnection='Server=localhost,1433;Database=TodoAppDb;User Id=sa;Password=<your-password>;TrustServerCertificate=True;Encrypt=True'
dotnet run --project src/backend/TodoApp.Api/TodoApp.Api.csproj
```

### DBeaver

- Driver: `SQL Server`
- Host: `localhost`
- Port: `1433`
- Database: `master`
- Authentication: `SQL Server Authentication`
- Username: `sa`
- Password: value from `.env`
- Connection properties: enable certificate trust if the driver prompts for encryption settings

### SSMS

- Server name: `localhost,1433`
- Authentication: `SQL Server Authentication`
- Login: `sa`
- Password: value from `.env`
- Encryption: trust the server certificate if prompted

### Useful Commands

```bash
docker compose logs -f
docker compose stop
docker compose start
docker compose down
docker volume ls
```

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
