# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **npm** (Node 20+). Dev server runs on port 8080.

- `npm run dev` — nodemon + tsx, watches `src/**/*` and `.env`
- `npm run build` — `tsc && tsc-alias` → `dist/`
- `npm start` — run the built `dist/server.js` (`NODE_ENV=production`)
- `npm test` — vitest single pass; `npm run test:watch` for watch mode
- `npm run test:unit` / `npm run test:e2e` — scope to `src/test/unit` or `src/test/e2e`
- `npm run check` — `biome check .`; `npm run lint` / `npm run format` for lint-only / write-fix
- `npx prisma migrate dev --name <name>` — new migration; `npx prisma studio` — browse Neon data

## Working principles

Apply YAGNI, KISS, DRY, SOLID. Prefer the smallest change that fits the existing patterns below over adding abstraction. When unfamiliar with a library's current API (Prisma 7 driver adapters, Firebase Admin SDK, Express 5, tsyringe, Zod), consult Context7 before writing — versions here are recent and APIs have shifted.

Code must be self-documenting: name functions, variables, and types so intent is clear without a comment. Default to no comments. Add one only when it captures a non-obvious WHY — a hidden constraint, a workaround, a subtlety a reader would otherwise miss — never to restate WHAT the code does.

## Architecture

Scaffolded from [typescript-express-starter](https://github.com/ljlm0402/typescript-express-starter)'s `default` template (Express 5, tsyringe DI, Zod, pino), with the built-in email/password JWT auth removed. Two ideas do most of the work: an **identity/authorization split** and a **layered, DI-wired** request path.

### Auth (the split model, mirrors the FE)

Identity and app-profile are two different systems, bridged at the request boundary — never in the middle.

- **Firebase** owns identity. This service never issues a token and never sees a password — `online-course-marketplace-fe`'s `src/lib/auth.tsx` talks to Firebase directly (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signInWithPopup`) and attaches the resulting ID token as `Authorization: Bearer <token>`.
- [src/middlewares/auth.middleware.ts](src/middlewares/auth.middleware.ts) is the **only** place that trusts a token: it calls `firebaseAuth.verifyIdToken()` ([src/config/firebase.ts](src/config/firebase.ts), Firebase Admin SDK) and attaches `{ uid, email, name }` to `req.user` ([src/interfaces/auth.interface.ts](src/interfaces/auth.interface.ts)). Never trust a client-supplied uid/email/role from anywhere else.
- **Prisma/Neon** owns the app profile (`role`, `bio`, …). [src/services/users.service.ts](src/services/users.service.ts)'s `getOrCreateProfile` auto-provisions a `User` row (role `USER`) keyed by Firebase `uid` on first call — there is no signup endpoint. Name splitting (`displayName` → `firstName`/`lastName`) must stay in sync with the FE's MSW mock at `online-course-marketplace-fe/src/testing/mocks/handlers/users.ts`.
- `role` is read only from the DB row, never from the Firebase token — that's what CASL authorizes against.
- There is intentionally **no auth route**. A Firebase-backed one (custom claims, session cookies) can be added later if needed; a JWT-issuing one should not come back.

### Authorization (CASL, backend is the source of truth)

- [src/config/authorization.ts](src/config/authorization.ts)'s `defineRulesFor(user)` is the **only** place CASL rules are defined. The FE does not redefine them — `toUserResponse` ([src/dtos/users.dto.ts](src/dtos/users.dto.ts)) packs them with `packRules` and ships them on every `User` response; `online-course-marketplace-fe`'s `AppProvider` builds its ability from `unpackRules(user.rules)`. Change a rule once, here.
- [src/middlewares/authorization.middleware.ts](src/middlewares/authorization.middleware.ts): `AbilityMiddleware` (after `AuthMiddleware`) resolves the profile and attaches `req.ability` + `req.profile`; `authorize(action, subject)` gates a route with `ForbiddenError.from(ability).throwUnlessCan(...)`, converted to a 403 by `ErrorMiddleware`.
- **Gotcha:** `ability.can('read', 'User')` — a subject *type*, no instance — is `true` whenever *any* conditional `read User` rule exists (CASL can't evaluate `{ id }` without a record). Route-level `authorize()` should check `'manage'` for admin-only routes, not a conditional action. For record-level checks in services, wrap the Prisma row with the `subject()` helper: `ForbiddenError.from(req.ability).throwUnlessCan('update', subject('User', row))` — plain Prisma rows have no constructor CASL can key off of otherwise.

### Layering (Controller → Service → Repository, tsyringe DI)

- `src/routes/*.route.ts` (Express `Router`, path + middleware wiring) → `src/controllers/*.controller.ts` (`RequestHandler`s wrapped in [asyncHandler](src/utils/asyncHandler.ts)) → `src/services/*.service.ts` (business logic) → `src/repositories/*.repository.ts` (Prisma queries only).
- [src/config/container.ts](src/config/container.ts) wires everything: repositories/services are constructed explicitly and registered as instances (stability first — they carry real dependencies); controllers/routes use `container.registerSingleton` + `@injectable()` (convenience first — they're thin). Follow this split for new resources.
- [src/config/prisma.ts](src/config/prisma.ts) exports the single shared `PrismaClient` (Neon driver adapter). Repositories import it directly rather than receiving it through the DI container.

### Response envelope

- Success: `res.json({ data: ... })`. Response shape is mapped through a `dtos/*.dto.ts` function (e.g. `toUserResponse`) — **must match** `online-course-marketplace-fe/src/types/api.ts` exactly (field names, and `createdAt` as epoch-ms `number`, not a `Date`). Keep both in sync when either changes.
- Errors: [src/middlewares/error.middleware.ts](src/middlewares/error.middleware.ts) emits a **flat** `{ message, details? }` — not the scaffold's original nested `{ success, error: { code, message, ... } } ` shape. This was changed deliberately: the FE's axios interceptor (`online-course-marketplace-fe/src/lib/api-client.ts`) reads `error.response.data.message` directly. Don't reintroduce nesting here without updating the FE too.
- Throw `HttpException(status, message, data?)` ([src/exceptions/http.exception.ts](src/exceptions/http.exception.ts)) from services/controllers; `ErrorMiddleware` converts anything else (including `ZodError`) into the same shape.

### Config, env

- [src/config/env.ts](src/config/env.ts) validates all env vars with Zod **at import time** (throws on missing/invalid). Adding a var means adding it to this schema, `.env.example`, and the README's env table.
- `apiPrefix` defaults to `/api` in [src/app.ts](src/app.ts) (not the scaffold's original `/api/v1`) — matches the FE's `VITE_APP_API_URL`.
- `prisma.config.ts` loads `.env` itself (`import 'dotenv/config'` — Prisma's `env()` helper does not); `DATABASE_URL` (pooled) is what the app runs on, `DIRECT_URL` (unpooled) is what migrations/CLI use.

## Conventions

- Path aliases (`@config/*`, `@controllers/*`, `@services/*`, `@repositories/*`, `@routes/*`, `@middlewares/*`, `@interfaces/*`, `@dtos/*`, `@exceptions/*`, `@utils/*`, `@/*`) are defined in `tsconfig.json` and mirrored in `vitest.config.ts` — keep both in sync when adding a new top-level `src/` folder.
- `src/generated/prisma` is generated (gitignored); never hand-edit it. Regenerate with `npx prisma generate` after any `schema.prisma` change (also runs automatically via `postinstall`).
- Tests live under `src/test/unit` and `src/test/e2e`; mock `@config/firebase`'s `firebaseAuth` rather than hitting real Firebase in tests.

## Response style (caveman)

Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

Switch level: `/caveman lite|full|ultra|wenyan`
Stop: "stop caveman" or "normal mode"

Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.
