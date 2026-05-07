# SportLife / sportProject

SportLife is a full-stack JavaScript application for creating, discovering and joining local sports events. The project started as an older React application and is currently being modernized into a cleaner, token-based, quality-gated full-stack project.

## Tech stack

- Frontend: React 18, React Router 6, Material UI, Formik and Yup.
- Backend: Node.js, Express, MongoDB and Mongoose.
- Authentication: JWT sessions with bcrypt password hashing.
- Quality: Jest tests, coverage reporting and SonarCloud analysis through GitHub Actions.

## Current features

- User registration and login.
- JWT-protected frontend routes.
- Session validation with `/api/session`.
- Event list and event search/filter UI.
- Event creation.
- Event detail pages by URL: `/events/:eventId`.
- Join and leave event flows.
- Creator-only event deletion.
- Editable profile page.
- Profile image persistence through the current-user API.
- Created events and joined events panels in the profile.
- Normalized frontend routes with temporary redirects from legacy URLs.
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
│  └─ App.js
├─ package.json
└─ sonar-project.properties
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
| `/faq` | FAQ page. |
| `/contact` | Contact page. |
| `/calendar` | Calendar page. |

The app also keeps temporary redirects from older routes such as `/homepage`, `/registerpage`, `/Perfil`, `/faqPage`, `/createEvent`, `/searchCard2` and `/cardDetails`.

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
| `GET` | `/api/user/:userName` | Yes + same user | Compatibility endpoint for a specific username. |

### Events

| Method | Endpoint | Auth | Description |
|---|---|---:|---|
| `GET` | `/api/events` | Yes | Lists all events. |
| `POST` | `/api/events` | Yes | Creates a new event. Creator comes from the token. |
| `GET` | `/api/events/:eventId` | Yes | Returns one event by ID. |
| `DELETE` | `/api/events/:eventId` | Yes | Deletes an event. Only the creator can delete it. |
| `POST` | `/api/events/:eventId/join` | Yes | Joins the current user to an event. |
| `DELETE` | `/api/events/:eventId/join` | Yes | Removes the current user from an event. |
| `GET` | `/api/users/me/events` | Yes | Lists events created by the current user. |
| `GET` | `/api/users/me/joined-events` | Yes | Lists events joined by the current user. |
| `GET` | `/api/user/:userName/events` | Yes + same user | Compatibility endpoint for created events. |
| `GET` | `/api/user/:userName/joinedEvents` | Yes + same user | Compatibility endpoint for joined events. |

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Backend port. |
| `MONGO_URI` | `mongodb://localhost:27017/sportlife` | MongoDB connection string. |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Allowed CORS origin. |
| `JWT_SECRET` | `local-dev-secret-change-me` | JWT signing secret. Change outside local development. |
| `PASSWORD_HASH_ROUNDS` | `10` | bcrypt hash cost. |
| `REACT_APP_API_URL` | `http://localhost:5000` | Frontend API base URL. |

## Local development

### Install dependencies

```bash
npm install
```

### Start backend

```bash
npm run server
```

### Start frontend

```bash
npm start
```

### Optional dev seed

```bash
npm run seed:dev
```

## Testing and quality

```bash
npm test
npm run test:coverage
npm run build
```

The SonarCloud workflow runs on pushes to `main` and pull requests. It installs dependencies, runs coverage, builds the project and executes the SonarCloud scan.

## Current architectural notes

The project is in a transitional but increasingly clean state:

- Frontend routes have been normalized.
- Event details are URL-driven and reload-safe.
- Event mutations are token-based instead of username-in-URL based.
- Profile data uses `/api/users/me`.
- Backend code is separated into routes, controllers, services, models and utilities.
- Tests and SonarCloud act as a quality gate for future PRs.

Known cleanup areas:

- Some compatibility endpoints still exist for user-specific event reads.
- Some legacy frontend pages/routes still exist as temporary compatibility paths.
- Some event relationships still use `userName` strings instead of `ObjectId` references.
- The project is still based on Create React App.

## Suggested next priorities

1. Remove remaining legacy frontend redirects and unused pages once confirmed unused.
2. Remove username-param compatibility endpoints in favor of `/api/users/me/...`.
3. Improve event and user data modelling with `ObjectId` references and timestamps.
4. Add event editing: `PATCH /api/events/:eventId` and creator-only edit UI.
5. Move event filtering/pagination to the backend.
6. Harden auth and security: rate limiting, better validation and production secrets.
7. Improve frontend state/data fetching with clearer hooks or React Query.
8. Improve UX with skeletons, confirmation dialogs and consistent empty states.
9. Add deployment documentation.
10. Consider migrating from Create React App to Vite after domain cleanup.

## PR discipline

- Keep PRs small and focused.
- Include tests in the same PR.
- Keep SonarCloud passing before merge.
- Prefer token-based current-user endpoints over user names in URLs.
- Avoid mixing visual redesign, backend refactors and endpoint changes in one PR.
