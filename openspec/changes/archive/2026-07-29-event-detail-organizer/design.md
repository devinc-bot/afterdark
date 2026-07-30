## Context

Public event detail (`GET /events/id/:documentId` → `apps/web` `/events/$documentId`) already returns event, address, images, location images, and FAQs. Owners can set `organizationName` and a profile `avatarId` in dashboard settings. The detail page does not yet surface who hosts the event.

Events reach owners via `events → locations.ownerId → owners`. No new tables are required.

## Goals / Non-Goals

**Goals:**

- Include organizer identity on the public detail payload and render it under the title on `apps/web`.
- Prefer organization name when present; otherwise personal `name` + `lastName`.
- Reuse owner avatar URL; initials fallback when missing.

**Non-Goals:**

- Discovery list / cover-flow organizer chips.
- Public organizer profile route or deep-link.
- Separate organization avatar column or entity.
- Exposing CUIT or contact PII.
- Dashboard UI changes.

## Decisions

### 1. Resolve display name in the API mapper (not only in the UI)

**Decision:** Repository returns raw owner fields (`organizationName`, `name`, `lastName`, `avatar` URL). Mapper builds `PublicEventOrganizer` with resolved `name` plus `avatar` and personal name fields for initials.

**Why:** One resolution rule for any future consumer; UI stays dumb.

**Alternative considered:** Resolve only in the web app — rejected so the contract documents the display name and clients stay consistent.

### 2. DTO shape

```ts
export interface PublicEventOrganizer {
  name: string
  avatar: string | null
  firstName: string
  lastName: string
}

export interface PublicEventDetailResponse {
  // …existing fields
  organizer: PublicEventOrganizer
}
```

`firstName` / `lastName` map from owner `name` / `lastName` for `getUserInitials` (already in `apps/web`). `organizer` is required on successful detail responses (every published event has a location owner).

### 3. Repository join

**Decision:** Extend `findPublishedEventByDocumentId` with `innerJoin(owners)` on `locations.ownerId` and `leftJoin(assets)` on `owners.avatarId`. Return organizer fields on `PublishedEventDetailRow` (or a nested `organizer` pick).

**Why:** Same query path as detail today; one round-trip. Inner join is safe because locations always have an owner.

**Migration:** None.

### 4. UI placement and components

**Decision:** In `EventDetailContent` header, under the `<h1>` and beside/under the location line, render a compact row: `Avatar` + “Organizado por {name}” (i18n). Use existing `getUserInitials(firstName, lastName)`.

**Why:** Matches product choice (below title, near location). Matches `NavUser` avatar patterns in `@repo/ui`.

### 5. i18n

**Decision:** Add `events:discover.detail.organizedBy` (ES: “Organizado por”, EN: “Organized by”) — or a single string with interpolation `organizedBy` → `Organizado por {{name}}`.

## Risks / Trade-offs

- **[Risk]** Empty/whitespace `organizationName` treated as “has org” → **Mitigation:** treat null/blank (after trim) as absent; use personal name.
- **[Risk]** Initials from personal names when display name is org may feel odd if names are empty → **Mitigation:** owners always have non-null `name`/`lastName` in schema; keep `?` fallback in `getUserInitials`.
- **[Trade-off]** No click-through to organizer profile — acceptable for this change; can add later without DTO break if we later add `documentId`.

## Migration Plan

1. Types → db repository join → API mapper/use case → web UI + i18n.
2. Deploy API before or with web (web must tolerate only if released together; field is additive — old web ignores it; new web requires it, so ship API first or same release).
3. Rollback: revert mapper/UI; no DB rollback.

## Open Questions

- None — placement and fallback rules confirmed with the user.
