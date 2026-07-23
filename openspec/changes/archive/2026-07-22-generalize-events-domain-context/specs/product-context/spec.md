## ADDED Requirements

### Requirement: Harness docs describe a general events platform

Active product-context documents that agents and OpenSpec inject as project context SHALL describe afterdark as a **general events and ticketing platform** (discovery, purchase, owner operations), not as a nightlife-only or nightclub-only product.

#### Scenario: Domain one-liner is category-neutral

- **WHEN** an agent or human reads `DOMAIN.md` product summary
- **THEN** the product is described as a platform for events in general (ubicaciones, eventos, entradas), without requiring nightlife as the sole category

#### Scenario: OpenSpec context is category-neutral

- **WHEN** OpenSpec generates a new artifact and injects `openspec/config.yaml` context
- **THEN** the injected blurb describes an events/ticketing platform, not a “nightlife” platform

#### Scenario: Mission matches the generalized product

- **WHEN** a reader opens `spec/constitution/mission.md`
- **THEN** the product, problem, and vision refer to events and venue operators in general, not exclusively to “la noche” or dueños de clubes as the only framing

### Requirement: Active domain language prefers locations over clubs

Active harness docs (`DOMAIN.md`, mission, and related product context) SHALL use **location / ubicación** as the venue entity language, consistent with the locations rename direction, and SHALL NOT present “club” as the canonical product term in those files.

#### Scenario: Core entities list locations

- **WHEN** `DOMAIN.md` lists core entities
- **THEN** the venue entity is `Location` (local/venue del dueño), not `Club` as the primary name

#### Scenario: Owner audience uses locations

- **WHEN** audience/role tables in active context docs describe the owner
- **THEN** they refer to managing locations (and events, tickets, staff), not “clubes” as the default label

### Requirement: Product register does not lock brand to nightlife-only

`PRODUCT.md` SHALL position attendees around discovering and booking **events**, and SHALL not require nightlife energy as the only valid brand personality. Restrained / dark visual direction MAY remain; nightclub-flyer anti-references MAY remain as design bans.

#### Scenario: Attendee description is events-first

- **WHEN** `PRODUCT.md` describes attendees / customers
- **THEN** they discover and book events (not “nightlife events” exclusively)

#### Scenario: Purpose statement is events-first

- **WHEN** `PRODUCT.md` states product purpose
- **THEN** afterdark is an events platform for venues/locations and ticketed experiences, not “a nightlife and events platform” as the primary identity

### Requirement: Legacy feature specs stay historical

This change SHALL NOT rewrite nightlife/club wording inside `spec/features/NNN-*/` solely for thematic consistency. Those files remain reference/history until a feature is next touched.

#### Scenario: No bulk legacy rewrite

- **WHEN** this change is applied
- **THEN** only the agreed harness/context markdown files are updated; bulk edits under `spec/features/` are out of scope
