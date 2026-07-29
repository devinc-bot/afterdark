## 1. Types & validators

- [x] 1.1 Add FAQ item types/DTOs in `@repo/types` (create/update input + public/owner response shapes with `question`, `answer`, ordered list).
- [x] 1.2 Extend `@repo/validators` event schemas with `faqs` (item schema, max 20, default `[]`) on create/update and any public detail response schema that needs it.

## 2. Database

- [x] 2.1 Add Drizzle schema `event_faqs` (`eventId` FK → `events.id` with ON DELETE CASCADE, `question`, `answer`, `sortOrder`, base columns); export from schema index.
- [x] 2.2 Generate and apply timestamp-prefixed drizzle-kit migration for `event_faqs`.
- [x] 2.3 Update event repositories (create / update-by-documentId / reads used by owner + public detail) to persist replace-all FAQs and return them ordered by `sortOrder`.

## 3. API

- [x] 3.1 Wire FAQ through events module mappers/services so owner create/update/get and public detail responses include `faqs` (empty array when none).

## 4. i18n

- [x] 4.1 Add ES + EN events locale keys for FAQ UI chrome (dashboard section/actions/empty hint; public section heading/aria).

## 5. Dashboard

- [x] 5.1 Add FAQ editor section to the event form (add / edit / reorder / remove) used by `/events/new` and `/events/$documentId/edit`, mapped through existing form ↔ API helpers.

## 6. Public web

- [x] 6.1 Render FAQ Accordion on `/events/$documentId` from `faqs` using `@repo/ui` accordion; omit section when empty; place after description per spec.
