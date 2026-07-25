## 1. i18n

- [x] 1.1 Add `userMenu.*` keys (menu items, sign-out dialog title/description/cancel/confirm/loading) to `packages/i18n/src/locales/landing/{es,en}.json`, and `web.*` keys (page title, profile labels, "próximamente" note, loading) to `packages/i18n/src/locales/settings/{es,en}.json`

## 2. User menu in header

- [x] 2.1 Create `UserMenu` and `SignOutDialog` components in `apps/web/app/modules/common/components/` (dropdown with identity label + Configuración + Cerrar sesión; dialog with cancel/destructive-confirm and in-flight guard), wire sign-out to `clearAuthSession` + `clearSession` + navigate home
- [x] 2.2 Replace the static avatar block in `LandingHeader` with `UserMenu` (keep loading-skeleton branch and `nav.accountAria` label), verify dropdown works on desktop and mobile widths

## 3. Web settings page

- [x] 3.1 Add `settings` to `WEB_ROUTES`, create `routes/_public/settings.tsx` with auth guard (no token → redirect to login; loading → `SessionLoading`) rendering `SettingsPage`
- [x] 3.2 Create `apps/web/app/modules/settings/components/settings-page.tsx` — read-only profile card (avatar/initials, name, email) + placeholder copy; point the `UserMenu` Configuración item to `WEB_ROUTES.settings()`

## 4. Verification

- [x] 4.1 Run `pnpm lint` + `pnpm type-check`, and manually verify: open/close menu, settings navigation, sign-out confirm/cancel, `/settings` redirect when logged out
