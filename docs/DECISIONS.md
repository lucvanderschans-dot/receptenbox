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
