# Receptenbox

Webapp voor huishoudens om recepten te bewaren, de voorraad bij te houden, te zien wat je ermee kunt koken en samen één boodschappenlijst te delen.

Zie [docs/PLAN.md](docs/PLAN.md) voor scope, datamodel en fasering, en [docs/DECISIONS.md](docs/DECISIONS.md) voor technische keuzes.

## Vereisten

- Node.js 24 (zie `.nvmrc`)
- pnpm, in de versie uit `packageManager` in `package.json` (bijvoorbeeld via `corepack enable`)

## Aan de slag

```bash
pnpm install
pnpm dev
```

De app draait daarna op http://localhost:3000.

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

Database (Docker, Drizzle) volgt in fase 2, end-to-end tests (Playwright) in fase 3.
