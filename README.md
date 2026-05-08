# SportLife / sportProject

SportLife is a full-stack JavaScript application for creating, discovering and joining local sports events. The project started as an older React application and is currently being modernized into a cleaner, token-based, quality-gated full-stack project.

## Tech stack

- Frontend: React 18, Vite, React Router 6, Material UI, Formik and Yup.
- Backend: Node.js, Express, MongoDB and Mongoose.
- Authentication: JWT sessions with bcrypt password hashing.
- Security: Helmet security headers, JSON payload limits, API rate limiting and production environment validation.
- Quality: Jest tests, explicit frontend/backend test environments, coverage reporting and SonarCloud analysis through GitHub Actions.

## Current features

- User registration and login.
- JWT-protected frontend routes.
- Session validation with `/api/session`.
- Event list with backend filters and pagination.
- Public event search only shows open future events that the current user has not dismissed.
- Event lifecycle states exposed in the UI: `open`, `full`, `cancelled` and `past`.
- Shared UX feedback components for loading, empty and error states.
- Shared confirmation dialog for destructive or irreversible event actions.
- Event creation.
- Event detail pages by URL: `/events/:eventId`.
- Creator-only event editing through `/events/:eventId/edit` and `PATCH /api/events/:eventId`.
- Creator-only event cancellation through `POST /api/events/:eventId/cancel`.
- Per-user event dismissal through `POST /api/events/:eventId/dismiss` for cancelled, past or owned events.
- Join and leave event flows.
- Creator-only event deletion.
- Editable profile page.
- Profile image persistence through the current-user API.
- Created events and joined events panels in the profile.
- Normalized frontend routes.
- SonarCloud workflow with tests, coverage and build validation.

## Project structure

```txt
sportProject/
├─ .github/workflows/sonarcloud.yml
├─ backend/src/
│  ├─ app.js
│  ├─ server.js
│  ├─ config/
│  ├─ controllers/
│  ├─ dtos/
│  ├─ middlewares/
│  ├─ models/
│  ├─ routes/
│  ├─ services/
│  └─ utils/
├─ public/
├─ src/
│  ├─ api/
│  ├─ components/
│  ├─ context/
│  ├─ pages/
│  ├─ theme.js
│  └─ index.jsx
├─ babel.config.js
├─ index.html
├─ jest.config.js
├─ package.json
├─ sonar-project.properties
└─ vite.config.js
```

Tests live next to the implementation files using `*.test.js` naming.

## Frontend source convention

- Use `.jsx` for React application files that render JSX: pages, components, providers and the frontend entrypoint.
- Use `.js` for non-JSX modules: API clients, utility functions, theme configuration and backend files.
- Tests can remain as `.test.js`; Jest/Babel transpiles their JSX and keeps the current test naming consistent.
- Vite and Jest resolve `.jsx` before `.js` in the frontend project, so extensionless imports continue to work while the source files follow the modern convention.

## Frontend UX components

Shared UX components live under `src/components`:

- `ConfirmDialog`: reusable confirmation modal for destructive/irreversible actions.
- `LoadingState`: consistent loading surface for pages and panels.
- `EmptyState`: consistent empty-state surface for empty event lists and missing resources.
- `ErrorState`: consistent error surface with optional recovery action.

Current destructive event actions now require confirmation before executing:

- cancel event participation;
- cancel an owned event;
- remove an event from the current user's profile;
- globally delete an owned event.

## Frontend routes

### Public

| Route | Description |
|---|---|
| `/login` | Login page. |
| `/register` | Registration page. |

### Protected

| Route | Description |
|---|---|
| `/home` | Main landing page after authentication. |
| `/profile` | Current user profile, profile image and user event panels. |
| `/events` | Event search/list page. Shows only searchable open future events. |
| `/events/new` | Event creation form. |
| `/events/:eventId` | Event detail page loaded by event ID from the backend. |
| `/events/:eventId/edit` | Creator-only event edit form. Past events can be reactivated by changing their date. |
| `/faq` | FAQ page. |
| `/contact` | Contact page. |
| `/calendar` | Calendar page. |

## Backend API

All backend routes are mounted under `/api`.

### Health

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| `GET` | `/api/health` | No | Basic health check. |

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| `POST` | `/api/register` | No | Creates a user and returns a session token. Rate limited. |
| `POST` | `/api/login` | No | Authenticates a user and returns a session token. Rate limited. |
| `GET` | `/api/session` | Yes | Validates the current JWT and returns the current user. |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| `GET` | `/api/users/me` | Yes | Returns the current user. |
| `PATCH` | `/api/users/me` | Yes | Updates editable profile fields and profile image. |

### Events

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| `GET` | `/api/events` | Yes | Lists searchable events with optional `city`, `sport`, `date`, `page` and `limit` query parameters. Only open future events are returned. |
| `POST` | `/api/events` | Yes | Creates a new event. Creator comes from the token. |
| `GET` | `/api/events/:eventId` | Yes | Returns one event by ID. |
| `PATCH` | `/api/events/:eventId` | Yes | Updates an event. Only the creator can edit it. Cancelled events cannot be edited. |
| `DELETE` | `/api/events/:eventId` | Yes | Deletes an event globally. Only the creator can delete it. |
| `POST` | `/api/events/:eventId/cancel` | Yes | Cancels an event. Only the creator can cancel it. |
| `POST` | `/api/events/:eventId/dismiss` | Yes | Hides a cancelled, past or owned event from the current user's profile/search results. Does not delete it globally. |
| `POST` | `/api/events/:eventId/join` | Yes | Joins the current user to an open event. |
| `DELETE` | `/api/events/:eventId/join` | Yes | Removes the current user from an open event. |
| `GET` | `/api/users/me/events` | Yes | Lists events created by the current user, including cancelled or past events unless dismissed by that user. |
| `GET` | `/api/users/me/joined-events` | Yes | Lists events joined by the current user, including cancelled or past events unless dismissed by that user. |

`GET /api/events` returns a paginated response:

```json
{
  "events": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

Public API responses are serialized through backend DTOs under `backend/src/dtos`. User and event responses expose only the fields consumed by the current API contract, keep `id`/`_id` compatibility, serialize internal ObjectId references to strings or public user names, and avoid leaking sensitive or Mongoose-internal fields such as `password` and `__v`.

Event responses include lifecycle metadata:

```json
{
  "status": "open",
  "baseStatus": "open",
  "canJoin": true,
  "isLocked": false
}
```

Lifecycle rules:

- `open`: persisted base status is open, date is future and there are available places. Users can join.
- `full`: derived status when an open future event has no available places. The event is visible in search/detail, but join is disabled.
- `cancelled`: persisted base status set by the creator. It is removed from public search but remains visible in created/joined profile panels until each linked user dismisses it.
- `past`: derived status when an open event date is in the past. It is removed from public search but remains visible in created/joined profile panels until dismissed. The creator can edit the date to reactivate it.

Auth, event-domain and current-user service errors include a stable `error.code` while preserving the existing top-level `message` field for frontend compatibility. Rate limit responses use `RATE_LIMITED`. Example:

```json
{
  "message": "Credenciales no validas",
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Credenciales no validas"
  }
}
```

## Backend security

- Helmet is applied globally for standard HTTP security headers.
- JSON request bodies are limited to `1mb`.
- All `/api` routes have a general rate limit of 300 requests per 15 minutes per client.
- `/api/register` and `/api/login` have a stricter rate limit of 10 requests per 15 minutes per client.
- `JWT_SECRET` must be set to a non-default value when `NODE_ENV=production`.
- `PASSWORD_HASH_ROUNDS` must be an integer greater than or equal to 4.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Runtime environment. Production enables stricter config validation. |
| `PORT` | `5000` | Backend port. |
| `MONGO_URI` | `mongodb://localhost:27017/sportlife` | MongoDB connection string. |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Allowed CORS origin. |
| `JWT_SECRET` | `local-dev-secret-change-me` | JWT signing secret. Must be changed in production. |
| `PASSWORD_HASH_ROUNDS` | `10` | bcrypt hash cost. Must be an integer greater than or equal to 4. |
| `VITE_API_URL` | `http://localhost:5000` | Frontend API base URL used by Vite. |
| `REACT_APP_API_URL` | `http://localhost:5000` | Backward-compatible fallback for older local env files. Prefer `VITE_API_URL`. |

## Local development

### Install dependencies

```bash
npm install
```

### Start backend

```bash
npm run server
```

### Start frontend with Vite

```bash
npm run dev
```

`npm start` is kept as an alias for `npm run dev`.

### Optional dev seed

```bash
npm run seed:dev
```

`seed:dev` creates or updates the local `dev` user.

For a complete lifecycle demo, run:

```bash
npm run seed:events
```

`seed:events` creates or updates demo users `dev`, `alex` and `marta` with password `Dev123`, then creates sample `open`, `full`, `cancelled` and `past` events linked across those users.

### Preview production build locally

```bash
npm run build
npm run preview
```

## Testing and quality

```bash
npm test
npm run test:coverage
npm run build
```

Jest is configured explicitly with two projects:

- `frontend`: uses `jsdom` for React/UI tests under `src/`.
- `backend`: uses `node` for backend tests under `backend/src/`.

The SonarCloud workflow runs on pushes to `main` and pull requests. It installs dependencies, runs coverage, builds the project and executes the SonarCloud scan.

## Current architectural notes

The project is in a transitional but increasingly clean state:

- Frontend build/dev tooling has been migrated from Create React App to Vite.
- React application source files that render JSX now use the `.jsx` extension.
- Frontend routes have been normalized and legacy redirects/placeholders have been removed.
- Event details are URL-driven and reload-safe.
- Event creation and edition share the same Formik/Yup form, while the backend enforces creator-only updates.
- Event edition prevents reducing available places below the number of already joined users.
- Event lifecycle status is now explicit in the API and visible on event cards/detail pages.
- Destructive event actions now use a shared confirmation dialog before executing.
- Loading, empty and error states now use shared frontend components across core event/profile flows.
- Current-user and event participation flows are token-based instead of username-in-URL based.
- Event user relationships are stored as `ObjectId` references while API responses expose user names for the current UI.
- User and event responses now pass through explicit DTOs before leaving the backend.
- Auth, event-domain and current-user service errors expose stable machine-readable codes while keeping legacy message compatibility.
- Backend applies security headers, request-size limits, rate limiting and production environment checks.
- Event search is backend-filtered and paginated.
- Profile data uses `/api/users/me`.
- Backend code is separated into routes, controllers, DTOs, services, models, middlewares and utilities.
- Tests and SonarCloud act as a quality gate for future PRs.

Known cleanup areas:

- Event lifecycle dismissal is per event/user through `dismissedBy`; if the project later needs notification history or audit trails, this should become a separate model.
- Base64 profile image storage is still transitional; external object storage or a stricter upload strategy should be considered before production use.
- Jest remains as the test runner for compatibility with the current test suite. A future Vitest migration can be done as a separate focused PR.

## Suggested next priorities

1. Improve frontend state/data fetching with clearer hooks or React Query.
2. Add deployment documentation.
3. Consider migrating Jest to Vitest once the Vite build migration is stable.

## PR discipline

- Keep PRs small and focused.
- Include tests in the same PR.
- Keep SonarCloud passing before merge.
- Prefer token-based current-user endpoints over user names in URLs.
- Avoid mixing visual redesign, backend refactors and endpoint changes in one PR.
