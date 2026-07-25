## Context

Product direction moved from nightlife-centric (“eventos nocturnos”, clubs) to **general events**, with venues already migrating toward **locations**. Harness docs still inject the old framing:

| File                           | Current bias                                                  |
| ------------------------------ | ------------------------------------------------------------- |
| `openspec/config.yaml`         | “nightlife events/ticketing platform”                         |
| `DOMAIN.md`                    | “eventos nocturnos”; entity `Club`; “Clubes” for owners       |
| `PRODUCT.md`                   | “nightlife events”; “Nocturnal” personality; “feel the night” |
| `spec/constitution/mission.md` | “eventos nocturnos”; “la noche”; “dueños de clubes”           |

Agents, OpenSpec proposals, and design skills (Impeccable via `PRODUCT.md`) inherit that bias.

No runtime code path depends on these strings; this is documentation-only.

## Goals / Non-Goals

**Goals:**

- One coherent, events-first product story across the files agents read first.
- Prefer **location** language in those files so it matches the domain rename already underway.
- Keep brand name **Repo** and allow a dark/restrained aesthetic without claiming nightlife is the product category.

**Non-Goals:**

- Code, i18n, schema, or UI copy changes.
- Rewriting legacy `spec/features/**` or archived OpenSpec changes.
- Renaming migration files or historical “nocturne/club” identifiers.

## Decisions

### 1. Scope = harness-facing context only

**Choice:** Edit `DOMAIN.md`, `PRODUCT.md`, `openspec/config.yaml`, and `spec/constitution/mission.md`.

**Why:** Highest leverage for agent/OpenSpec context. `AGENTS.md` / `ARCHITECTURE.md` already avoid nightlife framing.

**Alternative considered:** Also rewrite `spec/features/**` → rejected (legacy-on-touch rule; noise).

### 2. Location over Club in active docs

**Choice:** In `DOMAIN.md` / mission, use `Location` / ubicaciones; mention that legacy “club” naming may still appear in older specs/code until migrated.

**Why:** Aligns with `002-locations-management` and avoids teaching agents that `Club` is canonical.

**Alternative considered:** Keep “Club” until DB rename ships → rejected; docs already lag and confuse harnesses.

### 3. Soften brand personality, keep dark restraint

**Choice:** Replace “Nocturnal” / “feel the night” with events-first, editorial restraint. Keep anti-reference to nightclub-flyer aesthetics as a **ban**, not as the product thesis.

**Why:** Repo can stay dark/premium without being a nightclub app. Daytime concerts, conferences, pop-ups, etc. must feel in-scope.

**Alternative considered:** Force a bright “daytime events” redesign in PRODUCT.md → out of scope (visual redesign not requested).

### 4. OpenSpec `context` one-liner

**Choice:** `Repo — pnpm monorepo for an events and ticketing platform.`

**Why:** Short, category-neutral, matches proposal; rest of config (apps/packages) stays as-is.

### 5. No DB/migration notes

**Choice:** N/A — docs only; no drizzle-kit or i18n keys.

## Risks / Trade-offs

| Risk                                                      | Mitigation                                                                                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agents still cite old nightlife wording from legacy specs | Leave historical; AGENTS.md already says migrate on touch; optionally add a one-line note in mission/DOMAIN that legacy specs may say “club/nightlife”. |
| Brand name “Repo” still reads nocturnal                   | Accept; rename is out of scope. Docs clarify category = events in general.                                                                              |
| PRODUCT.md vs live landing still nightlife-flavored       | Landing/UI not in this change; follow-up if copy drifts.                                                                                                |

## Migration Plan

1. Apply markdown edits (single PR / session).
2. No deploy/rollback beyond git revert of those files.
3. After archive, `product-context` becomes the main OpenSpec capability for this framing.

## Open Questions

- Should `PRODUCT.md` keep “Dark is the natural state” as a hard principle for **all** surfaces, or only public brand? **Assumption for this change:** keep as-is for brand continuity; revisit only if a redesign is requested.
- Include a short note in `AGENTS.md` documentation map that product framing lives in DOMAIN/PRODUCT? **Optional**; only if review wants an extra pointer (AGENTS already links DOMAIN).
