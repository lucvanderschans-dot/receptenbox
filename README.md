# Receptenbox

Webapp voor huishoudens om recepten te bewaren, de voorraad bij te houden, te zien wat je ermee kunt koken en samen één boodschappenlijst te delen.

Zie [docs/PLAN.md](docs/PLAN.md) voor scope, datamodel en fasering, en [docs/DECISIONS.md](docs/DECISIONS.md) voor technische keuzes.

## Vereisten

- Node.js 24 (zie `.nvmrc`)
- pnpm, in de versie uit `packageManager` in `package.json` (bijvoorbeeld via `corepack enable`)
- Docker met Docker Compose (voor de lokale database)

## Aan de slag

```bash
pnpm install
cp .env.example .env.local     # lokale instellingen, staat niet in Git
docker compose up -d --wait    # Postgres starten op 127.0.0.1:5433
pnpm db:migrate                # tabellen aanmaken of bijwerken
pnpm dev
```

De app draait daarna op http://localhost:3000. Op http://localhost:3000/api/health zie je of de app de database bereikt.

De database stoppen gaat met `docker compose down`. Met `docker compose down -v` gooi je ook alle lokale data weg.

## Commando's

| Commando            | Wat het doet                                |
| ------------------- | ------------------------------------------- |
| `pnpm dev`          | Ontwikkelserver starten                     |
| `pnpm build`        | Productiebuild maken                        |
| `pnpm start`        | Productiebuild serveren                     |
| `pnpm lint`         | ESLint draaien                              |
| `pnpm typecheck`    | Route-types genereren en TypeScript checken |
| `pnpm test`         | Unit tests (Vitest) eenmalig draaien        |
| `pnpm test:watch`   | Unit tests in watch-modus                   |
| `pnpm format`       | Code opmaken met Prettier                   |
| `pnpm format:check` | Controleren of alles opgemaakt is           |
| `pnpm db:generate`  | Migratie maken uit schemawijzigingen        |
| `pnpm db:migrate`   | Openstaande migraties toepassen             |
| `pnpm db:studio`    | Database bekijken in Drizzle Studio         |

End-to-end tests (Playwright) volgen in fase 3.
