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
| 10 | Angular frontend | ✅ Pass | Standalone components, lazy `loadComponent` routing, auth/shell layouts, route guards (`authGuard`, `publicOnlyGuard`), HTTP interceptor for credentials + 401 refresh. Tasks/categories/auth features all wired to the backend API. |

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
migrations, dependency injection, the 4-layer backend architecture, and the
Angular frontend — are implemented and verified. The backend builds clean, the
frontend builds, and all 33 frontend tests pass. The remaining gaps above are
documented and none of them block submission.
