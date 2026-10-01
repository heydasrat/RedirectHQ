# RedirectHQ Frontend

The RedirectHQ frontend is a responsive single-page application for creating and managing short links and account settings.

## Overview

This React application provides the browser interface for RedirectHQ. It communicates with the separate Express API for authentication, link management, profile updates, and saved appearance preferences. The frontend does not store authentication tokens in JavaScript; it sends credentialed requests to the API.

## Features

- Register and sign in with a username or email and password.
- Restore an existing session on application startup and refresh expired access tokens through the API.
- Protect the dashboard, links, and settings routes.
- Create short links, search the user's links, inspect details, edit destinations, delete links, and view aggregate click counts.
- Update profile details, upload or remove a JPEG profile image, change a password, and save a light/dark appearance preference.
- Responsive navigation with a quick-link shortener and account menu.
- Shared loading, error, empty, and modal states.

Password recovery, email verification, OTP, collections, and historical analytics pages are not implemented in the current frontend.

## Tech Stack

- React 19 and JavaScript (ES modules, JSX)
- Vite 8
- React Router 7
- Redux Toolkit and React Redux
- Axios
- Tailwind CSS 3 with project-level CSS design tokens
- Lucide React icons
- ESLint

## Project Structure

```text
frontend/
├── public/                 # Static assets, including the favicon
├── src/
│   ├── app/
│   │   ├── features/       # Authentication and URL Redux slices
│   │   └── store/          # Redux store
│   ├── components/
│   │   ├── Axios/          # Credentialed API client and refresh handling
│   │   ├── Header/         # Responsive navigation and quick shortener
│   │   ├── Home/           # Dashboard and link actions
│   │   ├── LinksCMP/       # Searchable link list and actions
│   │   ├── Login/          # Login form
│   │   ├── Register/       # Registration form
│   │   ├── Setting/        # Profile, password, and appearance settings
│   │   └── URL/            # Link form, list, status, and modal components
│   ├── Pages/              # Route-level page wrappers
│   ├── routes/             # Guest-only and protected route guards
│   ├── utils/              # Short-link URL construction
│   ├── App.jsx             # Session bootstrap and document theme
│   ├── index.css           # Shared light/dark design system
│   └── main.jsx            # Router and React/Redux entry point
├── vite.config.js
└── vercel.json             # SPA fallback rewrite
```

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/login` | Guest-only | Sign in; authenticated users are redirected to the dashboard. |
| `/register` | Guest-only | Create an account. |
| `/` | Protected | Dashboard, link creation, aggregate stats, and link list. |
| `/links` | Protected | Search and manage the user's links. |
| `/settings` | Protected | Profile, password, avatar, and appearance settings. |
| Any other path | Public fallback | Displays the not-found page. |

The frontend has no dedicated password-reset, verification, collections, or pagination routes.

## Authentication

The app requests `GET /auth/me` during startup to restore the Redux auth state from the backend session cookies. Login and registration call the corresponding auth endpoints, then update the auth slice. Protected routes wait for session loading to finish before redirecting unauthenticated users to `/login`; guest-only routes redirect authenticated users to `/`.

The Axios client uses `withCredentials: true`. On a `401`, it makes one shared request to `/auth/refresh`, then retries the original request. If refresh fails, it clears the frontend auth and URL state. Logout calls the backend and clears the frontend auth state.

The access and refresh tokens are `HttpOnly` cookies managed by the backend; Redux contains the user profile, not token values.

## API Integration

`src/components/Axios/Axios.js` creates the shared Axios client. The API base URL is `VITE_API_URL`; if it is omitted during local development, the client uses `/v1/api` on the current origin. Requests include cookies. `src/utils/shortUrl.js` derives short-link URLs from the API URL unless an optional public short-link base is configured.

For Vercel builds, `vite.config.js` requires `VITE_API_URL` and rejects localhost URLs. The API must allow the deployed frontend origin through its CORS configuration.

## Environment Variables

Copy `.env.example` to `.env` for local development. Do not put backend credentials or secrets in frontend variables; Vite variables are included in browser assets.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Required on Vercel; optional locally | API base URL, including `/v1/api`, for example `https://your-api-domain/v1/api`. |
| `VITE_SHORT_URL_BASE` | Optional | Override short-link base, ending in `/v1/api/url/r` without a trailing slash. |

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Vite normally serves the app at `http://localhost:5173`.

## Build and Checks

```bash
npm run build
npm run lint
npm run preview
```

There is no frontend test script in `package.json`.

## Deployment

The frontend has a Vercel SPA rewrite in `vercel.json`, so client-side routes resolve to `index.html` on direct navigation and refresh.

For a separate Vercel frontend project, set the project root to `frontend`, use `npm run build`, and use `dist` as the output directory. Set `VITE_API_URL` to the deployed backend origin followed by `/v1/api` for each Vercel environment. Optionally set `VITE_SHORT_URL_BASE` if short links use a separate host. The backend must allow the exact frontend origin and support credentialed cookies.

## Backend Dependency

The frontend expects the RedirectHQ API routes under `/v1/api`. See `../backend/README.md` for the backend endpoints, environment variables, and deployment details.

## Contributing

Keep changes scoped to the frontend, preserve the API contract, and run `npm run lint` and `npm run build` before submitting a pull request. Document any new routes or environment variables.
