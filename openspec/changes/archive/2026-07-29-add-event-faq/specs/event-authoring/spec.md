## ADDED Requirements

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
