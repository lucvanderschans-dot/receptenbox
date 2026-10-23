# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Receptenbox: a web app for households to store recipes, track pantry contents, see which recipes they can cook, and share a shopping list. See `docs/PLAN.md` for scope, data model and phases.

This is a learning project that must be built to production standards. Prefer the correct, maintainable approach over the quick hack, and explain non-obvious decisions briefly.

## Stack

- Next.js 16 (App Router) + TypeScript in strict mode. Next.js 16 differs from older versions; read `AGENTS.md` and the docs in `node_modules/next/dist/docs/` before using an unfamiliar API.
- Tailwind CSS v4 for styling
- pnpm (version pinned in `package.json`), Node 24
- PostgreSQL with Drizzle ORM and SQL migrations
- Better Auth for authentication
- Zod for all input validation
- Vitest (unit/integration) and Playwright (end-to-end)
- ESLint + Prettier
- Docker Compose for local Postgres
- GitHub Actions for CI
- Hosting: Vercel + Neon (see docs/PLAN.md)

## Commands

> Keep this section in sync with `package.json`, so it never lies.

```bash
pnpm install        # install dependencies
pnpm dev            # start dev server (http://localhost:3000)
pnpm lint           # ESLint
pnpm typecheck      # next typegen + tsc --noEmit
pnpm test           # Vitest, single run
pnpm test:watch     # Vitest in watch mode
pnpm format         # Prettier, write
pnpm format:check   # Prettier, check only
pnpm build          # production build
pnpm start          # serve the production build
```

Not available yet:

```bash
docker compose up -d   # start local Postgres (phase 2)
pnpm db:generate       # create a migration from schema changes (phase 2)
pnpm db:migrate        # apply migrations (phase 2)
pnpm test:e2e          # Playwright (phase 3)
```

Before declaring any task done, run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`, and fix failures.

Unit tests live next to the code they test as `*.test.ts(x)` under `src/`.

## Project structure

Keep this section in sync with reality.

```
src/app/          routes, layouts, server actions
src/lib/          shared helpers (auth, config, utils); site.ts holds app name and page titles
docs/             PLAN.md, DECISIONS.md (runbook follows in phase 9)
```

Planned, created when first needed:

```
src/components/   reusable UI components
src/db/           Drizzle schema, migrations, queries (phase 2)
src/server/       business logic and authorization, no UI code (phase 5)
tests/            Playwright e2e tests (phase 3)
```

Root config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`, `vitest.config.mts`, `pnpm-workspace.yaml` (pnpm build-script allowlist). `AGENTS.md` is managed by `next dev`; do not edit it by hand.

## Rules

### Security (non-negotiable)

- Never commit secrets, API keys, tokens or real `.env` files. Use `.env.local` (git-ignored) and keep `.env.example` with placeholder values only.
- Never read, print or ask for production credentials. Work only against local or staging resources. Never touch the production database.
- Validate all external input (forms, query params, headers, API bodies) with Zod on the server, even if the client validates too.
- Every query on user data must be scoped by `household_id`. Authorization checks live in a central place (`src/server/`), not scattered in components.
- Use parameterized queries via Drizzle. No string-built SQL.
- Do not implement own password hashing, session handling or crypto. Use Better Auth.
- Never log passwords, tokens or full request bodies.
- Add a test for every authorization rule ("user A cannot see household B's data").

### Database

- Every schema change goes through a migration. Never edit the database by hand and never edit an already-applied migration; add a new one.
- Name tables and columns in `snake_case`, English.
- Add indexes for foreign keys and common filters.

### Code style

- TypeScript strict. No `any` without a comment explaining why. No `// @ts-ignore`.
- Prefer small, focused functions and files. Keep business logic out of React components.
- Server components by default; use client components only when interactivity requires it.
- Code, identifiers and comments in English. User-facing text in Dutch.
- Handle errors explicitly; show friendly messages to users, log details server-side.

### Testing

- New business logic gets unit tests. New user flows get at least one e2e test.
- Tests must not depend on production data or external network calls; mock them.

### Git workflow

- Never commit directly to `main`. Work in a feature branch (`feat/...`, `fix/...`, `chore/...`).
- Small, focused commits using Conventional Commits (`feat: add recipe form`).
- One logical change per pull request. CI must be green before merge.
- Do not rewrite shared history (no force-push to `main`).

## How to work with me

- For anything larger than a small fix: propose a plan first and wait for approval before writing code.
- Work one phase of `docs/PLAN.md` at a time. Do not add features outside the current phase.
- Ask before adding a new dependency and say why it is needed.
- If a requirement is unclear or conflicts with these rules, ask instead of guessing.
- When finishing, summarize what changed, what was tested, and any follow-up needed.
- Record significant technical decisions in `docs/DECISIONS.md` (date, decision, reason).
