## Why

Google OAuth already creates accounts with name and email, but never sets a profile avatar. Session and settings UIs then fall back to initials even though Google provides a `picture` URL. Filling that gap on first signup—and backfilling when an existing Google account still has no avatar—improves identity recognition without a separate upload flow.

## What Changes

- Read Google’s `picture` URL from userinfo when exchanging the OAuth code.
- On **new** Google account registration, create an `assets` row for that URL and link it via the profile’s `avatar_id` (user or owner, matching the OAuth role).
- On **existing** Google login, if the profile has no avatar yet and Google returns a picture, create the asset and set `avatar_id` (do not overwrite an existing avatar).
- If Google omits `picture` or asset/link persistence fails in a non-fatal way, registration/login MUST still succeed; avatar remains unset.

## Non-goals

- Downloading or re-hosting the image on R2 / `FilesService`.
- Avatar upload or edit UI (web settings / dashboard remain display-only for avatar).
- Updating avatar on every login when one is already set.
- Changing local (email/password) registration or email-verification flows.
- Staff Google OAuth (not in current Google auth surface).

## Capabilities

### New Capabilities

- `google-oauth-profile-avatar`: Google OAuth registration and login set or backfill the profile avatar from Google’s picture URL as an external `assets` row linked by `avatar_id`.

### Modified Capabilities

- (none) — `profile-avatar-asset` already defines FK storage and URL resolution; this change only adds a write path for Google OAuth.

## Impact

- **Apps:** `apps/api` (Google OAuth service + callback use case; possibly a small avatar-link helper).
- **Packages:** `packages/db` (profile seed / register path supporting optional `avatarId`; create asset + set avatar on profile), `packages/types` (seed / register input shapes).
- **Not affected:** `apps/web`, `apps/dashboard` UI (they already render `avatar` from session/settings), `packages/validators`, `packages/i18n`, `packages/ui`.
- **Assumptions:** store Google’s `picture` as `assets.url` with `storageKey` null; apply on create and on login when avatar is missing (`1 + B`).
