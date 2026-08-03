# online-course-marketplace-be

Express 5 + TypeScript API for `online-course-marketplace-fe`. Verifies Firebase ID tokens with the Firebase Admin SDK and stores the app profile (role, bio, …) in Neon Postgres via Prisma.

Scaffolded from [typescript-express-starter](https://github.com/ljlm0402/typescript-express-starter) (`default` template), with the built-in email/password JWT auth stripped out — Firebase owns identity, this service only verifies it.

## Prerequisites

- Node 20+
- A [Neon](https://neon.tech) Postgres project
- A Firebase project (the **same** one used by `online-course-marketplace-fe`) with a service account key — Firebase Console → Project settings → Service accounts → Generate new private key

## Setup

```bash
npm install          # also runs `prisma generate` (postinstall)
cp .env.example .env # fill in the values below
npx prisma migrate dev --name init
npm run dev
```

The API listens on `http://localhost:3000`, prefixed at `/api` (`online-course-marketplace-fe`'s `VITE_APP_API_URL` expects exactly this).

## Environment variables

| Variable | Source |
|---|---|
| `PORT` | `3000` (the FE dev server owns 5173) |
| `DATABASE_URL` | Neon **pooled** connection string (`-pooler`, `sslmode=require`) — used by the running app |
| `DIRECT_URL` | Neon **direct/unpooled** connection string — used by `prisma migrate`/`studio` |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | From the downloaded service account JSON. Must belong to the **same Firebase project** as the FE's `VITE_APP_FIREBASE_PROJECT_ID`, or token verification always fails |
| `ORIGIN`, `CORS_ORIGINS`, `CREDENTIALS` | CORS allow-list — must include the FE dev origin (`http://localhost:5173`) |
| `LOG_DIR`, `LOG_LEVEL` | pino logging |

## Commands

- `npm run dev` — nodemon + tsx, watches `src/**/*`
- `npm run build` — `tsc && tsc-alias` → `dist/`
- `npm start` — run the built `dist/server.js`
- `npm test` / `npm run test:watch` — vitest
- `npm run check` / `npm run lint` / `npm run format` — Biome
- `npx prisma studio` — browse the Neon `User` table
- `npx prisma migrate dev --name <name>` — new migration

### Known environment quirk

`package.json` overrides `rollup` to `@rollup/wasm-node`. Vitest's Rollup dependency ships a native binary requiring glibc ≥ 2.32; Ubuntu 20.04 (glibc 2.31, the default WSL2 Ubuntu base) doesn't have it. The WASM build sidesteps this. Safe to drop once running on a newer glibc.

## Architecture

See `CLAUDE.md` for the full auth/authorization model and conventions.
