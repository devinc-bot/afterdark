# Design — add-web-user-menu

## Context

`apps/web` already has full session infrastructure: `useSession` (Zustand store + `/auth/session` load), `clearAuthSession()` (cookie) and `clearSession()` (store). The `LandingHeader` renders a static, non-interactive avatar for authenticated users. The dashboard implements the target UX with `NavUser` (`packages/ui`): a `DropdownMenu` with an identity label, a Settings item, and a Sign out item that opens `AppShellSignOutDialog` (a `Dialog` with cancel/destructive-confirm, double-submit guarded).

`apps/web` has no settings route; public pages live under the `_public` layout (`PublicAppShell` = header + footer).

## Goals / Non-Goals

**Goals:**

- Account dropdown on the web header avatar (desktop + mobile) with Configuración and Cerrar sesión.
- Sign-out confirmation dialog matching the dashboard behavior.
- Minimal authenticated `/settings` page (read-only profile, placeholder copy).

**Non-Goals:**

- Profile editing, avatar upload, password change.
- Shared/extracted user-menu component in `packages/ui` (the web trigger is an avatar chip, not a sidebar button — reuse of `NavUser` doesn't fit; revisit if a third consumer appears).
- New API endpoints or session changes.

## Decisions

1. **Web-local components, dashboard as blueprint.** Build `UserMenu` (dropdown) and `SignOutDialog` in `apps/web/app/modules/common/components/`, modeled on `NavUser` and `AppShellSignOutDialog` rather than reusing them. `NavUser` is coupled to `SidebarMenuButton`/`useSidebar` (requires `SidebarProvider`), which the web shell doesn't have. All primitives (`DropdownMenu*`, `Dialog*`, `Avatar*`, `Button`) come from `@afterdark/ui`.
2. **Trigger = existing avatar.** Replace the `role="img"` wrapper in `LandingHeader` with a `DropdownMenuTrigger asChild` button keeping the current visual (size-11 hit area, size-8 avatar) and the loading skeleton branch untouched. `aria-label` keeps the `nav.accountAria` copy; `aria-expanded` comes from Radix.
3. **Same dropdown on mobile.** No changes to the Sheet menu. Radix `DropdownMenu` already works with touch; content aligned `end` under the trigger.
4. **Sign-out flow copied from dashboard `handleSignOut`.** Local `useState` for dialog open + in-flight ref guard; on confirm: `clearAuthSession()` → `clearSession()` → close → `navigate({ to: WEB_ROUTES.home() })`. Web navigates home (not to login) because the site is public.
5. **Settings route as `routes/_public/settings.tsx`** with a string-literal path (`'/_public/settings'` per TanStack codegen) so it renders inside `PublicAppShell`. Add `settings: () => '/settings' as const` to `WEB_ROUTES`. Auth guard in `beforeLoad`/component: no access-token cookie → `redirect` to `WEB_ROUTES.login()`; token present but session loading → reuse `SessionLoading`; session error/expired → redirect to login.
6. **Settings page structure** follows the web module layout: `apps/web/app/modules/settings/components/settings-page.tsx` (read-only profile card: avatar/initials, full name, email, "próximamente" note). No service/queries — data comes from `useSession`.
7. **i18n placement:** user-menu + dialog copy under `landing` namespace (`userMenu.*` — the header already consumes `landing`); settings page copy under the existing `settings` namespace in a `web.*` subtree (es + en). No new namespace, avoiding loader/type plumbing in `packages/i18n`.

## Risks / Trade-offs

- [Duplicated dropdown/dialog markup vs dashboard] → Accepted: coupling `NavUser` to non-sidebar contexts costs more than ~80 duplicated lines; extract to `packages/ui` when a third consumer needs it.
- [Cookie-only guard in `beforeLoad` can't validate the token] → Component-level session check handles expired tokens (session store already clears on 401 via `session.service`).
- [`settings` namespace mixes dashboard and web copy] → Scoped under a `web.` prefix; migration to a dedicated namespace is trivial later.

## Open Questions

- None — product decisions (settings target, confirm dialog, mobile behavior) resolved via AskQuestion.
