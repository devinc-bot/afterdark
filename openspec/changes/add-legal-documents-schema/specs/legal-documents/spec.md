## ADDED Requirements

### Requirement: Legal document persistence

The system SHALL persist versioned legal documents with a type, title, TipTap JSON content, publication state, acceptance requirement, and optional publication timestamp.

#### Scenario: Store a draft legal document

- **GIVEN** a legal document has one of the supported types
- **WHEN** the document is stored without publication
- **THEN** the system persists it with `isPublished` set to false and its structured content intact

#### Scenario: Store a published legal document

- **GIVEN** a versioned legal document is ready for publication
- **WHEN** the document is stored as published
- **THEN** the system persists its publication state, acceptance requirement, and publication timestamp

### Requirement: Legal document audience types

The system SHALL restrict legal document types to dashboard terms, web terms, dashboard privacy, and web privacy.

#### Scenario: Persist a supported document type

- **GIVEN** a document type is `termsDashboard`, `termsWeb`, `privacyDashboard`, or `privacyWeb`
- **WHEN** the document is persisted
- **THEN** the database accepts the document type

#### Scenario: Reject an unsupported document type

- **GIVEN** a document type is outside the supported legal document types
- **WHEN** persistence is attempted
- **THEN** the database rejects the document type

### Requirement: Legal document identity and timestamps

The system SHALL assign each legal document an internal numeric identifier, a public UUID document identifier, a creation timestamp, and an update timestamp.

#### Scenario: Create legal document identity

- **GIVEN** a valid legal document
- **WHEN** the document is created
- **THEN** the system assigns its internal identifier, public document identifier, creation timestamp, and update timestamp

### Requirement: Account legal document acceptance

The system SHALL persist an account's acceptance of a specific legal document and SHALL prevent duplicate acceptance of the same document by that account.

#### Scenario: Record account acceptance

- **GIVEN** an existing account and legal document
- **WHEN** the account accepts the legal document
- **THEN** the system links the account to that legal document and records the acceptance timestamp

#### Scenario: Reject duplicate acceptance

- **GIVEN** an account has already accepted a legal document
- **WHEN** another acceptance is persisted for the same account and legal document
- **THEN** the database rejects the duplicate acceptance

### Requirement: Admin legal document authoring surface

The system SHALL provide authenticated Admin users with a localized legal documents destination containing separate organization and web authoring sections.

#### Scenario: Navigate to legal documents

- **GIVEN** an authenticated Admin user is viewing the Admin sidebar
- **WHEN** the user selects the localized legal documents navigation item
- **THEN** the system opens the protected legal documents screen

#### Scenario: Edit organization legal content

- **GIVEN** the Admin user is on the legal documents screen
- **WHEN** the user views the `Organizaciones` section
- **THEN** the system provides localized `Términos y condiciones` and `Política de privacidad` tabs with an independent rich editor for each tab

#### Scenario: Edit web legal content

- **GIVEN** the Admin user is on the legal documents screen
- **WHEN** the user views the `Web` section
- **THEN** the system provides localized `Términos y condiciones` and `Política de privacidad` tabs with an independent rich editor for each tab

#### Scenario: Switch between document tabs

- **GIVEN** the Admin user has entered content in one of the legal document editors
- **WHEN** the user switches tabs and returns while the route remains mounted
- **THEN** the system retains that editor's transient content

#### Scenario: View persistence actions

- **GIVEN** the Admin write API is available
- **WHEN** the Admin user edits a legal document
- **THEN** the system presents localized **Guardar** (draft) and **Publicar** actions for that document type

### Requirement: Admin draft save

The system SHALL upsert at most one unpublished draft per legal document type when an Admin saves.

#### Scenario: Save a new draft

- **GIVEN** no unpublished draft exists for `termsWeb`
- **WHEN** an Admin saves that document
- **THEN** the system persists one unpublished row with `isPublished` false, `publishedAt` null, and does not create a new published version

#### Scenario: Save overwrites the current draft

- **GIVEN** an unpublished draft already exists for `privacyDashboard`
- **WHEN** an Admin saves that document again
- **THEN** the system updates the same draft row and does not insert another unpublished row for that type

#### Scenario: Save after a published version

- **GIVEN** `termsDashboard` already has a published `v1`
- **WHEN** an Admin saves new content
- **THEN** the system creates or updates an unpublished `v2` draft and leaves the published `v1` unchanged

### Requirement: Admin publish immutable version

The system SHALL publish the current unpublished draft as an immutable versioned document.

#### Scenario: First publish

- **GIVEN** an unpublished draft exists for a document type
- **WHEN** an Admin publishes it
- **THEN** the system sets `isPublished` true, assigns `version` `v1`, sets `publishedAt`, and that row MUST NOT be overwritten by later saves

#### Scenario: Subsequent publish

- **GIVEN** a published `v1` and an unpublished `v2` draft for the same type
- **WHEN** an Admin publishes the draft
- **THEN** the system freezes that draft as published `v2` and leaves `v1` and its account acceptances unchanged

#### Scenario: Publish without a draft

- **GIVEN** a document type has no unpublished draft
- **WHEN** an Admin attempts to publish
- **THEN** the system rejects the request
