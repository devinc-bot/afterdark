# guided-creation-flow

## Purpose

Define the owner onboarding tutorial and the guided navigation that chains
location → event → ticket creation after successful creates.

## Requirements

### Requirement: Panel onboarding tutorial alert

The dashboard panel (Owner view) SHALL display an onboarding alert that explains the three-step setup flow in order: (1) crear una ubicación, (2) crear un evento, (3) crear los tickets del evento. The alert copy SHALL be in Spanish and SHALL include a primary call-to-action that navigates to `/locations/new`.

#### Scenario: Owner sees the tutorial on the panel

- **WHEN** an owner opens the dashboard panel (`/dashboard`)
- **THEN** an alert is shown describing the three ordered steps (ubicación → evento → tickets) with a call-to-action button to create a location

#### Scenario: Call-to-action navigates to location creation

- **WHEN** the owner clicks the alert's primary call-to-action
- **THEN** the app navigates to `/locations/new`

### Requirement: Guided navigation after creating a location

After a location is created successfully from the location create form, the dashboard SHALL navigate the user to `/events/new` to continue the guided setup flow, instead of returning to the locations list.

#### Scenario: Location create success continues to event creation

- **WHEN** the user submits a valid location create form and the location is created successfully
- **THEN** a success toast is shown and the app navigates to `/events/new`

#### Scenario: Location edit success does not enter the guided flow

- **WHEN** the user submits a valid location edit form for an existing location and it is updated successfully
- **THEN** the app does NOT navigate to `/events/new` and continues to use the existing edit-success navigation
