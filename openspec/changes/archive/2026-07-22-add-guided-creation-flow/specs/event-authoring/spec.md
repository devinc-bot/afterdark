## MODIFIED Requirements

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
