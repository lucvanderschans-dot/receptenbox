# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Receptenbox: a web app for households to store recipes, track pantry contents, see which recipes they can cook, and share a shopping list. See `docs/PLAN.md` for scope, data model and phases.

This is a learning project that must be built to production standards. Prefer the correct, maintainable approach over the quick hack, and explain non-obvious decisions briefly.

## Stack

- Next.js (App Router) + TypeScript in strict mode
- pnpm
- PostgreSQL with Drizzle ORM and SQL migrations
- Better Auth for authentication
- Zod for all input validation
- Vitest (unit/integration) and Playwright (end-to-end)
- ESLint + Prettier
- Docker Compose for local Postgres
- GitHub Actions for CI
- Hosting: Vercel + Neon (see docs/PLAN.md)

## Commands

> Update this section as soon as the scaffolding exists, so it never lies.

```bash
pnpm install        # install dependencies
pnpm dev            # start dev server
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest
pnpm test:e2e       # Playwright
pnpm build          # production build
docker compose up -d   # start local Postgres
pnpm db:generate    # create a migration from schema changes
pnpm db:migrate     # apply migrations
```

Before declaring any task done, run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`, and fix failures.

## Project structure

Keep this section in sync with reality.

```
src/app/          routes, layouts, server actions
src/components/   reusable UI components
src/lib/          shared helpers (auth, config, utils)
src/db/           Drizzle schema, migrations, queries
src/server/       business logic and authorization (no UI code)
tests/            e2e tests
docs/             PLAN.md, DECISIONS.md, runbook
```

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
