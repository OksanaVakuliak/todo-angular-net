# Final QA Report — Assignment Requirements

Verification pass for milestone **M4 — Integration, QA, Delivery** (issue #18).
Date: 2026-06-09. Branch: `chore/18-final-qa-assignment-requirements`.

This report verifies every assignment requirement against the actual code and
records the outcome of the build/test runs and any remaining gaps before
submission.

## How this was verified

| Check | Command | Result |
| --- | --- | --- |
| Backend builds | `dotnet build TodoApp.sln -c Release` | ✅ Pass (0 warnings, 0 errors) |
| EF migrations resolve | `dotnet ef migrations list` (design-time build) | ✅ 3 migrations, build succeeds |
| Frontend unit tests | `ng test --watch=false --browsers=ChromeHeadless` | ✅ 33/33 pass |
| Frontend production build | `ng build` | ✅ Pass (2 non-blocking SCSS budget warnings) |
| Full stack runs | `docker compose up -d --build` (SQL Server + backend + frontend) | ✅ All containers up; `/api/health` → `{"status":"ok","database":"available"}` |
| Backend API end-to-end | live `curl` scenario against `http://localhost:8080` | ✅ All steps pass (see below) |
| Frontend UI smoke | browser login + tasks page against `http://localhost:4200` | ✅ Login, list, filters, pagination render against live data |

## Runtime end-to-end verification

Run against the live Docker stack (real SQL Server + EF Core), exercising the
full request path including HttpOnly cookie auth.

### Backend API scenario (all passed)

| Step | Expectation | Result |
| --- | --- | --- |
| Register new user | 201 + access/refresh HttpOnly cookies set | ✅ |
| Login / `/me` with cookie / `/me` without cookie | 200 / 200 / 401 | ✅ |
| Create category, create 3 tasks | 201 each | ✅ |
| List `?page=1&limit=2` then `?page=2&limit=2` | page 1 → 2 items, page 2 → 1 item, `totalItems:3, totalPages:2` | ✅ |
| Search `?search=milk` | exactly 1 matching task | ✅ |
| Filter `?categoryId=<Work>` | 2 tasks, `categoryName`/`categoryColor` populated | ✅ |
| PATCH task (complete + retitle) | fields updated, `updatedAt` advanced | ✅ |
| DELETE task then GET it | 204 then 404 | ✅ |
| DELETE category | 204; tasks preserved with `categoryId` cleared to null | ✅ |
| Logout then `/me` | 204 then 401 | ✅ |

### Frontend UI smoke (all passed)

Logged in through the browser at `:4200`; redirected to `/tasks`; the list
rendered the same data created via the API (proving the `:4200/api/*` proxy,
cookie handling, and interceptor all work). Search box, category filter,
pagination summary ("Showing 1-2 of 2"), per-task complete/edit/delete controls,
and the delete-confirmation dialog all present and wired. The only console
entries are expected `401`s from the anonymous `/api/auth/me` + `/refresh`
session probes on the public landing page — normal guard behaviour, not errors
in the app.

## Requirement checklist

### Functional requirements

| # | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Task CRUD | ✅ Pass | `TasksController` (GET list, GET id, POST, PATCH, DELETE); `TaskItemService` create/get/list/update/delete with per-user ownership enforced on every operation |
| 2 | Categories | ✅ Pass | `CategoriesController` + `CategoryService` full CRUD; name uniqueness per user; deleting a category clears `CategoryId` on its tasks |
| 3 | Authentication (login/logout) | ✅ Pass | `AuthController` (`/login`, `/logout`, `/me`, `/refresh`); JWT in HttpOnly cookies; PBKDF2-SHA256 password hashing; logout revokes the server-side session |
| 4 | Pagination | ✅ Pass | `TaskItemRepository.ListByUserAsync` — `Skip/Take` with separate `CountAsync`; `PagedResultDto` returns items, page, limit, total; query validated (page 1–1,000,000, limit 1–100) |
| 5 | Search | ✅ Pass | Title/Description `Contains` filter in `ListByUserAsync` (null-safe on description; max 200 chars) |
| 6 | Filter by category | ✅ Pass | Optional `CategoryId` filter in `ListByUserAsync`, composed with search + pagination |

### Technical requirements

| # | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| 7 | EF Core code-first + migrations | ✅ Pass | `TodoAppDbContext` with `TaskItem`/`Category`/`User`/`UserSession` entities, indexes and relationships; 3 tracked migrations; applied on startup via `DatabaseInitializer.InitializeDatabaseAsync` (`Program.cs:112`) |
| 8 | Dependency Injection | ✅ Pass | `AddApplicationServices()` and `AddDataAccessServices()` wire interfaces → implementations (scoped services/repositories, scoped `DbContext`, singleton crypto helpers) |
| 9 | 4-layer backend architecture | ✅ Pass | `TodoApp.Api` (Controllers) → `TodoApp.Services` → `TodoApp.Interfaces`; `TodoApp.DataAccess` → `TodoApp.Interfaces`; `TodoApp.Interfaces` has no internal references. Controllers depend only on `TodoApp.Interfaces.Services` abstractions. See note below on the Api → DataAccess reference. |
| 10 | Frontend on Angular | ⚠️ Pass with deviation | Angular standalone components, lazy `loadComponent` routing, auth/shell layouts, route guards, HTTP interceptor for credentials + 401 refresh — all features wired to the backend API. **However the UI library is Angular Material, not Bootstrap or Tailwind as the requirement names** (see "Requirement deviation to flag"). |

## Notes on architecture findings

- **`TodoApp.Api` references `TodoApp.DataAccess`.** This reference exists only
  in the composition root: `Program.cs` calls `AddDataAccessServices()` to
  register the DbContext/repositories and `InitializeDatabaseAsync()` to apply
  migrations on startup. The controllers and services themselves depend only on
  `TodoApp.Interfaces` abstractions, so runtime layering is clean. Wiring DI and
  migrations from the startup project is the standard ASP.NET composition-root
  pattern and is considered acceptable for this 4-layer design — not a layering
  violation.

- **Category data in task list/detail responses is loaded correctly.** The
  repository projects navigation properties inside a `.Select(...)`
  (`taskItem.Category.Name`/`.Color`), which EF Core translates to a SQL LEFT
  JOIN. No `.Include()` is required for projections, so `CategoryName`/
  `CategoryColor` are populated despite `AsNoTracking()`. Verified directly.

## Requirement deviation to flag

- **Frontend UI library: Angular Material, not Bootstrap or Tailwind.** The
  assignment states *"Front — Angular (use bootstrap or tailwind)"*. The app uses
  `@angular/material` + `@angular/cdk` for its component library and hand-written
  SCSS with CSS custom properties for theming; there is no Bootstrap or Tailwind
  dependency (`package.json` has neither; the only `bootstrap` string in the
  codebase is Angular's `bootstrapApplication`). Angular Material is a mainstream,
  legitimate choice and the UI is complete and polished, but it does not match the
  literal wording of the requirement. **Decision needed before submission:** confirm
  with the reviewer that Material is acceptable, or swap the component layer to
  Bootstrap/Tailwind if the wording is binding.

## Remaining gaps (documented, non-blocking for submission)

1. **No automated backend tests.** The frontend has 33 passing unit tests, but
   the backend has no unit/integration test project. The README lists `tests/`
   as *planned*; it does not yet exist. Recommended as a post-submission
   follow-up (service-layer + repository tests against an in-memory or
   Testcontainers SQL Server).

2. **SCSS bundle-budget warnings.** `tasks-page.component.scss` (6.37 kB) and
   `categories-page.component.scss` (4.70 kB) exceed the default 4 kB per-file
   budget. The build still succeeds; these are cosmetic warnings. Either trim
   the styles or raise the budget in `angular.json`.

3. **Frontend component tests are service-focused.** Spec coverage is strong for
   services, guards, the interceptor and routing, but the page components
   (tasks/new/edit/categories pages) have no component-level tests. Optional
   hardening, not a requirement gap.

## Conclusion

All assignment requirements — task CRUD, categories, authentication
(login/logout), pagination, search, category filtering, EF Core code-first with
migrations, dependency injection, the 4-layer backend architecture, and an
Angular frontend — are implemented and verified both statically and at runtime
against the live Docker stack. The backend builds clean, the frontend builds,
all 33 frontend tests pass, and every functional flow was exercised end-to-end
through the real API and the browser UI.

The one item that does not match the assignment wording is the **frontend UI
library (Angular Material instead of Bootstrap/Tailwind)** — functionally
complete, but a decision is needed on whether the literal requirement is binding.
The other gaps (no backend test project, two cosmetic SCSS budget warnings,
service-focused frontend specs) are documented and do not block submission.
