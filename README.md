# SportLife / sportProject

SportLife is a full-stack JavaScript application for creating, discovering and joining local sports events. The project started as an older React application and is currently being modernized into a cleaner, token-based, quality-gated full-stack project.

## Tech stack

- Frontend: React 18, Vite, React Router 6, Material UI, Formik and Yup.
- Backend: Node.js, Express, MongoDB and Mongoose.
- Authentication: JWT sessions with bcrypt password hashing.
- Quality: Jest tests, explicit frontend/backend test environments, coverage reporting and SonarCloud analysis through GitHub Actions.

## Current features

- User registration and login.
- JWT-protected frontend routes.
- Session validation with `/api/session`.
- Event list with backend filters and pagination.
- Event creation.
- Event detail pages by URL: `/events/:eventId`.
- Creator-only event editing through `/events/:eventId/edit` and `PATCH /api/events/:eventId`.
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
│  └─ index.js
├─ babel.config.js
├─ index.html
├─ jest.config.js
├─ package.json
├─ sonar-project.properties
└─ vite.config.js
```

Tests live next to the implementation files using `*.test.js` naming.

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
| `/events` | Event search/list page. |
| `/events/new` | Event creation form. |
| `/events/:eventId` | Event detail page loaded by event ID from the backend. |
| `/events/:eventId/edit` | Creator-only event edit form. |
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
| `POST` | `/api/register` | No | Creates a user and returns a session token. |
| `POST` | `/api/login` | No | Authenticates a user and returns a session token. |
| `GET` | `/api/session` | Yes | Validates the current JWT and returns the current user. |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| `GET` | `/api/users/me` | Yes | Returns the current user. |
| `PATCH` | `/api/users/me` | Yes | Updates editable profile fields and profile image. |

### Events

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| `GET` | `/api/events` | Yes | Lists events with optional `city`, `sport`, `date`, `page` and `limit` query parameters. |
| `POST` | `/api/events` | Yes | Creates a new event. Creator comes from the token. |
| `GET` | `/api/events/:eventId` | Yes | Returns one event by ID. |
| `PATCH` | `/api/events/:eventId` | Yes | Updates an event. Only the creator can edit it. |
| `DELETE` | `/api/events/:eventId` | Yes | Deletes an event. Only the creator can delete it. |
| `POST` | `/api/events/:eventId/join` | Yes | Joins the current user to an event. |
| `DELETE` | `/api/events/:eventId/join` | Yes | Removes the current user from an event. |
| `GET` | `/api/users/me/events` | Yes | Lists events created by the current user. |
| `GET` | `/api/users/me/joined-events` | Yes | Lists events joined by the current user. |

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

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Backend port. |
| `MONGO_URI` | `mongodb://localhost:27017/sportlife` | MongoDB connection string. |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Allowed CORS origin. |
| `JWT_SECRET` | `local-dev-secret-change-me` | JWT signing secret. Change outside local development. |
| `PASSWORD_HASH_ROUNDS` | `10` | bcrypt hash cost. |
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
- Frontend routes have been normalized and legacy redirects/placeholders have been removed.
- Event details are URL-driven and reload-safe.
- Event creation and edition share the same Formik/Yup form, while the backend enforces creator-only updates.
- Event edition prevents reducing available places below the number of already joined users.
- Current-user and event participation flows are token-based instead of username-in-URL based.
- Event user relationships are stored as `ObjectId` references while API responses expose user names for the current UI.
- Event search is backend-filtered and paginated.
- Profile data uses `/api/users/me`.
- Backend code is separated into routes, controllers, services, models and utilities.
- Tests and SonarCloud act as a quality gate for future PRs.

Known cleanup areas:

- Some production-hardening work is still pending around validation, rate limiting and payload limits.
- Event editing currently updates the core event fields; richer flows such as cancellation/status changes are still pending.
- Jest remains as the test runner for compatibility with the current test suite. A future Vitest migration can be done as a separate focused PR.

## Suggested next priorities

1. Harden auth and security: rate limiting, better validation and production secrets.
2. Add payload limits for base64 profile images.
3. Improve frontend state/data fetching with clearer hooks or React Query.
4. Improve UX with skeletons, confirmation dialogs and consistent empty states.
5. Add event lifecycle states such as open, full, cancelled and past.
6. Add deployment documentation.
7. Consider migrating Jest to Vitest once the Vite build migration is stable.

## PR discipline

- Keep PRs small and focused.
- Include tests in the same PR.
- Keep SonarCloud passing before merge.
- Prefer token-based current-user endpoints over user names in URLs.
- Avoid mixing visual redesign, backend refactors and endpoint changes in one PR.
