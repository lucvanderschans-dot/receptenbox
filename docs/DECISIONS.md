# Technische beslissingen

Elke significante keuze met datum, beslissing en reden. Nieuwste onderaan. Herzie je een keuze, voeg dan een nieuwe regel toe in plaats van de oude te wijzigen.

## 2026-10-23: Projectskelet (fase 1)

### Next.js 16 via create-next-app als basis

**Beslissing:** het skelet is gegenereerd met `create-next-app` 16.4.2 (App Router, `src/`, `@/*`-alias) in een tijdelijke map en daarna zonder demo-inhoud overgenomen. De standaardopties uit het template (`cacheComponents`, `partialPrefetching`) blijven aan.
**Reden:** de officiële config volgen houdt upgrades eenvoudig. `create-next-app` weigert een map met bestaande bestanden zoals `CLAUDE.md`.

### Tailwind CSS v4 voor styling

**Beslissing:** Tailwind CSS v4, geladen via de Turbopack-loader `@tailwindcss/turbopack` zoals het Next.js-template dat doet.
**Reden:** het is de standaard in het Next.js-ecosysteem, houdt styling dicht bij de componenten en voorkomt dat er losse CSS-bestanden ontstaan die niemand meer durft op te ruimen. Ook een leerdoel.

### Systeemlettertype in plaats van Geist

**Beslissing:** geen `next/font/google`. De app gebruikt de standaard `font-sans`-stack van Tailwind.
**Reden:** `next/font/google` downloadt het lettertype tijdens de build. Dan heeft de build netwerk nodig en kan die in CI falen. Een eigen lettertype kan later, dan zelf gehost.

### Extra TypeScript-strictheid

**Beslissing:** naast `strict` ook `noUncheckedIndexedAccess` en `noImplicitOverride`.
**Reden:** `noUncheckedIndexedAccess` dwingt een check af bij `array[i]` en `record[key]`, een veelvoorkomende bron van `undefined`-bugs. In een leeg project kost dat bijna niets. Achteraf aanzetten betekent veel code aanpassen.

### Typecheck genereert eerst route-types

**Beslissing:** `pnpm typecheck` draait `next typegen && tsc --noEmit`.
**Reden:** Next.js genereert types zoals `LayoutProps` en het bestand `next-env.d.ts`. Een losse `tsc` faalt daarom op een schone checkout, zoals in CI.

### Prettier naast ESLint

**Beslissing:** Prettier doet de opmaak en ESLint de codekwaliteit. `eslint-config-prettier` staat als laatste in de ESLint-config. `printWidth` is 100.
**Reden:** zo spreken de twee tools elkaar nooit tegen. De Tailwind-plugin voor Prettier (class-sortering) is bewust nog niet toegevoegd.

### LF-regeleindes via .gitattributes

**Beslissing:** `* text=auto eol=lf` in `.gitattributes`, en `endOfLine: "lf"` in Prettier.
**Reden:** ontwikkeling gebeurt op Windows (`core.autocrlf=true`), CI en hosting draaien op Linux. Zonder vaste regeleindes faalt `prettier --check` in CI en vervuilen CRLF-wijzigingen de diffs.

### Build-scripts van dependencies standaard uit

**Beslissing:** `allowBuilds` in `pnpm-workspace.yaml` staat op `false` voor `sharp` en `unrs-resolver`, zoals het template dat doet. Nieuwe build-scripts alleen na expliciete toestemming.
**Reden:** install-scripts zijn een bekende aanvalsroute in de supply chain. Beide pakketten werken met hun voorgebouwde binaries zonder script.

### Vitest met de ingebouwde tsconfig-paden van Vite

**Beslissing:** Vitest in een Node-omgeving, tests als `*.test.ts(x)` naast de code. De `@/`-alias loopt via `resolve.tsconfigPaths` van Vite 8. Het configbestand heet `vitest.config.mts`.
**Reden:** het pakket `vite-tsconfig-paths` is dan niet nodig. Met `.mts` laadt Vite de config als ESM zonder het hele project op `"type": "module"` te zetten. jsdom en Testing Library komen pas als er componenten met logica zijn.

### Playwright in fase 3

**Beslissing:** Playwright komt in fase 3, samen met de CI-pipeline.
**Reden:** fase 1 vraagt er niet om en de eerste echte gebruikersflow komt pas in fase 5. Zo zetten we e2e-tests één keer goed op, ook meteen in CI.

## 2026-10-27: Database (fase 2)

### node-postgres (`pg`) als driver

**Beslissing:** Drizzle praat met Postgres via `pg` (node-postgres) en een gedeelde `Pool`.
**Reden:** de meest gebruikte driver, met directe ondersteuning in Better Auth (fase 5) en werkend met Neon via een gewone verbindingsstring. Neon's serverless-driver kan later nog. Dat wordt dan een nieuwe beslissing, op basis van gemeten verbindingsproblemen.

### Lokale Postgres: `postgres:17` (Debian), niet Alpine

**Beslissing:** Docker Compose gebruikt het image `postgres:17`, gebaseerd op Debian.
**Reden:** hoofdversie 17 is de standaard bij Neon, dus lokaal en productie gedragen zich hetzelfde. Alpine gebruikt musl in plaats van glibc. Daardoor sorteren tekstvergelijkingen en collations (bijvoorbeeld voor ingrediëntnamen met accenten) anders dan op Neon, wat een bron van lastig te vinden verschillen is. Het grotere image is lokaal geen probleem.

### Database alleen op 127.0.0.1:5433

**Beslissing:** de container publiceert Postgres op `127.0.0.1:5433`, niet op `5432` en niet op alle interfaces.
**Reden:** alleen localhost voorkomt dat de database met het dev-wachtwoord vanaf het netwerk bereikbaar is. Op de dev-machine draait al een Postgres op 5432. Met dezelfde poort zou de container falen, of zou de app ongemerkt met de verkeerde database praten.

### Env-validatie met Zod, zonder waarden in foutmeldingen

**Beslissing:** `src/lib/env.ts` valideert de omgevingsvariabelen van de server (nu `DATABASE_URL`) met Zod, lui bij eerste gebruik. De foutmelding noemt alleen de naam van de variabele en de reden. De waarde en de `ZodError` zitten er nooit in, dat is getest.
**Reden:** een ontbrekende of verkeerde URL geeft zo direct een duidelijke fout in plaats van een vage verbindingsfout. `DATABASE_URL` bevat een wachtwoord en foutmeldingen belanden in logs.

### Database-client en env lui aangemaakt

**Beslissing:** `getDb()` maakt de pool pas bij het eerste gebruik aan en bewaart hem op `globalThis`.
**Reden:** `pnpm build` heeft zo geen database en geen `DATABASE_URL` nodig, wat CI en deploys eenvoudiger maakt. Door `globalThis` maakt hot reload in development niet bij elke wijziging een nieuwe pool aan.

### Schema: uuid-id's, expliciete snake_case, check-constraints

**Beslissing:** primary keys zijn `uuid` met `gen_random_uuid()`. Kolomnamen staan expliciet in snake_case in het Drizzle-schema. Eenvoudige invoerregels (zoals de lengte van een huishoudnaam) staan ook als check-constraint in de database.
**Reden:** uuid's zijn niet te raden of op te sommen in URL's. Expliciete namen maken de gegenereerde SQL voorspelbaar zonder casing-magie. De constraint is een vangnet als code ooit Zod overslaat.

### Alleen migraties, geen `drizzle-kit push`

**Beslissing:** er zijn scripts voor `db:generate`, `db:migrate` en `db:studio`, maar niet voor `push`. Gegenereerde migraties worden gecommit en nagelezen, en staan in `.prettierignore`.
**Reden:** `push` wijzigt de database zonder migratiebestand, en dat verbiedt CLAUDE.md. De bestanden in `meta/` zijn tool-output. Als Prettier ze herformatteert, ontstaat ruis bij elke nieuwe migratie.

### drizzle.config.ts laadt `.env.local` alleen als het bestaat

**Beslissing:** de config gebruikt Node's ingebouwde `process.loadEnvFile`, alleen als `.env.local` bestaat, zonder `dotenv`.
**Reden:** in CI en bij deploys komen de variabelen uit de omgeving en is er geen bestand. `loadEnvFile` overschrijft geen variabelen die al gezet zijn, dus de omgeving wint altijd.

### Health check per request via `connection()`

**Beslissing:** `GET /api/health` roept eerst `await connection()` aan, doet daarna `select 1`, en geeft alleen `{"status":"ok"}` of `{"status":"error"}` terug met `Cache-Control: no-store`. De pool heeft een verbindingstimeout van 5 seconden.
**Reden:** met `cacheComponents` prerendert Next.js een `GET`-handler tijdens de build tot hij een runtime-API raakt. Zonder `connection()` zou de build de query proberen uit te voeren. De docs raden `io()` aan voor content die mag cachen, maar een health check moet altijd een echte request afwachten. Foutdetails gaan alleen naar de serverlog. De timeout zorgt dat een onbereikbare database snel een 503 geeft in plaats van een hangende request.

### Database-integratietests in fase 3

**Beslissing:** `pnpm test` blijft zonder database draaien. De databasecode is nu alleen met mocks getest en handmatig tegen de lokale container.
**Reden:** integratietests tegen een echte Postgres horen bij de CI-pipeline (fase 3), met een Postgres-service in GitHub Actions. Zo hangt `pnpm test` nu niet af van een draaiende Docker.
