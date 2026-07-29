## ADDED Requirements

### Requirement: Owner organization fields on settings API

The authenticated owner settings API (`GET`/`PATCH` `/settings` for role OWNER) SHALL expose `organizationName` on the current-owner response and accept it on update. Validation of `organizationName` and `taxId` MUST be defined in `@repo/validators` (`updateCurrentOwnerSchema` / settings form schema) and MUST NOT be re-specified in prose elsewhere. When `organizationName` is empty after trim, the update MUST persist `organizationName` and `taxId` as null (not an organization). When `organizationName` is non-empty, the update MUST persist the name and MAY persist optional `taxId` per the validator.

#### Scenario: Read includes organization name

- **WHEN** an authenticated owner calls `GET /settings`
- **THEN** the response includes `organizationName` (`string | null`) alongside existing owner profile fields including `taxId`

#### Scenario: Save as organization with name only

- **WHEN** an authenticated owner `PATCH`es settings with a non-empty `organizationName` and empty `taxId` that passes `@repo/validators`
- **THEN** the owner row stores the organization name and `taxId` is null

#### Scenario: Save as organization with name and CUIT

- **WHEN** an authenticated owner `PATCH`es settings with a non-empty `organizationName` and a `taxId` that passes `@repo/validators`
- **THEN** both values are persisted on the owner row

#### Scenario: Save as not an organization clears organization data

- **WHEN** an authenticated owner `PATCH`es settings with empty `organizationName` (and empty or any `taxId` in the request)
- **THEN** the owner row has `organizationName` null and `taxId` null

#### Scenario: CUIT without organization name is rejected

- **WHEN** an authenticated owner `PATCH`es settings with non-empty `taxId` and empty `organizationName`
- **THEN** the request fails validation per `@repo/validators` and no owner organization fields are updated

### Requirement: Organization section on dashboard owner settings

The dashboard owner settings page SHALL include an Organización section with the question “¿Eres una organización?” as a checkbox. When the checkbox is checked, the section MUST show inputs for organization name and CUIT (`taxId`). When unchecked, those inputs MUST be hidden. The CUIT field MUST NOT appear in the personal profile section. UI chrome (section title, question, labels, hints) MUST be Spanish via `@repo/i18n` with English parity. The checkbox MUST NOT be persisted as its own database column.

#### Scenario: Checkbox derived on load when organization data exists

- **GIVEN** the current owner has a non-empty `organizationName` or a non-empty `taxId`
- **WHEN** the owner opens dashboard settings
- **THEN** the organization checkbox is checked and the organization name and CUIT inputs are visible (prefilled from the API)

#### Scenario: Checkbox unchecked when no organization data

- **GIVEN** the current owner has null/empty `organizationName` and null/empty `taxId`
- **WHEN** the owner opens dashboard settings
- **THEN** the organization checkbox is unchecked and the organization name and CUIT inputs are not shown

#### Scenario: Checking reveals organization fields

- **WHEN** the owner checks “¿Eres una organización?”
- **THEN** the organization name and CUIT inputs become visible

#### Scenario: Unchecking hides and clears form fields before save

- **WHEN** the owner unchecks “¿Eres una organización?”
- **THEN** the organization name and CUIT inputs are hidden and their form values are cleared so a subsequent successful save persists both as null

#### Scenario: CUIT removed from personal profile

- **WHEN** the owner views the personal profile section
- **THEN** there is no CUIT / `taxId` input in that section

### Requirement: Organization name required when acting as organization

When the owner submits settings as an organization (non-empty organization intent via the checked checkbox / non-empty organization fields path), `organizationName` MUST be required per `@repo/validators`. `taxId` MUST remain optional subject to the existing validator rules when provided.

#### Scenario: Submit as organization without name fails

- **WHEN** the owner has the organization checkbox checked and submits with an empty organization name
- **THEN** the form/API validation fails per `@repo/validators` and the save does not succeed

#### Scenario: Submit as organization with name and without CUIT succeeds

- **WHEN** the owner has the organization checkbox checked, provides a valid organization name, leaves CUIT empty, and submits
- **THEN** the save succeeds and the stored `taxId` is null
