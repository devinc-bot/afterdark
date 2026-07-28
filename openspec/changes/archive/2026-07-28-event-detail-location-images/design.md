## Context

Public event detail (`GET` by `documentId`) already loads event images via
`findEventImageAssetsByEventIds` and maps them to `PublicEventDetailResponse.images`.
The linked location row is available from `findPublishedEventByDocumentId`, but location
gallery assets (`location_assets_lnk` → `findLocationImageAssetsByLocationIds`) are only
used by the dashboard locations module today.

Product decision (confirmed): show venue photos in a **separate section** near address /
before the map — not merged into the hero carousel.

## Goals / Non-Goals

**Goals:**

- Return location gallery on the public detail payload as `locationImages`.
- Render a dedicated venue gallery on `/events/$documentId` when non-empty.
- Reuse existing DB repositories and image DTO shape; no migrations.

**Non-Goals:**

- Hero carousel merge, discovery catalog changes, public upload of venue photos.
- New validators (read-only extension of an existing response).
- Dashboard or schema changes.

## Decisions

### 1. Field name and type on `PublicEventDetailResponse`

**Decision:** Add `locationImages: EventImageResponse[]` (same shape as `images`).

**Alternatives considered:**

- Reuse `LocationImageResponse` from location DTOs — same fields, but keeps public detail
  coupled to the locations DTO module; `EventImageResponse` is already the public-web
  image contract.
- Nested `location: { name, images }` — larger **BREAKING**-ish reshape; out of scope.

### 2. API loading

**Decision:** In `GetPublicEventByDocumentIdUseCase`, after resolving the published row,
load location images with `findLocationImageAssetsByLocationIds([row.location.id])` in
parallel with event images (`Promise.all`). Map assets with the same
`toEventImageResponse` (or equivalent) used for event images. Pass through
`toPublicEventDetailResponse`.

**Migrations:** none — `location_assets_lnk` already exists.

### 3. UI placement and reuse

**Decision:** In `event-detail-content.tsx`, after the address section (still in the main
column) and before the full-width map, render a venue section when
`event.locationImages.length > 0`. Reuse `EventDetailCarousel` (or a thin wrapper) with
`images={event.locationImages}` and venue-oriented alt/aria copy via i18n. Omit the
section entirely when empty (no empty-state placeholder).

**Alternatives considered:**

- New carousel component — unnecessary duplication.
- Grid of stills instead of carousel — possible later; carousel matches existing detail
  media pattern and supports peek/parallax already shipped.

### 4. i18n

**Decision:** Add keys under `discover.detail` in `packages/i18n` ES + EN, e.g.:

- `locationGallery` — section heading (ES: e.g. “El lugar”)
- `locationCarouselAriaLabel` / `locationCarouselAlt` — a11y (use `locationName` where
  useful)

No new error messages.

## Risks / Trade-offs

- **[Risk]** Extra DB round-trip on detail → **Mitigation:** run in `Promise.all` with
  event images; same pattern as locations list.
- **[Risk]** Unarchived `event-detail-page` delta still describes detail without
  `locationImages` → **Mitigation:** this change’s ADDED requirements extend that
  behavior; archive order should merge both deltas coherently.
- **[Trade-off]** Reusing `EventDetailCarousel` ties venue media to hero visual language
  — acceptable for consistency; copy/heading keep sources distinct.

## Migration Plan

1. Ship types + API (clients ignore unknown fields until web ships).
2. Ship web + i18n.
3. Rollback: omit `locationImages` mapping / hide section; no DB rollback needed.

## Open Questions

- None (section vs merge resolved: separate section).
