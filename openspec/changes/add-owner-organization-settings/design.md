## Context

Dashboard owner settings (`OwnerSettingsView` → `ProfileSettingsSection`) already load/update the owner via `GET/PATCH /settings`. Personal fields include `taxId` (CUIT/CUIL) on the `owners` row. There is no organization name column and no dedicated organization UI. This change adds `organizationName` on `owners`, moves CUIT into an Organización section, and uses a non-persisted checkbox for “¿Eres una organización?”.

Locked product decisions:
1. No `is_organization` column — checkbox is UI/form state derived from data.
2. Unchecking and saving clears `organizationName` and `taxId`.
3. When organization mode is on, organization name is required; CUIT stays optional (existing format rules in `@repo/validators`).

## Goals / Non-Goals

**Goals:**
- Persist optional organization name on the owner.
- Clear UX split between personal profile and organization fields.
- Shared validation for API and dashboard form via `@repo/validators`.
- Preserve existing owners who only have `taxId` (show org section checked; require name on next save if they keep CUIT).

**Non-Goals:**
- Staff / web USER settings.
- Organization as a separate entity or multi-tenant org model.
- Persisting the checkbox as a boolean column.
- External CUIT verification.

## Decisions

### 1. Schema: `organization_name` only (nullable text)

- **Choice:** Add `organizationName` / `organization_name` on `owners`. Do not add `is_organization`.
- **Rationale:** Matches product decision; “is org” is implied by a non-empty organization name (and, for load UX, existing `taxId`).
- **Alternatives considered:** Boolean column — rejected by product.

### 2. API payload: empty name means not an organization

- **Choice:** `PATCH` body includes `organizationName` (string) and `taxId` (string). After trim, empty `organizationName` means not an organization: persist `organizationName = null` and `taxId = null`. Non-empty name persists name and optional `taxId` (empty → null).
- **Rationale:** No request-only boolean needed for persistence semantics; dashboard clears both fields in form state before submit when unchecked.
- **Alternatives considered:** Explicit `isOrganization` on the DTO — unnecessary if empty name is the source of truth.

### 3. Validation coupling: CUIT implies organization name

- **Choice:** In `updateCurrentOwnerSchema` (and thus `settingsFormSchema`), if `taxId` is non-empty then `organizationName` MUST be non-empty (Zod `superRefine`). Digit/format rules for `taxId` stay in the existing helper — do not restate in specs.
- **Rationale:** Prevents orphan CUIT without an org name via API; aligns with “name required when org”. When both empty, valid (not an organization).
- **Client checkbox:** Initialize checked when `organizationName` or `taxId` is present. Uncheck → clear both fields in form values. Check → reveal inputs; name required by schema when taxId filled or by UI required attribute + schema min when submitting as org (non-empty name path).

### 4. UI placement

- **Choice:** New `FormSection` (Organización) in owner settings (sibling to profile/address/account), with checkbox + conditional name/CUIT fields. Remove CUIT from the personal profile grid.
- **Rationale:** Matches the requested settings IA; reuses `FormSection` / `Field` patterns.

### 5. Layer order

types → validators → db migration/repos → API use cases → dashboard UI → i18n (keys can land with UI or slightly earlier for labels).

## Risks / Trade-offs

- **[Risk] Owners with only `taxId` today** → Mitigation: derive checkbox from `organizationName || taxId`; on save while still “org”, require `organizationName` before accepting CUIT.
- **[Risk] Client sends taxId with empty name** → Mitigation: Zod refine rejects; use case also nulls both when name empty as defense in depth.
- **[Risk] Uncheck clears CUIT permanently on save** → Accepted product behavior; discard restores previous form values if not saved.

## Migration Plan

1. Generate drizzle migration adding nullable `organization_name` to `owners` (timestamp prefix).
2. Deploy API + dashboard together so the form sends/reads the new field.
3. Rollback: revert app deploy; column can remain nullable unused (safe). Do not rename committed migrations.

## Open Questions

- None — product choices locked (derive checkbox, clear on uncheck+save, name required / CUIT optional when org).
