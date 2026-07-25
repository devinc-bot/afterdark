# Add Web Profile Edit

## Why

The web `/settings` page (introduced by the `add-web-user-menu` change) shows the user's profile read-only with a "coming soon" placeholder. Users with role `USER` have no way to update their basic profile data anywhere in the platform — the API's `GET/PATCH /settings` endpoints only accept OWNER/STAFF and return 403 for regular users. This change connects the settings screen to real, editable user options.

## What Changes

- Extend the existing `GET/PATCH /settings` API so the authenticated `USER` role can read and update their basic profile (name, lastName, phone). Validation uses `updateCurrentUserProfileSchema` from `@repo/validators`. OWNER/STAFF behavior on the same endpoints stays unchanged.
- Replace the read-only profile section on `apps/web` `/settings` with an editable form: name, lastName, and phone become editable inputs; email stays read-only; avatar keeps the current display (no upload).
- Wire the form with the web app's existing patterns: `QueryFactory` service + React Query (`useQuery` for `GET /settings`, `useMutation` for `PATCH`), with success/error feedback in Spanish.
- After a successful save, refresh the session store so the header user menu reflects the updated name.
- New Spanish/English copy for form labels, actions, and success/error messages in the `settings` namespace of `packages/i18n`.

## Capabilities

### New Capabilities

- `user-profile-api`: authenticated `USER`-role support on `GET/PATCH /settings` to read and update the user's own basic profile.

### Modified Capabilities

- `web-user-settings`: the settings page requirement changes from "shows basic profile read-only" to "lets the user edit name, lastName, and phone" (email remains read-only, avatar remains display-only). Note: this capability's baseline spec is the delta in the active `add-web-user-menu` change (not yet archived into `openspec/specs/`).

## Non-goals / Out of scope

- Password change and avatar upload (still platform-wide gaps; separate changes).
- Language or theme preferences on the settings page.
- Changes to the dashboard settings UI (`apps/dashboard/app/modules/settings`) beyond sharing the same API.
- Editing email or other account fields (email lives on the `account` table and is tied to auth providers).
- New DB schema or migrations — `name`, `lastName`, and `phone` already exist on the `user` table.
- Separate `/users/me` HTTP endpoints (superseded by extending `/settings`).

## Impact

- **apps/api**: extend `settings` module for role `USER`; domain slice `users/` (use cases + mapper, no HTTP controller) wired like `owner`/`staff`; `SettingsResponse` includes `CurrentUserResponse`.
- **packages/db**: repository to update a user's basic profile fields.
- **packages/validators**: `updateCurrentUserProfileSchema` (picked from `updateCurrentUserSchema`).
- **packages/types**: `CurrentUserResponse`; `SettingsResponse` union extended.
- **apps/web**: `modules/settings` gains a service, query/mutation hooks, and the editable form in `settings-page.tsx`; session store refresh after save.
- **packages/i18n**: new `web.*` keys in `settings` locales (es + en) for form labels, save action, and feedback messages.
- **apps/dashboard / packages/ui**: untouched UI (existing ShadCN inputs/buttons suffice).
