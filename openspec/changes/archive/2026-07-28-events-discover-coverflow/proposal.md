## Why

The public `/events` discovery page currently leads with a map. Visitors browsing by vibe and imagery get more value from a visual cover-flow of event photos (Amicro-style) than from geographic markers. Replacing the map with an image carousel makes discovery more brand-forward and aligns the top of the page with “Ver evento” → detail navigation.

## What Changes

- **Replace** the discovery map at the top of `/events` with a 3D cover-flow carousel of event images.
- Carousel slides use the **first image** of each event in the current filtered result set (loaded pages); events without images are skipped.
- Activating a slide **navigates** to `/events/$documentId` (same destination as “Ver evento”).
- **Remove** the discover map UI and map-selection / pan-focus behavior from the discovery page (and delete unused map code once unused).
- Add a pinned motion dependency (`framer-motion` or `motion`) in `apps/web` to power the cover-flow animation.
- Adjust i18n: carousel aria/labels; drop map-only discover copy that becomes unused.

## Non-goals

- No API, DB, or validator changes (catalog payload already includes `images`).
- No map elsewhere on discover (map is removed entirely from this page).
- No dashboard or ticket-purchase UI.
- No swipe/gesture polish beyond prev/next + dots + click-to-activate (as in the Amicro sample).
- Not requiring all event images in the carousel (only the first per event).
- Not building a shared cover-flow in `@repo/ui` unless it already fits; prefer a discover-local component first.

## Capabilities

### New Capabilities

- _(none)_

### Modified Capabilities

- `public-events-discovery`: Replace the “Map of filtered events” requirement with an image cover-flow requirement; update layout wording so filters/list sit below the carousel instead of the map; remove map-marker / list→map focus scenarios.

## Impact

- **Apps:** `apps/web` (discover page, new cover-flow component, remove `events-discover-map`, simplify list selection props).
- **Packages:** `packages/i18n` (discover carousel keys; prune unused map keys if nothing else uses them). Event detail map (if any) is out of scope and keeps its own keys.
- **Dependencies:** pin `framer-motion` (or `motion`) on `@repo/web`.
- **API / db / validators / dashboard:** none.
