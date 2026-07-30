## 1. Types

- [x] 1.1 Add optional `avatarId` to `OwnerProfileSeed` and `UserProfileSeed` in `@repo/types` (keep staff seed aligned only if shared; no staff Google path required)

## 2. Database

- [x] 2.1 Add tx-aware helper to insert an external image asset (`url`, `type: IMG`, `storageKey: null`) and wire optional `avatarId` through `createUserWithAccountLink` / `createOwnerWithAccountLink` (profile insert already spreads seed)
- [x] 2.2 Add repository `setProfileAvatarFromUrlIfEmpty` (USER + OWNER): no-op when `avatar_id` set; otherwise insert asset and set FK; export from `@repo/db`

## 3. API — Google profile mapping

- [x] 3.1 Extend `GoogleUserProfile` + `exchangeCodeForProfile` to map userinfo `picture` → optional `pictureUrl`

## 4. API — Callback wiring

- [x] 4.1 On new Google registration: when `pictureUrl` present, create asset (best-effort) and pass `avatarId` into `registerAccount` profile seed
- [x] 4.2 On existing Google login: when `pictureUrl` present, call `setProfileAvatarFromUrlIfEmpty` (best-effort; never block session)

## 5. Verify

- [x] 5.1 Smoke-check type-check / lint on touched packages; confirm session returns `avatar` URL after Google signup and after login backfill for an account that had none
