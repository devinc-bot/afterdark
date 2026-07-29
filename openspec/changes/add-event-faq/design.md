## Context

Events already have create/edit authoring in the dashboard and a public detail page on the web app. FAQ content is not modeled today (called out as missing in the archived event-detail redesign). Organizers need structured Q&A without stuffing the description. The Accordion in `@repo/ui` already matches the landing FAQ pattern and is the display primitive for the public detail.

## Goals / Non-Goals

**Goals:**

- Persist optional, ordered FAQ rows in a dedicated table related to `events`.
- Manage FAQs as part of event create/update (validators → API → dashboard form).
- Expose FAQs on the public detail API and render them with `@repo/ui` Accordion.
- Keep layers aligned with ARCHITECTURE.md (validators/types → db repos → API vertical slice → apps).

**Non-Goals:**

- Standalone FAQ REST resources.
- Localized FAQ bodies, rich text, or catalog/list surfacing.
- Changing the guided creation flow beyond the existing single event form.

## Decisions

### 1. Dedicated `event_faqs` table (not JSON column on `events`)

- **Choice:** New table `event_faqs` with base columns (`id`, `documentId`, `createdAt`, `updatedAt`), `eventId` FK → `events.id` (ON DELETE CASCADE), `question`, `answer`, `sortOrder` (integer, 0-based).
- **Why:** Matches the user request, keeps rows queryable/ordered, and follows entity patterns (`tickets`, assets links) instead of opaque JSON.
- **Alternatives:** JSON text column on `events` — fewer joins, weaker validation/indexing and harder incremental edits.

### 2. Embed FAQ list in event create/update payloads; replace-all on write

- **Choice:** `faqs: EventFaqItem[]` on create/update (default `[]`). Repository writes replace the event’s FAQ set in one transaction (delete all for `eventId`, then insert ordered rows — or equivalent delete-missing + upsert). Owner GET/detail responses include `faqs` ordered by `sortOrder`.
- **Why:** Form already submits the full event; avoids new endpoints and race-prone partial FAQ APIs for v1.
- **Alternatives:** Per-item CRUD endpoints — more flexible later, more surface area now.

### 3. Validation lives only in `@repo/validators`

- **Choice:** Shared `eventFaqItemSchema` + `faqs` array (max 20) on create/update and on public detail response typing as needed. Dashboard and API reuse the same schemas; no duplicated length rules in prose or UI-only checks beyond schema.
- **Why:** Repo convention; single source of truth.

### 4. Public detail includes `faqs`; catalog list does not

- **Choice:** Extend public single-event detail mapper/DTO only. List/cover-flow payloads stay unchanged.
- **Why:** Spec scope is detail-page display; keeps list payloads small.

### 5. Dashboard UX: repeatable FAQ fields on the existing single-page form

- **Choice:** New form section (e.g. `EventFaqForm`) composed into the current event form page used by `/events/new` and `/events/$documentId/edit`. Support add, remove, and reorder (up/down or equivalent). No wizard step.
- **Why:** Honors `event-authoring` single-form requirement and the routes the user named.

### 6. Web UX: Accordion section after description

- **Choice:** New presentational component under event-detail that maps `faqs` to Accordion items; omit when `faqs.length === 0`. Placement: after description, before address / tickets / venue / map (per delta spec).
- **Why:** Matches landing FAQ affordance and proposal placement assumption.

### 7. i18n

- **Choice:** Add keys under events locales for section titles, add/remove/reorder labels, empty hint, and public heading/aria — ES + EN. Do not i18n owner-authored question/answer strings.

## Risks / Trade-offs

- **[Replace-all loses stable documentIds across edits]** → Acceptable for v1 (public UI does not deep-link FAQ items). If later needed, switch to upsert-by-`documentId`.
- **[Large FAQ payloads on every event update]** → Cap at 20 items in validators; answers are plain text.
- **[Orphan rows if cascade missing]** → Migration MUST declare FK with ON DELETE CASCADE (or explicit delete in event-delete path if that path already custom-cleans children).
- **[Form complexity]** → Keep FAQ editor as a composed section; match existing field-array patterns in the dashboard if any exist, otherwise a simple controlled list.

## Migration Plan

1. Add Drizzle schema `event-faq.ts` (or `event_faqs` in a dedicated file); export from `schema/index.ts`.
2. Generate timestamp-prefixed migration via `drizzle-kit generate`; apply with `drizzle-kit migrate`.
3. Ship API + dashboard + web together so clients never see `faqs` missing once the column/table exists (default `[]` in mappers for safety during rollout).
4. Rollback: revert app code first; dropping the table is safe if no production FAQ data yet (feature is new).

## Open Questions

None blocking apply — assumptions are listed in `proposal.md`. Override before implementation if needed: max count (20), replace-all vs upsert, and exact detail-page placement.
