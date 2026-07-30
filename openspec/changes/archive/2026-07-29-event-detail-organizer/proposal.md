## Why

Visitors on the public event detail page currently see the event and venue but not who is hosting it. Showing the organizer’s identity (organization brand when configured, otherwise the owner’s personal name) builds trust and makes the page feel complete — especially now that owners can set an organization name and avatar in settings.

## What Changes

- Extend the public event detail API (`GET /events/id/:documentId`) so the response includes an `organizer` object: display name, optional avatar URL, and data needed for avatar fallback initials.
- Resolve display name as: non-empty `organizationName` when present; otherwise `name` + `lastName` of the event’s owning owner (via location → owner).
- Avatar is the owner’s profile avatar asset URL when present; otherwise the UI shows initials fallback (no separate organization avatar).
- On `apps/web` `/events/$documentId`, render the organizer (avatar + name) **below the event title**, near the location name line.
- Add Spanish (+ EN) i18n copy for any new accessible label (e.g. “Organizado por”).

## Non-goals

- Organizer block on the discovery list / cover-flow.
- Dashboard event detail or authoring changes.
- Separate organization entity, org-only avatar column, or public organizer profile page / link.
- Exposing CUIT/`taxId`, phone, email, or other PII beyond display name + avatar.
- Changing organization settings authoring (already shipped).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `public-events-discovery`: Public single-event detail API and page include organizer display name and avatar (with personal-name fallback when the owner has no organization name).

## Impact

- **packages/types** — `PublicEventDetailResponse` gains an `organizer` field; repository row type for published detail may include owner avatar fields.
- **packages/db** — `findPublishedEventByDocumentId` joins owner (+ avatar asset) and returns organizer fields.
- **apps/api** — public detail use case / mapper maps organizer into the response.
- **apps/web** — organizer UI under the title on `EventDetailContent` (Avatar from `@repo/ui`).
- **packages/i18n** — `events` namespace keys for organizer label (ES + EN).
- **No** schema migration (reuses `owners.organization_name`, `owners.avatar_id`, `owners.name` / `last_name`).
