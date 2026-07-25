# Add Web Profile Edit — Design

## Context

The web `/settings` page (from the still-active `add-web-user-menu` change) renders a read-only profile from the session store. The API's `GET/PATCH /settings` only accepts OWNER/STAFF (the `USER` role gets 403). Building blocks that already exist:

- `updateCurrentUserSchema` in `packages/validators/src/user.ts` (includes name, lastName, phone, birthday, nationalId, address).
- `packages/db/src/repositories/users/` with `find-user-profile-by-document-id.ts` and `update-user-profile-by-document-id.ts`.
- Web API patterns: `QueryFactory` client, React Query hooks, Zustand session store.
- API settings module already dispatches OWNER/STAFF via role branching (`GetSettingsUseCase` / `UpdateSettingsUseCase`).

## Goals / Non-Goals

**Goals:**

- Extend `GET/PATCH /settings` for the authenticated `USER` role (same HTTP surface as dashboard).
- Editable name / lastName / phone on web `/settings`; email and avatar stay read-only.
- Session store refresh after save so the header user menu shows the new name.

**Non-Goals:**

- Password change, avatar upload, language/theme preferences.
- Editing birthday, nationalId, or address from the web.
- Dashboard UI changes or DB migrations.
- Dedicated `/users/me` HTTP routes.

## Decisions

1. **Extend `GET/PATCH /settings` for `USER`** (user decision — supersedes earlier “new `/users/me` endpoints” choice). Keep the existing settings controller; add a `USER` branch in get/update use cases. Domain logic lives in `apps/api/src/modules/users/` (use cases + mapper, **no controller**), imported by `SettingsModule` the same way `OwnerModule` / `StaffModule` are. Rationale: one settings HTTP surface for all roles; web and dashboard already know `/settings`.

2. **Validation: derive a narrower schema with `.pick()`.** `updateCurrentUserProfileSchema = updateCurrentUserSchema.pick({ name, lastName, phone })` for API + web form.

3. **Response DTO.** `CurrentUserResponse` in `packages/types`; expand `SettingsResponse` to `CurrentOwnerResponse | CurrentStaffResponse | CurrentUserResponse`.

4. **Repository.** `updateUserProfileByDocumentId` for writes; `findUserProfileByDocumentId` (with phone) for reads.

5. **Web data layer.** `profile.service.ts` calls `GET/PATCH /settings` (not `/users/me`); React Query + session refresh on success.

6. **Form.** Editable name/lastName/phone; email/avatar read-only; Spanish copy under `settings` locales.

## Risks / Trade-offs

- [Baseline spec not yet archived] `web-user-settings` lives in `add-web-user-menu` → archive that change before this one when possible.
- [SettingsResponse union grows] Dashboard TypeScript consumers may need narrowing by `role` — already true for OWNER vs STAFF.
- [Session/profile mismatch] Refresh session store on successful save.
- [Google-only accounts] Phone required by schema on save; user must provide a valid phone to persist.

## Migration Plan

No DB migrations. API change is additive for `USER` on existing routes. Rollback: revert web + USER branches in settings use cases.

## Open Questions

- None blocking.
