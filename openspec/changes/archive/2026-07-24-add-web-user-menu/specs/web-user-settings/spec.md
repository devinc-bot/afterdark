# web-user-settings — Delta Spec

## ADDED Requirements

### Requirement: Web settings route exists and is authenticated

The public site SHALL expose a `/settings` route (registered as `WEB_ROUTES.settings()`) rendered inside the public layout. The route MUST require an authenticated session: visitors without one SHALL be redirected to the login page.

#### Scenario: Authenticated access

- **GIVEN** an authenticated user
- **WHEN** they navigate to `/settings`
- **THEN** the settings page renders inside the public shell (header and footer visible)

#### Scenario: Unauthenticated access

- **GIVEN** a visitor without a valid session
- **WHEN** they navigate to `/settings`
- **THEN** they are redirected to the login page

### Requirement: Settings page shows basic profile read-only

The settings page SHALL display the user's basic profile — avatar (or initials fallback), display name, and email — as read-only content, with Spanish copy indicating that account management options are coming soon. The page MUST NOT offer editing capabilities in this change.

#### Scenario: Profile summary

- **GIVEN** an authenticated user on `/settings`
- **WHEN** the page renders
- **THEN** their avatar or initials, full name, and email are visible, along with a "próximamente" placeholder message for future options

#### Scenario: Session loading

- **GIVEN** a user whose session is still loading (valid token cookie present)
- **WHEN** they open `/settings`
- **THEN** a loading state is shown until the session resolves
