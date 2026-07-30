## 1. Types

- [x] 1.1 Add `PublicEventOrganizer` and `organizer` on `PublicEventDetailResponse`; extend `PublishedEventDetailRow` with owner organizer fields (name, lastName, organizationName, avatar URL)

## 2. Database

- [x] 2.1 Extend `findPublishedEventByDocumentId` to join owner + avatar asset and return organizer fields (no migration)

## 3. API

- [x] 3.1 Map organizer in `toPublicEventDetailResponse` / `GetPublicEventByDocumentIdUseCase` (org name vs personal name; avatar null-safe)

## 4. Web + i18n

- [x] 4.1 Add ES/EN i18n key(s) for the organizer label on event detail
- [x] 4.2 Render organizer avatar + name under the title in `EventDetailContent` (near location name; initials fallback)
