# Backend Basic Setup

A starter **Express** API for admin authentication: login, profile, password reset (OTP + email), JWT protection, MongoDB, file uploads, and CORS for a local frontend and admin app.

Pair this with **BasicAdmin-Setup** (Vite admin on port `5173` by default).

## Stack

- **Node.js** with **Express 5** (ES modules)
- **MongoDB** via **Mongoose**
- **JWT** (`jsonwebtoken`) for access tokens and short-lived OTP cookies
- **bcryptjs** for password hashing
- **Nodemailer** for OTP and credential emails
- **Multer** for profile image uploads
- **Helmet**, **CORS**, and **cookie-parser** for security and cookies
- **Nodemon** for local reload (`npm run dev`)

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- A MongoDB database (local or Atlas) and a URI you can put in `.env`

## Getting started

```bash
npm install
cp .env.example .env   # or copy the keys below into .env
npm run dev
```

The server listens on `BACKEND_PORT` from `.env`, or **3400** if that variable is missing.

| Script         | Description                          |
| -------------- | ------------------------------------ |
| `npm run dev`  | Start with Nodemon (`index.js`)      |
| `npm test`     | Placeholder (no tests configured)    |

Health check: `GET /` returns `{ "message": "Application running sucessfully!" }`.

## Environment

Create a `.env` in this folder. Do not commit real secrets.

| Variable           | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `FRONT_URL_LOCAL`  | Allowed CORS origin for the public frontend  |
| `ADMIN_URL_LOCAL`  | Allowed CORS origin for the admin app        |
| `BACKEND_PORT`     | HTTP port                                    |
| `MONGODB_URL`      | MongoDB connection string                    |
| `IMAGE_URL`        | Base URL prepended to stored image filenames |
| `JWT_SECRET_KEY`   | Secret used to sign and verify JWTs          |
| `JWT_EXPIRY`       | Access-token lifetime (e.g. `7d`)            |
| `EMAIL_HOST`       | SMTP host                                    |
| `EMAIL_PORT`       | SMTP port (typically `587`)                  |
| `EMAIL_USER`       | SMTP username                                |
| `EMAIL_PASS`       | SMTP password                                |
| `EMAIL_FROM`       | From address on outgoing mail                |

`utils/envImporter.js` is the single place that reads these values. CORS in `index.js` uses `FRONT_URL_LOCAL` and `ADMIN_URL_LOCAL` with `credentials: true`.

## How a request is handled

1. **`index.js`** loads env, creates the Express app, and applies cookie parser, CORS, JSON/urlencoded bodies, Helmet, and static files from `public/`.
2. **`config/dbConnection.js`** connects Mongoose to `MONGODB_URL`.
3. Admin auth is mounted at **`/api/v1/admin/auth`**.
4. Controllers use **`utils/http-response.js`** so every JSON body has `success`, `data`, `message`, `http_status_code`, and `timestamp`.
5. Protected routes use **`middleware/auth.js`**:
   - `authenticateToken` — Bearer token or `token` cookie; **Admin** only
   - `authenticateOtpToken` — `otp_token` cookie after a successful OTP (password reset)
   - `userAuthenticateToken` — **User** role (ready for a public API)

## Admin auth API

Base path: `/api/v1/admin/auth`

| Method | Path                         | Auth              | What it does                                      |
| ------ | ---------------------------- | ----------------- | ------------------------------------------------- |
| POST   | `/login`                     | —                 | Email/password; Admin only; returns JWT + user    |
| GET    | `/get-profile`               | Bearer / cookie   | Current admin profile (password stripped)         |
| PUT    | `/update-profile/:id`        | Bearer + multer   | Update profile; optional `profile_pic` file       |
| POST   | `/change-password`           | Bearer            | Change password with current password             |
| POST   | `/forgot-password`           | —                 | Email a 4-digit OTP                               |
| POST   | `/verify-otp`                | —                 | Check OTP; sets `otp_token` cookie (5 minutes)    |
| POST   | `/reset-password`            | `otp_token` cookie| Set new password; clears OTP cookie               |
| POST   | `/send-otp`                  | —                 | Send email or phone OTP for verification          |
| POST   | `/verify-email-phone-otp`    | Bearer            | Confirm email/phone OTP                           |

Send the access token as `Authorization: Bearer <token>` or as a `token` cookie.

**Forgot-password flow:** `forgot-password` → `verify-otp` (cookie set) → `reset-password`.

## Seed an admin

`AdminCreation.js` inserts one Admin user. It expects `MONGODB_URL` in the environment (same as the app). Review the email, phone, and password in that file before you run it, then:

```bash
node AdminCreation.js
```

Run it only when you need a first admin; it does not upsert.

## Project layout

```
Backend-Setup/
├── index.js                 # App entry: middleware, CORS, routes, listen
├── AdminCreation.js         # One-off admin seed script
├── config/
│   ├── dbConnection.js      # Mongoose connect
│   ├── jwtConfig.js         # JWT secret and expiry from env
│   ├── emailConfig.js       # Nodemailer transporter + sendEmail()
│   └── MulterConfig.js      # Disk storage (UUID filenames)
├── middleware/
│   └── auth.js              # JWT / OTP / user role guards
├── src/
│   ├── models/UserModel.js  # User (Admin | User), email unique, image getter
│   ├── routes/admin/        # Admin auth router
│   └── controllers/adminController/
├── utils/
│   ├── envImporter.js       # Named exports of env values
│   ├── auth.js              # hash / compare / JWT / OTP
│   ├── http-response.js     # Standard JSON envelope
│   ├── multer.js            # Field maps (e.g. profile_pic → public/user)
│   ├── parseNestedBody.js   # Dot/bracket form fields → objects
│   ├── extractNestedFiles.js
│   └── imageNormalizer.js   # Strip host from image URLs before save
└── public/                  # Uploaded files (served statically)
```

## Expanding the API

1. Add a Mongoose model under `src/models/`.
2. Add a controller under `src/controllers/`.
3. Add a router under `src/routes/` and mount it in `index.js` (for example `app.use('/api/v1/...', yourRouter)`).
4. Protect with `authenticateToken` or `userAuthenticateToken` as needed.
5. For uploads, add a field map in `utils/multer.js` and a destination folder under `public/`.

Keep new env keys in `.env` and export them from `utils/envImporter.js` so config files stay consistent.
