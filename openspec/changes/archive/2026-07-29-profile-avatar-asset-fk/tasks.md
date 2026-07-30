## 1. Schema & migration

- [x] 1.1 Replace `avatar` text with nullable `avatarId` / `avatar_id` FK → `assets.id` (`onDelete: 'set null'`) on `owners`, `users`, and `staff`.
- [x] 1.2 Remove `user-asset-lnk` schema module and its export from `packages/db` schema index; drop `USER_ASSET_LINK_TYPE` from `@repo/types` if unused.
- [x] 1.3 Generate timestamp-prefixed drizzle migration (avatar FKs + DROP `user_assets_lnk`); review SQL; run migrate locally. Update `DATABASE.md` inventory.

## 2. Repository reads

- [x] 2.1 Update owner, user, and staff profile read repositories that select `avatar` to left-join `assets` and return `avatar` as `assets.url` (`string | null`).

## 3. Types / API sanity

- [x] 3.1 Confirm DTOs keep `avatar: string | null` (URL); fix compile breaks from schema/repo/enum removal. No settings PATCH/upload for avatar in this change.
