## Context

Google OAuth (`GoogleOauthService` + `GoogleOauthCallbackUseCase`) already maps Google userinfo into name/email/`sub` and either registers a new account or logs in an existing Google-linked account. Profiles store avatars as `avatar_id` → `assets` (`profile-avatar-asset`). Registration seeds today only pass `name` / `lastName` / `phone`, so new Google users have no avatar. Existing Google users who signed up before this change also lack one.

## Goals / Non-Goals

**Goals:**

- Persist Google’s `picture` URL as an `assets` row and link it on profile create.
- On subsequent Google login, if the profile has no avatar and Google still returns a picture, backfill once.
- Keep OAuth success path resilient if picture is missing or avatar persistence fails.

**Non-Goals:**

- Re-hosting images on R2 / `FilesService`.
- Overwriting an existing avatar.
- Avatar upload UI or staff Google OAuth.
- Schema migrations (FK already exists).

## Decisions

1. **Store Google URL on `assets`, no download**
   - **Choice:** Insert `assets` with `url = picture`, `type = IMG`, `storageKey = null`, stable `name` (e.g. `google-avatar`).
   - **Why:** Matches agreed product choice; avoids FilesService coupling on the auth path; schema already allows nullable `storageKey`.
   - **Alternative considered:** Download + R2 upload — stronger durability, deferred.

2. **Thread `pictureUrl` through `GoogleUserProfile`**
   - **Choice:** Optional `pictureUrl: string | null` from userinfo `picture`; omit or null when absent/invalid.
   - **Why:** Single place for Google payload; callback decides create vs backfill.

3. **Optional `avatarId` on profile seeds + create inside `registerAccount` transaction**
   - **Choice:** Extend `OwnerProfileSeed` / `UserProfileSeed` (shared shape) with optional `avatarId`. When registering with a picture, create the asset **inside** the same DB transaction as account/profile insert (tx-aware insert helper; do not use standalone `createAsset` that always uses root `db`).
   - **Why:** Avoid orphan assets or profiles without the FK if registration rolls back.
   - **Alternative:** Create asset outside the transaction — simpler but leaves orphans on failure.

4. **Login backfill via dedicated repository**
   - **Choice:** After resolving an existing Google account, if `pictureUrl` is present, call a repo such as `setProfileAvatarFromUrlIfEmpty({ accountId, roleName, pictureUrl })` that: reads current `avatar_id` for the role’s profile; if null, inserts asset and updates `avatar_id`; if already set, no-op.
   - **Why:** Keeps callback thin; supports USER and OWNER without duplicating role branching in the use case beyond passing `roleName`.

5. **Best-effort avatar, hard-fail auth only on real auth failures**
   - **Choice:** Missing picture → continue without avatar. Backfill/create errors → log warning and continue with session/registration success when the account path itself succeeded.
   - **Why:** Avatar is enrichment; blocking login on a bad Google CDN URL would be worse UX.
   - **Note:** For **new** registration, prefer creating the asset inside the registration transaction so a failed asset insert rolls back the whole signup only if we choose strict consistency; prefer **best-effort**: if picture URL is present but asset insert fails, still create the account without avatar (catch inside callback or soft-fail before attaching avatarId). Prefer soft-fail so Google signup never depends on asset insert.

6. **No client/API contract changes**
   - Session/settings already expose resolved `avatar` URL; web/dashboard need no UI work.

## Risks / Trade-offs

- **[Risk] Google picture URLs may change or stop working** → Mitigation: accepted trade-off; future change can re-host to R2 or refresh on login.
- **[Risk] Duplicate assets if backfill races** → Mitigation: update only `WHERE avatar_id IS NULL`; acceptable rare duplicate orphan asset.
- **[Risk] Very long picture URLs** → Mitigation: validate non-empty URL string; rely on SQLite text; skip if empty after trim.
- **[Trade-off] Soft-fail avatar on register** → Account without avatar vs failed signup; choose soft-fail.

## Migration Plan

- No DB migration.
- Deploy API-only; existing Google accounts get avatar on next successful login when picture is present.
- Rollback: revert API changes; existing avatar FKs remain valid.

## Open Questions

- None — storage = Google URL; timing = create + backfill when empty (`1 + B`).
