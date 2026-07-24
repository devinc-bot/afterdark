## 1. Validators + types

- [x] 1.1 Add `updateCurrentUserProfileSchema` (`.pick({ name, lastName, phone })` from `updateCurrentUserSchema`) + inferred input type in `packages/validators/src/user.ts`; add `CurrentUserResponse` DTO (name, lastName, phone, email, avatar) in `packages/types`

## 2. DB repository

- [x] 2.1 Create `packages/db/src/repositories/users/update-user-profile-by-document-id.ts` (updates name/lastName/phone), export from `users/index.ts`; verify `find-user-profile-by-document-id` returns email + avatar (extend selection if missing)

## 3. API settings (USER role)

- [x] 3.1 Domain `users` module (use case + mapper, no HTTP controller) + extend `GET /settings` for role `USER` via `GetSettingsUseCase`; expand `SettingsResponse` to include `CurrentUserResponse`
- [x] 3.2 Extend `PATCH /settings` for role `USER` — validate with `updateCurrentUserProfileSchema`, `update-current-user.use-case.ts` + repository, return updated `CurrentUserResponse`

## 4. Web settings form

- [x] 4.1 Create `apps/web/app/modules/settings/services/profile.service.ts` (`getMyProfile`/`updateMyProfile` via `QueryFactory` against `GET/PATCH /settings`) and hooks `queries/use-profile.ts` (useQuery) + `use-update-profile.ts` (useMutation with profile-query invalidation and session-store refresh)
- [x] 4.2 Replace the read-only section in `settings-page.tsx` with the editable form (name/lastName/phone inputs, email read-only, avatar display-only) — client-side validation with `updateCurrentUserProfileSchema`, submit disabled while pending, inline success/error feedback

## 5. i18n

- [x] 5.1 Add `web.form.*`, `web.actions.*`, `web.messages.*` keys (es + en) to `packages/i18n/src/locales/settings/{es,en}.json`, remove the `comingSoon` copy usage

## 6. Verification

- [x] 6.1 Run `pnpm lint` + `pnpm type-check`; manually verify: form pre-fill, save success (header menu name updates), invalid phone rejected, API 401 without token, save error feedback
