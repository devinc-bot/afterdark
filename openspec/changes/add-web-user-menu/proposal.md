# Add Web User Menu

## Why

Authenticated users on the public site (`apps/web`) currently see a static avatar in the header with no way to manage their account or sign out — the avatar renders as a decorative `role="img"` element. The dashboard already solves this with the `NavUser` dropdown pattern (`packages/ui`), so the web app should offer the same account affordances to close the gap.

## What Changes

- Replace the static avatar in `LandingHeader` with a dropdown menu (ShadCN `DropdownMenu`, same pattern as `NavUser` in `packages/ui`) showing the user's identity (name, email, avatar) plus two actions: **Configuración** and **Cerrar sesión**.
- The same avatar trigger opens the dropdown on desktop and mobile (no extra items inside the mobile Sheet).
- **Cerrar sesión** opens a confirmation dialog (mirroring the dashboard's `AppShellSignOutDialog`); confirming clears the auth cookie and session store, then navigates to the home page.
- **Configuración** navigates to a new minimal authenticated `/settings` page in `apps/web` that shows the user's basic profile (avatar, name, email) read-only, as a placeholder for future account management.
- Add `settings` to `WEB_ROUTES`; unauthenticated visits to `/settings` redirect to login.
- New Spanish/English copy for the menu, dialog, and settings page in `packages/i18n`.

## Capabilities

### New Capabilities

- `web-user-menu`: account dropdown in the public site header — trigger, identity display, settings navigation, and sign-out with confirmation.
- `web-user-settings`: minimal authenticated `/settings` page on the public site showing the user's basic profile.

### Modified Capabilities

<!-- none — existing openspec specs (public-events-discovery, event-authoring, etc.) do not cover the web header or account management -->

## Non-goals / Out of scope

- Editing profile data (name, avatar, password) from the web settings page — placeholder only for now.
- Reusing or linking to the dashboard settings module (`apps/dashboard/app/modules/settings`).
- Changes to the dashboard's own user menu or sidebar footer.
- API or DB changes — the web already has session data via `useSession` / `SessionResponse`.
- Language switcher or theme options in the dropdown.

## Impact

- **apps/web**: `LandingHeader` (avatar → dropdown + sign-out dialog), new route `routes/_public/settings.tsx`, new `WEB_ROUTES.settings()`, new components under `modules/settings/` (or `modules/common/` for the menu/dialog).
- **packages/ui**: no new components expected — `DropdownMenu`, `AlertDialog`/`Dialog`, `Avatar` already exist and are exported. If a shared user-menu component is extracted, it lands here.
- **packages/i18n**: new keys in `landing` (menu/dialog copy) and a new or extended namespace for the web settings page (es + en).
- **apps/api / packages/db / packages/validators**: untouched.
