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

There are two ways to run the project locally:

- **Full stack in Docker** — everything (SQL Server, backend, frontend) runs in containers. Best for a quick "just run it" setup.
- **Backend and frontend locally** — only SQL Server runs in Docker, while the backend and Angular app run on the host with hot reload. Best for active development.

### Prerequisites

| Tool | Version | Used for |
| --- | --- | --- |
| [Docker](https://docs.docker.com/get-docker/) + Docker Compose v2 | latest | SQL Server, and optionally the full stack |
| [.NET SDK](https://dotnet.microsoft.com/download) | `10.0` | building and running the backend, EF Core migrations |
| [Node.js](https://nodejs.org/) | `20+` (LTS) | building and running the Angular frontend |

On Windows, the connection-string and migration commands below use Bash syntax, so run them from **Git Bash**. PowerShell equivalents are provided where it matters.

### Required Configuration

Copy the example environment file and fill in the values:

```bash
cp .env.example .env
```

`docker-compose.yml` reads these variables from `.env`. `MSSQL_SA_PASSWORD` and `JWT_SIGNING_KEY` are **required** — Docker Compose refuses to start without them.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `MSSQL_SA_PASSWORD` | yes | `ChangeMe123!` | SQL Server `sa` password. Must be strong: upper/lowercase letters, a number, and a symbol. |
| `JWT_SIGNING_KEY` | yes | local dev key | Secret key used to sign JWT auth tokens. Change before production. |
| `TODOAPP_DB_NAME` | no | `TodoAppDb` | Application database name. |
| `FRONTEND_PORT` | no | `4200` | Host port for the frontend. |
| `BACKEND_PORT` | no | `8080` | Host port for the backend API. |
| `MSSQL_PORT` | no | `1433` | Host port for SQL Server. |
| `MSSQL_PID` | no | `Developer` | SQL Server edition. |

The tracked `appsettings*.json` files intentionally keep `ConnectionStrings:DefaultConnection` empty so database credentials are never committed. The backend receives the connection string and JWT key from the environment instead.

### Full Stack in Docker

1. Create and configure `.env` as described in [Required Configuration](#required-configuration).

2. Start the full application stack:

   ```bash
   docker compose up -d --build
   ```

3. Check that the containers are running:

   ```bash
   docker compose ps
   ```

4. Open the apps:

   - Frontend: `http://localhost:4200`
   - Backend Swagger: `http://localhost:8080/swagger`
   - Health endpoint: `http://localhost:8080/api/health`

The frontend container proxies `/api/*` requests to the backend container, so the UI and API work together without extra local setup.

The SQL Server files are stored in a Docker named volume called `sqlserver-data`, so data persists between container restarts without relying on a host bind mount.

The backend applies pending EF Core migrations during startup. When `docker compose up -d --build` starts the backend after SQL Server becomes healthy, the database schema is created from the tracked migrations without manual SQL.

### Run Backend and Frontend Locally

For active development, run only SQL Server in Docker and start the backend and frontend on the host.

1. Start just the database:

   ```bash
   docker compose up -d sqlserver
   ```

2. Start the backend. The backend reads its connection string and JWT key from the environment, so set them before `dotnet run`. Use the same `MSSQL_SA_PASSWORD` and `JWT_SIGNING_KEY` values from your `.env`.

   Git Bash:

   ```bash
   export ConnectionStrings__DefaultConnection='Server=localhost,1433;Database=TodoAppDb;User Id=sa;Password=<your-password>;TrustServerCertificate=True;Encrypt=True'
   export Jwt__SigningKey='<your-jwt-signing-key>'
   dotnet run --project src/backend/TodoApp.Api/TodoApp.Api.csproj
   ```

   PowerShell:

   ```powershell
   $env:ConnectionStrings__DefaultConnection = 'Server=localhost,1433;Database=TodoAppDb;User Id=sa;Password=<your-password>;TrustServerCertificate=True;Encrypt=True'
   $env:Jwt__SigningKey = '<your-jwt-signing-key>'
   dotnet run --project src/backend/TodoApp.Api/TodoApp.Api.csproj
   ```

   The backend applies any pending migrations on startup and serves the API at `http://localhost:8080` (Swagger at `/swagger`).

3. In a separate terminal, install dependencies and start the Angular dev server:

   ```bash
   cd src/frontend/todo-ui
   npm install
   npm start
   ```

   The dev server runs at `http://localhost:4200` and proxies `/api/*` requests to the backend at `http://localhost:8080` (configured in `proxy.conf.json`), so no extra setup is needed.

### Database Migrations

EF Core CLI is tracked as a local .NET tool. Restore it before creating or applying migrations locally:

```bash
dotnet tool restore
```

The EF tooling boots the API startup project, so it needs **both** the connection string and `Jwt__SigningKey` in the environment — otherwise it fails with `JWT signing key is missing from configuration`. Use the same `MSSQL_SA_PASSWORD` and `JWT_SIGNING_KEY` values from your `.env`.

Create a migration from the repository root:

```bash
export ConnectionStrings__DefaultConnection='Server=localhost,1433;Database=TodoAppDb;User Id=sa;Password=<your-password>;TrustServerCertificate=True;Encrypt=True'
export Jwt__SigningKey='<your-jwt-signing-key>'
dotnet tool run dotnet-ef -- migrations add <MigrationName> --project src/backend/TodoApp.DataAccess/TodoApp.DataAccess.csproj --startup-project src/backend/TodoApp.Api/TodoApp.Api.csproj --output-dir Persistence/Migrations
```

Apply migrations to the local Docker SQL Server instance:

```bash
export ConnectionStrings__DefaultConnection='Server=localhost,1433;Database=TodoAppDb;User Id=sa;Password=<your-password>;TrustServerCertificate=True;Encrypt=True'
export Jwt__SigningKey='<your-jwt-signing-key>'
dotnet tool run dotnet-ef -- database update --project src/backend/TodoApp.DataAccess/TodoApp.DataAccess.csproj --startup-project src/backend/TodoApp.Api/TodoApp.Api.csproj
```

The first migration creates the EF migrations history table, and later migrations will evolve the schema from code-first model changes. To inspect what is already applied, run `dotnet tool run dotnet-ef -- migrations list` with the same project flags.

### Connection Details

- Host: `localhost`
- Port: `1433` by default, or `MSSQL_PORT` from `.env`
- Username: `sa`
- Password: `MSSQL_SA_PASSWORD` from `.env`
- Default database for the first connection: `master`

The backend container receives `ConnectionStrings__DefaultConnection` automatically through `docker-compose.yml` and targets the `sqlserver` service on the internal Docker network. The tracked `appsettings*.json` files intentionally keep `ConnectionStrings:DefaultConnection` empty so database credentials are not committed.

To run the backend directly against this database, see [Run Backend and Frontend Locally](#run-backend-and-frontend-locally).

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

- .NET solution and backend projects in place (`Api`, `Services`, `Interfaces`, `DataAccess`)
- Angular application scaffolded with auth, tasks, and categories features
- SQL Server, backend, and frontend orchestrated with Docker Compose
- EF Core code-first migrations tracked and applied on startup
- authentication (JWT) and task/category management implemented
