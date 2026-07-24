# web-user-settings

## Purpose

Define the public-site `/settings` page for authenticated users: route guard,
profile form (name, lastName, phone), and session refresh after save.

## Requirements

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

The settings page SHALL display the user's profile loaded from `GET /settings` and let them edit name, lastName, and phone through a form validated with `updateCurrentUserProfileSchema` from `@afterdark/validators`. Email SHALL remain visible but read-only. The avatar (or initials fallback) SHALL remain display-only, with no upload capability in this change.

#### Scenario: Profile form rendered

- **GIVEN** an authenticated user on `/settings`
- **WHEN** the page renders and the profile query resolves
- **THEN** name, lastName, and phone appear as editable inputs pre-filled with current values, and email and avatar are shown read-only

#### Scenario: Session loading

- **GIVEN** a user whose session is still loading (valid token cookie present)
- **WHEN** they open `/settings`
- **THEN** a loading state is shown until the session and profile resolve

### Requirement: Profile changes are saved and reflected in the session

Submitting the settings form SHALL send `PATCH /settings` and, on success, show a Spanish confirmation message and refresh the session store so the header user menu reflects the updated name. On failure, a Spanish error message SHALL be shown and the entered values preserved. The submit action MUST be disabled while the request is in flight.

#### Scenario: Successful save

- **GIVEN** an authenticated user who edited their name on `/settings`
- **WHEN** they submit the form and the API responds successfully
- **THEN** a confirmation message is shown and the header user menu displays the updated name without a full page reload

#### Scenario: Failed save

- **GIVEN** an authenticated user submitting the settings form
- **WHEN** the API responds with an error
- **THEN** a Spanish error message is shown and the form keeps the entered values

#### Scenario: Double submit prevented

- **GIVEN** a submit request in flight
- **WHEN** the user attempts to submit again
- **THEN** the action is disabled until the request settles
