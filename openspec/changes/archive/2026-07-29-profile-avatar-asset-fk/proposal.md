## Why

Owner, user, and staff avatars are stored as loose `text` columns, disconnected from the shared `assets` table. That blocks FK integrity and reuse of upload/storage metadata. Meanwhile `user_assets_lnk` (POST/HISTORY gallery links) is unused and conflicts with a simpler single-avatar FK model. Unify profile avatars onto `assets` and drop the unused link table.

## What Changes

- Replace `owners.avatar`, `users.avatar`, and `staff.avatar` (`text`) with nullable `avatar_id` integer FK → `assets.id` (ON DELETE SET NULL).
- **BREAKING (DB):** drop `user_assets_lnk` table; remove schema export and `USER_ASSET_LINK_TYPE` if unused.
- **BREAKING (DB):** legacy text avatar values discarded (no auto-backfill into `assets`).
- Profile/session reads for owner, user, and staff left-join `assets` and keep exposing `avatar` as `assets.url` (`string | null`).
- No avatar upload / PATCH field in this change.

## Non-goals

- Avatar upload UI or new upload endpoints.
- New `owner_assets_lnk` / gallery link tables.
- Changing how event/location asset links work.

## Capabilities

### New Capabilities

- `profile-avatar-asset`: Owner, user, and staff avatars are stored as FKs to `assets` and resolved to URLs on profile reads; `user_assets_lnk` is removed.

### Modified Capabilities

- (none — API `avatar` field remains `string | null` URL for all roles)

## Impact

- **packages/db** — `owner` / `user` / `staff` schemas; delete `user-asset-lnk.ts` + migration dropping `user_assets_lnk`; update profile read repos to join `assets`.
- **packages/types** — remove `USER_ASSET_LINK_TYPE` if unused; DTOs keep `avatar: string | null`.
- **apps/api** — owner/staff/user profile mappers keep URL field from repo.
- **docs** — `packages/db/DATABASE.md` table inventory update.
- **apps/dashboard / apps/web** — no intentional UI change if URL contract holds.
