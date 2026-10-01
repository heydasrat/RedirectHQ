# RedirectHQ Backend

RedirectHQ Backend is the Express API for account authentication, short-link management, and user settings.

## Overview

The API serves JSON endpoints under `/v1/api`, stores users and short links in MongoDB through Mongoose, and redirects public short codes to validated HTTP(S) destinations. Authenticated operations use JWT cookies (with bearer-token support in the auth middleware). Profile images are uploaded to Cloudinary.

## Features

- Register and authenticate users; refresh and revoke refresh-token sessions.
- Read the current authenticated user.
- Create, list, inspect, edit, and delete user-owned short links.
- Public redirects that increment a link's click counter.
- Validate destinations as HTTP or HTTPS, reject embedded URL credentials, and limit destination length.
- Update username/full name, change passwords, save a light/dark theme preference, and upload/remove a JPEG avatar.
- Apply security headers, exact-origin credentialed CORS, authentication rate limits, request logging, and centralized API errors.
- Reuse a cached Mongoose connection in warm Vercel instances.

Email delivery, password reset, email verification, OTP, role-based admin access, click-history analytics, and paginated URL APIs are not implemented.

## Tech Stack

- Node.js with ES modules
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens and bcryptjs
- Helmet, CORS, express-rate-limit, cookie-parser, and Morgan
- Multer and Cloudinary for JPEG profile images
- dotenv
- Node's built-in test runner (`node:test`)

## Architecture

```text
backend/
├── public/                 # Local static files; Vercel serves this directory via its CDN
├── test/                   # URL validation and user serialization tests
└── src/
    ├── config/             # Environment validation and runtime configuration
    ├── controllers/        # Auth, URL, and account-setting handlers
    ├── db/                 # Cached Mongoose connection
    ├── middlewares/        # JWT authentication and Multer upload handling
    ├── models/             # User and URL schemas
    ├── routes/             # Auth, user settings, and URL route declarations
    ├── utils/              # API response/error helpers and Cloudinary operations
    ├── app.js              # Express middleware, CORS, API routes, error handling
    ├── constant.js         # MongoDB database name (`inkora`)
    └── index.js            # Local listener and Vercel Express export
```

Routes delegate to controllers; controllers use Mongoose models and shared response/error helpers. There is no separate service layer.

## API Routes

All paths below include the `/v1/api` prefix. Protected endpoints accept the access-token cookie or an `Authorization: Bearer <token>` header. Link detail/update/delete operations are scoped to the authenticated owner.

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register with `fullName`, `email`, `username`, and `password`. |
| `POST` | `/auth/login` | Public | Authenticate with `identifier` and `password`; sets access and refresh cookies. |
| `POST` | `/auth/refresh` | Refresh cookie | Validate and rotate the refresh token; sets replacement cookies. |
| `POST` | `/auth/logout` | Public / cookie-based | Revoke a matching refresh token when present and clear auth cookies. |
| `GET` | `/auth/me` | Protected | Return the current user profile. |
| `POST` | `/url` | Protected | Create a short link with `originalUrl`. |
| `GET` | `/url/r/:shortCode` | Public | Increment clicks and redirect to the saved destination. |
| `GET` | `/url/my` | Protected | List the current user's links, newest first. |
| `GET` | `/url/:shortCode` | Protected | Get details for a link owned by the current user. |
| `PATCH` | `/url/:shortCode` | Protected | Update the owned link's `originalUrl`. |
| `DELETE` | `/url/:shortCode` | Protected | Delete an owned link. |
| `PATCH` | `/user/update-profile` | Protected | Update `username`/`fullName`; accepts an optional multipart `avatar` file. |
| `PATCH` | `/user/change-password` | Protected | Change password using `oldPassword` and `newPassword`; revokes the session. |
| `PATCH` | `/user/toggle-theme` | Protected | Save `theme` as `light` or `dark`. |
| `PATCH` | `/user/delete-avatar` | Protected | Remove the stored avatar and request Cloudinary deletion. |

Successful controller responses use `{ statusCode, data, message, success }`. Errors use `{ statusCode, success: false, message }`.

## Authentication & Authorization

Passwords are hashed with bcryptjs before saving. Login issues an access JWT and a refresh JWT in `HttpOnly` cookies; the refresh token is stored on the user record. The refresh endpoint verifies both the JWT and the stored token, then rotates it. Protected routes use `verifyJWT`, which reads the access cookie or bearer header and loads the user. URL detail, update, and delete queries include the authenticated user's ID.

Cookie `Secure` behavior is enabled in production or when `COOKIE_SAME_SITE=none`; `SameSite` is controlled by `COOKIE_SAME_SITE`. When frontend and backend are cross-site, HTTPS and `SameSite=None` are required, and browser third-party-cookie policies may still affect sessions.

## Database and Models

Mongoose connects using `MONGODB_URI` and the database name `inkora` from `src/constant.js`. Connection promises are cached on `globalThis`; the configured pool maximum is five connections. In Vercel, the connection is established on API requests instead of during module import.

### User

- `username`, `fullName`, and `email`, with required values and schema constraints.
- `password`, stored as a bcrypt hash.
- `avatar.url` and `avatar.public_id` for Cloudinary profile images.
- `preferences.theme`, restricted to `light` or `dark`.
- `refreshToken`, used to validate and revoke refresh sessions.
- Mongoose timestamps (`createdAt`, `updatedAt`).

Password and refresh-token values are removed by the model's JSON transform.

### URL

- `originalUrl`, the HTTP(S) destination.
- `shortCode`, a unique generated code.
- `user`, a reference to the owning User.
- `clicks`, incremented on redirect.
- `isActive`, used to enable/disable redirects.
- Mongoose timestamps.

## Environment Variables

Copy `.env.example` to `.env` for local development. All secrets and service credentials must remain in the backend environment and must not be prefixed with `VITE_`.

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection URI; database name is selected separately as `inkora`. |
| `CORS_ORIGIN` | Yes | Comma-separated exact frontend origins allowed to make credentialed requests. |
| `ACCESS_TOKEN_SECRET` | Yes | Secret used to sign access JWTs. |
| `ACCESS_TOKEN_EXPIRY` | Yes | Access JWT expiry accepted by `jsonwebtoken` (example template: `15m`). |
| `REFRESH_TOKEN_SECRET` | Yes | Separate secret used to sign refresh JWTs. |
| `REFRESH_TOKEN_EXPIRY` | Yes | Refresh JWT expiry (example template: `7d`). |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud for profile images. |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret. |
| `COOKIE_SAME_SITE` | No | `lax`, `strict`, or `none`; defaults to `lax`. `none` also makes cookies secure. |
| `PORT` | No | Local listener port; defaults to `8000`. Not required by Vercel. |

`NODE_ENV` and `VERCEL` are runtime indicators read by the application; they are not validated as required settings. Vercel supplies its own `VERCEL` value.

## Installation and Development

```bash
cd backend
npm install
npm run dev
```

The development server uses `nodemon` and listens on `PORT` (default `8000`). It connects to MongoDB before opening the local listener.

## API Usage

Register with the fields accepted by the controller:

```bash
curl -X POST http://localhost:8000/v1/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Example User","email":"user@example.com","username":"example_user","password":"replace-me-with-a-password"}'
```

Publicly resolve an existing short code:

```bash
curl -i http://localhost:8000/v1/api/url/r/<shortCode>
```

Creating and managing links requires an authenticated access-token cookie or bearer token.

## Error Handling

Controllers use `asyncHandler` and `ApiError`. The final Express error middleware maps duplicate-key errors to `409`, Mongoose validation/cast errors to `400`, Multer upload errors to `400`/`413`, and unexpected errors to `500` (with a generic message in production). A database connection failure on an API request returns `503`. Login and registration are limited to 10 requests per 15-minute window using the default in-memory express-rate-limit store.

## Security

- Helmet security headers and credentialed CORS with an exact origin allowlist.
- Mutation requests with an `Origin` header are rejected unless that origin is allowlisted.
- Login and registration rate limiting.
- HTTP-only JWT cookies and bcryptjs password hashing.
- URL scheme, embedded credentials, and length validation before storage and redirect.
- JPEG-only avatar uploads, a 4 MB Multer limit, temporary staging, and Cloudinary storage.
- Production error responses do not expose internal messages for server errors.

## Deployment

The Express app is exported from `src/index.js`, a Vercel-supported Express entry location. When `VERCEL=1`, the entry does not call `app.listen`; the API connects to MongoDB when an API request arrives. A Mongoose connection promise is reused within warm function instances. Vercel serves files under `public/` through its CDN; Express static middleware is used only for local runs. No backend `vercel.json` is present or required by the current Express entry setup.

For a separate Vercel backend project, set the project root to `backend`, provide all required backend environment variables in Vercel, and set `CORS_ORIGIN` to the exact frontend origin(s). Do not set `PORT` for the function. If the two deployed domains are cross-site, configure `COOKIE_SAME_SITE=none` and HTTPS. MongoDB Atlas network access must permit the function to connect. The current `src/db/index.js` also overrides Node's DNS servers with `8.8.8.8` and `8.8.4.4`; this behavior is present in code and may require review if the deployment environment cannot resolve/connect to the MongoDB SRV host.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run `src/index.js` under nodemon for local development. |
| `npm start` | Run the local Node server with `src/index.js`. |
| `npm test` | Run the Node.js test suite (`node --test`). |

## Contributing

Keep changes focused, preserve the documented API contract, add tests for behavior changes, and run `npm test` before submitting a pull request. Update this README when routes, environment variables, or deployment behavior changes.

## License

`backend/package.json` declares the ISC license. A separate `LICENSE` file was not found in the repository.
