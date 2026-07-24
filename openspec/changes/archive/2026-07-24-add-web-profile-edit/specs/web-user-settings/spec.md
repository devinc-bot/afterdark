# web-user-settings — Delta Spec

> Baseline: the `web-user-settings` spec currently lives as the delta of the active
> `add-web-user-menu` change (not yet archived into `openspec/specs/`).

## MODIFIED Requirements

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

## ADDED Requirements

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
