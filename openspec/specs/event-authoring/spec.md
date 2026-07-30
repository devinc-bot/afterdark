# event-authoring

## Purpose

Define how owners create and edit events from the dashboard, including how the
event's location is chosen and what happens when the owner has no locations yet.

## Requirements

### Requirement: Single-form event authoring

The dashboard SHALL provide a single-page form for creating and editing an event, presenting the location selector and all event detail fields (name, description, start date, end date, status, images) together without a multi-step wizard. Field validation SHALL use the event schemas from `@repo/validators`. When a create submission succeeds, the dashboard SHALL navigate the user to `/tickets/new` to continue the guided setup flow.

#### Scenario: Create form renders all fields on one page

- **WHEN** the user opens `/events/new`
- **THEN** the form displays the location selector and every event detail field on a single page with no step navigation

#### Scenario: Edit form renders all fields on one page

- **WHEN** the user opens `/events/:documentId/edit` for an existing event
- **THEN** the form is prefilled with the event's location and details on a single page with no step navigation

#### Scenario: Submitting a valid create form creates the event and continues to tickets

- **WHEN** the user has selected a location and filled all required event fields with valid values, and submits the create form
- **THEN** the system creates the event, shows a success toast, and navigates to `/tickets/new`

#### Scenario: Submitting a valid edit form does not enter the guided flow

- **WHEN** the user submits a valid edit form for an existing event and it is updated successfully
- **THEN** the app does NOT navigate to `/tickets/new` and continues to use the existing edit-success navigation

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

### Requirement: Optional FAQ items on the event form

The dashboard event create and edit form SHALL include an optional FAQ section where the owner can add, edit, reorder, and remove question/answer pairs. FAQ validation SHALL use the event schemas from `@repo/validators`. FAQ content is free text written by the owner (not translated by the app). UI chrome (section title, add/remove/reorder actions, empty hint) MUST be Spanish via `@repo/i18n` (with EN parity). Submitting with zero FAQ items MUST remain valid.

#### Scenario: Create form shows FAQ section

- **GIVEN** the user opens `/events/new`
- **WHEN** the form renders
- **THEN** an FAQ section is available on the same page as the other event fields
- **AND** the user can add FAQ items without leaving the single-page form

#### Scenario: Edit form prefills existing FAQ items

- **GIVEN** an event already has one or more FAQ items stored
- **WHEN** the user opens `/events/:documentId/edit`
- **THEN** the FAQ section is prefilled with those items in display order

#### Scenario: Owner adds and removes FAQ items before submit

- **GIVEN** the user is on the create or edit event form
- **WHEN** they add FAQ items, reorder them, and remove one
- **THEN** the form state reflects the remaining ordered list
- **AND** submitting a valid form persists that list with the event

#### Scenario: Empty FAQ list is allowed

- **GIVEN** the user leaves the FAQ section empty (zero items)
- **WHEN** they submit otherwise valid event fields
- **THEN** the system creates or updates the event successfully with no FAQ items

#### Scenario: Invalid FAQ items block submit

- **GIVEN** the user enters FAQ values that fail `@repo/validators`
- **WHEN** they submit the form
- **THEN** the system blocks submission and shows validation messages in Spanish for the invalid FAQ fields
