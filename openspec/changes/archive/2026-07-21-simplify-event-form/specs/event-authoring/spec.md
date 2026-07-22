## ADDED Requirements

### Requirement: Single-form event authoring

The dashboard SHALL provide a single-page form for creating and editing an event, presenting the location selector and all event detail fields (name, description, start date, end date, status, images) together without a multi-step wizard. Field validation SHALL use the event schemas from `@afterdark/validators`.

#### Scenario: Create form renders all fields on one page

- **WHEN** the user opens `/events/new`
- **THEN** the form displays the location selector and every event detail field on a single page with no step navigation

#### Scenario: Edit form renders all fields on one page

- **WHEN** the user opens `/events/:documentId/edit` for an existing event
- **THEN** the form is prefilled with the event's location and details on a single page with no step navigation

#### Scenario: Submitting a valid form creates the event

- **WHEN** the user has selected a location and filled all required event fields with valid values, and submits
- **THEN** the system creates the event with the selected location and shows the created result

#### Scenario: Submitting an invalid form shows validation errors

- **WHEN** the user submits with missing or invalid required fields
- **THEN** the system blocks submission and shows validation messages in Spanish for the invalid fields

### Requirement: Location chosen via selector only

The event form SHALL allow choosing a location only from the owner's existing locations via a select control. The form SHALL NOT provide any inline flow to create a new location.

#### Scenario: Selecting an existing location

- **WHEN** the owner has one or more locations
- **THEN** the form shows a select listing those locations and the user can choose one as the event's location

#### Scenario: No inline location creation is offered

- **WHEN** the user views the event form
- **THEN** there is no tab, button, or embedded form to create a new location within the event form

#### Scenario: Last-used location is preselected

- **WHEN** the user opens the create form and a previously used location id is stored and still exists in the owner's locations
- **THEN** that location is preselected in the selector

### Requirement: Empty-state when the owner has no locations

When the owner has no locations, the event form SHALL hide the location selector, show a message stating there are no locations, and show a link labeled "Agregar ubicación" that navigates to `/locations/new`.

#### Scenario: No locations available

- **WHEN** the owner has zero locations and the locations list has finished loading
- **THEN** the form shows a message that there are no locations and a link "Agregar ubicación" pointing to `/locations/new`, and event submission is disabled

#### Scenario: Navigating to create a location

- **WHEN** the user clicks the "Agregar ubicación" link in the empty-state
- **THEN** the app navigates to `/locations/new`
