# Spec 034 - Profile Avatar Upload and R2 Layout

## Context and Objective

Authenticated customers on `web` and owners on `dashboard` can view a profile avatar (often seeded from Google as an external URL) but cannot upload or replace their own photo. The owner settings UI already exposes a disabled “Change photo” control. This feature lets those actors crop and upload a small square avatar stored in R2, and introduces a hierarchical object-key layout for new uploads so media is organized by domain (`events/`, `locations/`, `users/avatars/`, reserved `tickets/`) instead of the flat `images/<uuid>` pool.

## Users / Actors

- Customers (`user`) using `web` authenticated settings.
- Owners using `dashboard` authenticated settings.
- Staff remain read-only for avatar (no upload or remove in this feature).

## User Stories

- H1: As a customer, I want to crop and upload a profile photo in web settings so that my avatar appears consistently in the app shell and profile.
- H2: As an owner, I want to change or remove my profile photo in dashboard settings so that the disabled “Change photo” control becomes real.
- H3: As the platform, I want new image objects stored under a predictable R2 tree so that event, location, and avatar assets are easy to locate and reason about.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN an authenticated `user` opens web settings, THE SYSTEM SHALL offer controls to change and remove the profile avatar.
- RF-2: WHEN an authenticated `owner` opens dashboard settings, THE SYSTEM SHALL enable the existing change-photo control and offer remove when an avatar is present.
- RF-3: WHEN the actor selects an image for avatar upload, THE SYSTEM SHALL present a square crop UI before upload and SHALL send only the cropped result to the API.
- RF-4: WHEN a cropped avatar is accepted, THE SYSTEM SHALL optimize it server-side to a **256×256** square **WebP** (quality aligned with avatar constants) and store it in R2 under `users/avatars/{profileDocumentId}.webp`.
- RF-5: WHEN avatar upload succeeds, THE SYSTEM SHALL create or replace the profile `avatarId` asset, return the public avatar URL on the settings/profile response, and refresh client session/profile state that displays `avatar`.
- RF-6: WHEN a previous avatar asset has a non-null `storageKey`, THE SYSTEM SHALL delete that R2 object after a successful replace or remove (best-effort cleanup; DB state remains consistent even if remote delete fails after commit—document retry/logging behavior in plan).
- RF-7: WHEN the actor removes their avatar, THE SYSTEM SHALL set `avatarId` to null and show the existing placeholder/initials fallback.
- RF-8: IF the upload MIME type is not an allowed image type, the file exceeds the avatar upload size limit, or the image cannot be decoded/cropped, THEN THE SYSTEM SHALL reject the request with a localized error and leave the previous avatar unchanged.
- RF-9: IF a `staff` caller invokes the avatar mutation endpoints, THEN THE SYSTEM SHALL reject the request (forbidden / not applicable to staff in this feature).
- RF-10: THE SYSTEM SHALL NOT mix avatar bytes into the existing text-only profile `PATCH`; avatar mutations use dedicated settings endpoints (upload multipart + remove).
- RF-11: WHEN new event images are uploaded, THE SYSTEM SHALL store them under `events/{eventDocumentId}/` with a versioned `cover-{uuid}.webp` for the primary image and versioned `gallery-{n}-{uuid}.webp` for additional images (current max count unchanged).
- RF-12: WHEN new location images are uploaded, THE SYSTEM SHALL store them under `locations/{locationDocumentId}/gallery-{n}-{uuid}.webp` (current max count unchanged).
- RF-13: THE SYSTEM SHALL reserve the `tickets/` prefix for future ticket media and SHALL NOT write ticket objects in this feature.
- RF-14: THE SYSTEM SHALL leave existing flat `images/<uuid>` (or prefixed) objects and their `assets` rows as-is; no bulk migration of historical keys.
- RF-15: WHEN Google OAuth seeds an empty avatar, THE SYSTEM SHALL keep the current external-URL asset behavior (`storageKey` null); a later user upload replaces that association per RF-5/RF-6.
- RF-16: THE SYSTEM SHALL localize all new avatar UI copy and API errors in Spanish and English via `@repo/i18n`.
- RF-17: WHILE dark or light theme is active, and on desktop or mobile viewports, THE SYSTEM SHALL present crop and avatar controls with accessible labels, keyboard operability, and readable contrast.

## Non-Functional Requirements

- Authorization is enforced in the API from the JWT role and profile ownership; clients are not a security boundary.
- Avatar payloads stay small: client crop plus server enforce 256×256 WebP; reuse multer memory upload with a dedicated avatar max-bytes constant (stricter than general 5MB gallery uploads if practical).
- JWT payload remains without `avatar`; clients refresh via existing session/settings reads after mutation.
- Shared validators/constants live in `@repo/validators`; DTOs/routes in `@repo/types` and `API_ROUTES`.
- Object keys are hierarchical path strings; `R2_UPLOAD_PREFIX` is removed so keys are full paths without a Files SDK prefix (not double-prefixed with `images/`).

## Edge Cases

- Actor has no avatar (null) and uploads the first photo.
- Actor has a Google external avatar (`storageKey` null) and uploads a replacement (no R2 delete for the old URL).
- Actor replaces an R2-backed avatar twice in quick succession (last write wins; orphaned keys cleaned when possible).
- Crop dialog cancelled; no network request.
- Corrupt or zero-byte file; unsupported MIME; oversized pre-crop file.
- Concurrent remove and upload for the same profile.
- Public avatar URL cached with long `Cache-Control`; new uploads MUST use a new object identity or cache-busting query so UIs do not show a stale immutable object (overwrite same key only if URL/version strategy is defined and tested).

## Out of Scope

- Staff avatar upload or remove.
- Admin app avatar management.
- Migrating existing event/location/Google assets into the new R2 tree.
- Organization logos, ticket media under `tickets/`, or direct browser-to-R2 presigned uploads.
- Changing event/location max image counts or gallery UX beyond key naming for new uploads.
- Copying Google profile pictures into R2 on OAuth.

## Definition of Done

- Spec, plan, and tasks reviewed; feature ready to implement under `/sdd-apply`.
- Implementation (later) proves RF-1–RF-17 with focused API and client tests, i18n keys, type-check/lint/format, and a manual crop→upload→display→remove check on `web` and `dashboard` (owner).
- New uploads observe the documented R2 layout; historical keys remain readable.

## Open Questions

None — locked for this draft:

- Actors: `user` + `owner` only (staff read-only).
- R2: hierarchical keys for **new** uploads only; no historical migration.
- Remove avatar: allowed.
- Output size: 256×256 WebP.
