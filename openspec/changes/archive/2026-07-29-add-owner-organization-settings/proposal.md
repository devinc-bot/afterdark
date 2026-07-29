## Why

Owners who operate as an organization need a clear place in dashboard settings to declare that and capture organization name plus CUIT, without mixing those fields into personal profile data. Today CUIT (`taxId`) sits in the personal profile section and there is no organization name on the owner record.

## What Changes

- Add optional `organizationName` column on the `owners` table (nullable text).
- Extend owner settings read/update API (`CurrentOwnerResponse` / `updateCurrentOwnerSchema`) with `organizationName`; keep `taxId` on the owner payload but treat it as organization CUIT.
- Add an **Organización** section on dashboard owner settings with the question “¿Eres una organización?” (checkbox).
- When checked, show organization name and CUIT inputs; when unchecked, hide those fields.
- **No** `isOrganization` (or similar) column: the checkbox is UI/form state derived from whether organization data is present (e.g. non-empty `organizationName`).
- On save with the checkbox unchecked, clear `organizationName` and `taxId` in the database.
- When the checkbox is checked, `organizationName` is required; `taxId` remains optional (validated by existing `@repo/validators` rules when provided).
- Move the CUIT field out of the personal profile section into the organization section.
- Add ES + EN i18n copy for the new section, labels, and validation messages.

## Non-goals

- Staff or public-web (`USER`) settings changes.
- Separate organization entity / multi-org / team membership.
- Persisting an `isOrganization` boolean flag.
- Tax/billing integrations or CUIT verification beyond existing format validation.
- Avatar upload, password change, or other settings sections unrelated to organization.

## Capabilities

### New Capabilities

- `owner-organization-settings`: Owner can opt into organization mode in dashboard settings, persist organization name on the owner row, manage CUIT in that section, and clear organization fields when opting out on save.

### Modified Capabilities

- (none — dashboard owner settings are not yet covered by an archived OpenSpec capability; this change introduces the capability for the new behavior.)

## Impact

- **packages/db** — `owners` schema + migration (`organization_name`); repository read/update maps the new field; clearing `taxId` when not an organization.
- **packages/types** — `CurrentOwnerResponse` / owner repository types include `organizationName`.
- **packages/validators** — `updateCurrentOwnerSchema` gains `organizationName` with conditional required-when-org rules (Zod), without restating digit rules for `taxId` in prose.
- **apps/api** — owner get/update use cases and mappers pass `organizationName`; update clears org fields when the client sends empty org mode.
- **apps/dashboard** — new organization `FormSection` in owner settings; remove CUIT from profile section; form dirty/save/discard wiring.
- **packages/i18n** — `settings` (and validation keys as needed) ES + EN.
