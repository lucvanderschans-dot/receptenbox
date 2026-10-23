# Receptenbox: projectplan

> Locatie in de repo: `docs/PLAN.md`. Dit document is levend: werk het bij als je keuzes verandert.

## 1. Doel

Een webapp voor mij en mijn huisgenoten waarin we recepten bewaren, bijhouden wat er in huis is, zien wat we daarmee kunnen koken en samen één boodschappenlijst delen.

Tweede doel: leren hoe je een applicatie op productieniveau bouwt (auth, database, CI/CD, hosting, monitoring, back-ups).

## 2. Gebruikers

- Ik en mijn huisgenoten (klein, vertrouwd, maar data moet wel per huishouden gescheiden zijn).
- Later eventueel familie of vrienden met een eigen huishouden.

Gevolg: multi-tenant vanaf dag één. Elke rij data hoort bij een huishouden.

## 3. MVP (versie 1.0)

1. Registreren, inloggen, uitloggen
2. Huishouden aanmaken en huisgenoten uitnodigen
3. Recepten toevoegen, bewerken, verwijderen en bekijken (titel, bereiding, porties, ingrediënten met hoeveelheid en eenheid)
4. Voorraad ("wat is er in huis") bijhouden
5. "Wat kan ik koken?": recepten sorteren op hoeveel ingrediënten ik al heb
6. Gedeelde boodschappenlijst (afvinken, ontbrekende ingrediënten van een recept toevoegen)

## 4. Na de MVP

- Receptimport via URL
- Porties schalen
- Live synchronisatie van de boodschappenlijst
- Foto's bij recepten
- Installeerbaar als PWA op de telefoon
- AI-suggesties

## 5. Expliciet niet in scope

- Sociale functies, publieke recepten, reacties
- Voedingswaarden en caloriën
- Native mobiele apps
- Betalingen

## 6. Techstack

| Onderdeel | Keuze |
|---|---|
| Framework | Next.js (App Router) + TypeScript (strict) |
| Package manager | pnpm |
| Database | PostgreSQL |
| ORM en migraties | Drizzle |
| Auth | Better Auth |
| Validatie | Zod |
| Unit tests | Vitest |
| End-to-end tests | Playwright |
| Kwaliteit | ESLint + Prettier |
| CI/CD | GitHub Actions |
| Lokale omgeving | Docker Compose (Postgres) |
| Hosting | Vercel (app) + Neon (Postgres), later eventueel zelfbeheerd |
| Monitoring | Sentry |

Keuzes mogen later herzien worden, maar leg elke wijziging vast in `docs/DECISIONS.md` met reden.

## 7. Datamodel (eerste opzet)

- `users`: account (beheerd door auth-library)
- `households`: naam, aangemaakt op
- `household_members`: user, huishouden, rol (`owner` of `member`)
- `household_invites`: huishouden, token, verloopt op
- `recipes`: huishouden, titel, bereiding, porties, bron-URL, aangemaakt/gewijzigd
- `ingredients`: genormaliseerde ingrediëntnaam (per huishouden)
- `recipe_ingredients`: recept, ingrediënt, hoeveelheid, eenheid
- `pantry_items`: huishouden, ingrediënt, hoeveelheid, eenheid
- `shopping_list_items`: huishouden, ingrediënt/tekst, afgevinkt, toegevoegd door

Regel: elke tabel met gebruikersdata heeft een `household_id`, en elke query filtert daarop.

## 8. Niet-functionele eisen

- **Beveiliging:** geen secrets in Git, input-validatie met Zod op elke server-grens, rate limiting op login, autorisatie-checks in een centrale laag
- **Privacy:** account en bijbehorende data kunnen verwijderen, zo weinig persoonsgegevens als mogelijk
- **Betrouwbaarheid:** dagelijkse back-ups, hersteltest uitgevoerd, foutmonitoring aan
- **Onderhoudbaarheid:** tests voor kernlogica en autorisatie, CI moet groen zijn om te mergen
- **Prestaties:** pagina's laden onder 2 seconden op een gewone verbinding

## 9. Fasering

| Fase | Inhoud | Klaar als |
|---|---|---|
| 0 | Repo, CLAUDE.md, PLAN.md, branch protection | Repo staat, main is beschermd |
| 1 | Projectskelet: Next.js, TypeScript, lint, Vitest | `pnpm dev`, `pnpm test`, `pnpm build` werken |
| 2 | Docker + Postgres + Drizzle + eerste migratie | App praat met lokale database |
| 3 | CI-pipeline | Pull requests draaien lint, typecheck, test, build |
| 4 | Eerste deploy (leeg) | App draait op een echte URL met productiedatabase |
| 5 | Auth + huishoudens + autorisatietests | Gebruiker kan inloggen, ziet alleen eigen huishouden |
| 6 | Recepten (MVP-feature 3) | CRUD werkt, getest |
| 7 | Voorraad en "wat kan ik koken?" | Matching werkt, getest |
| 8 | Boodschappenlijst | Gedeeld, afvinkbaar |
| 9 | Productie-klaar: Sentry, back-ups, security headers, eigen domein | Checklist hieronder afgevinkt |
| 10 | Post-MVP features | Per stuk in eigen branch |

## 10. Productie-checklist (fase 9)

- [ ] Eigen domein met HTTPS
- [ ] Staging en productie gescheiden (database en secrets)
- [ ] Back-ups aan en één keer succesvol hersteld
- [ ] Sentry ontvangt een testfout
- [ ] Rate limiting op login en registratie
- [ ] Security headers gecontroleerd
- [ ] 2FA aan op GitHub, hosting, database-provider en domeinregistrar
- [ ] Dependabot aan
- [ ] Accountverwijdering werkt
- [ ] README en runbook ("wat als de site down is?") geschreven

## 11. Werkwijze

- Elke wijziging in een eigen feature-branch en pull request, ook als ik alleen werk
- Kleine commits met duidelijke berichten
- Claude Code maakt eerst een plan, ik review, dan pas code
- Ik lees alle code rond auth, autorisatie en databasequery's zelf na
- Eén fase tegelijk afmaken

## 12. Open vragen

- Hoe normaliseer ik ingrediënten ("tomaat" vs "tomaten")? Begin simpel, verbeter later.
- Eenheden omrekenen (g/kg, ml/l): in MVP alleen exacte eenheid matchen?
- Hosting op termijn: blijf ik bij Vercel of ga ik leren met een VPS en Docker?
