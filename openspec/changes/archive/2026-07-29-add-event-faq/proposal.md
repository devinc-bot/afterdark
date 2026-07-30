## Why

Event organizers need a way to answer recurring visitor questions (dress code, age policy, refunds, arrival) on the public event page. Without structured FAQs, that content either bloats the description or never reaches attendees. Adding optional, ordered Q&A on each event improves clarity on the public detail page and keeps authoring inside the existing dashboard create/edit flow.

## What Changes

- Add a new `event_faqs` table (FK to `events`) storing question, answer, and display order per event.
- Extend event create/update validators, types, repositories, and API payloads so owners can manage FAQ items with the event.
- Extend the dashboard event form (`/events/new` and `/events/:documentId/edit`) with an optional FAQ section (add / edit / reorder / remove).
- Extend the public event detail API and `/events/$documentId` page to return and render FAQs with the shared Accordion from `@repo/ui` when the list is non-empty.
- Add Spanish (+ EN parity) UI copy for section labels, empty hints, and actions via `@repo/i18n`.

### Non-goals

- Per-locale FAQ content (no bilingual FAQ rows; organizers write free text).
- Standalone FAQ CRUD endpoints outside event create/update.
- FAQ on the public events catalog/list or cover-flow.
- AI-generated answers, templates, or suggested questions.
- Rich-text / markdown answers (plain text only in v1).
- FAQ search, analytics, or public voting.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `event-authoring`: Event create/edit form and validated payloads include an optional ordered list of FAQ items (question + answer), persisted in a dedicated table related to the event.
- `public-events-discovery`: Public single-event detail API includes FAQ items; the detail page shows them in an Accordion when present and omits the section when empty.

## Impact

- **packages/db** — new `event_faqs` schema + migration; create/update/read event repositories load and replace FAQ rows.
- **packages/validators** / **packages/types** — FAQ item schemas and DTO/repository types on event create/update/detail.
- **apps/api** — event mappers/services pass FAQ through owner and public detail responses.
- **apps/dashboard** — FAQ editor section on event form pages (`new` / `edit`).
- **apps/web** — Accordion FAQ block on public event detail.
- **packages/ui** — reuse existing `accordion` (no new component required).
- **packages/i18n** — events locale keys for FAQ UI chrome (ES + EN).

### Assumptions (AskQuestion unavailable in this session)

Documented so review can override before `/opsx:apply`:

1. FAQs are **optional**; empty list is valid.
2. Max **20** items per event; question/answer length capped in `@repo/validators` (not restated here).
3. On update, the submitted FAQ list **replaces** the event’s rows (delete missing, insert/update by order) inside the same write path as the event.
4. Display order is an integer `sortOrder` (0-based); dashboard can reorder.
5. Deleting an event cascades (or equivalent cleanup) so orphan FAQ rows are not left behind.
6. Public detail shows FAQ **after** description and **before** the tickets placeholder / venue gallery / map (single section, one heading).
