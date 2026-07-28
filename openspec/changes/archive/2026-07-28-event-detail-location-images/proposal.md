## Why

Public event detail already shows the venue name, address, and map, but visitors never see photos of the place. Location galleries already exist in the product (`location_assets_lnk`, dashboard CRUD) and are unused on the anonymous detail API. Showing them in a dedicated venue section builds trust about where the event happens without mixing venue shots into the event hero carousel.

## What Changes

- Extend `PublicEventDetailResponse` with `locationImages` (same image shape as existing event images; empty array when none).
- Public event detail use case loads location image assets via the existing `findLocationImageAssetsByLocationIds` repository (no schema/migration).
- Event detail web page renders a **separate venue gallery** near the address block (before the map), reusing the detail carousel pattern when there is at least one location image; omit the section when empty.
- Add EN/ES i18n keys for the venue gallery heading / aria labels.

## Non-goals

- Merging location images into the hero event carousel.
- Changing discovery catalog payloads or coverflow.
- Uploading or editing location images from the public web.
- Dashboard, validators, or DB schema changes.
- Organizer branding, capacity, or other venue metadata beyond images.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `public-events-discovery`: public event detail API and `/events/$documentId` page MUST expose and display the linked location’s image gallery in a section distinct from the event hero carousel.

## Impact

- **packages/types** — `PublicEventDetailResponse.locationImages`
- **apps/api** — `GetPublicEventByDocumentId` use case + events mapper
- **packages/db** — reuse existing location image asset repository (no new tables)
- **apps/web** — event detail content / venue gallery UI
- **packages/i18n** — `events` locale keys (ES + EN)
- **dashboard / validators / ui package** — unaffected (carousel already in `@repo/ui`)
