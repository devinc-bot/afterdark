# web-user-menu

## Purpose

Define the authenticated account menu in the public-site header: opening from the
avatar, navigating to settings, and confirming sign-out.

## Requirements

### Requirement: Authenticated header avatar opens an account menu

When a user is authenticated on the public site, the header avatar SHALL act as a button that opens a dropdown menu (ShadCN `DropdownMenu`, same pattern as `NavUser` in `packages/ui`). The trigger MUST expose an accessible Spanish label including the user's display name and MUST reflect the open state via `aria-expanded`. The same trigger and menu SHALL be used on desktop and mobile viewports; the mobile Sheet menu MUST NOT gain account items.

#### Scenario: Opening the menu

- **GIVEN** an authenticated user on any public page
- **WHEN** they click or activate the header avatar
- **THEN** a dropdown opens showing the user's identity (avatar, display name, email) and the actions "Configuración" and "Cerrar sesión"

#### Scenario: Session still loading

- **GIVEN** a visitor with an access-token cookie whose session is still loading
- **WHEN** the header renders
- **THEN** the existing avatar skeleton is shown and no menu can be opened until the session resolves

#### Scenario: Unauthenticated visitor

- **WHEN** a visitor without a session views the header
- **THEN** the login/register CTAs render as today and no account menu exists

### Requirement: Settings action navigates to web settings

The account menu SHALL contain a "Configuración" item that navigates to the web settings route (`WEB_ROUTES.settings()`), closing the menu.

#### Scenario: Navigate to settings

- **GIVEN** the account menu is open
- **WHEN** the user selects "Configuración"
- **THEN** the menu closes and the router navigates to `/settings`

### Requirement: Sign out requires confirmation

The account menu SHALL contain a "Cerrar sesión" item that opens a confirmation dialog (mirroring the dashboard's sign-out dialog) before ending the session. Confirming SHALL clear the auth cookie (`clearAuthSession`) and the session store (`clearSession`), then navigate to the home page. Cancelling SHALL keep the session untouched. The confirm action MUST be guarded against double submission while sign-out is in flight.

#### Scenario: Confirmed sign out

- **GIVEN** the sign-out confirmation dialog is open
- **WHEN** the user confirms
- **THEN** the auth cookie and session store are cleared, the dialog closes, and the user lands on the home page seeing the unauthenticated header

#### Scenario: Cancelled sign out

- **GIVEN** the sign-out confirmation dialog is open
- **WHEN** the user cancels or dismisses the dialog
- **THEN** the dialog closes and the session remains active
