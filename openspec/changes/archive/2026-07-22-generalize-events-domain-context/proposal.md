## Why

Harness docs still frame Repo as a **nightlife-only** product (clubs, “the night”, nocturnal brand copy). The product focus has widened to **events in general** (venues/locations of any kind, not just nightclubs). Agents and design skills that read `DOMAIN.md`, `PRODUCT.md`, `openspec/config.yaml`, and the mission pick up the old framing and generate nightlife-biased UI, copy, and scope.

## What Changes

- Reframe product context in harness-facing markdown from “eventos nocturnos / nightlife” to **plataforma de eventos** (ticketing + discovery + owner operations), without implying nightlife is the only category.
- Align domain language with the existing **locations** model (prefer “ubicación / location” over “club” in active context docs).
- Soften brand personality copy that locks the product to nightclub energy, while keeping the dark, restrained visual direction where it still fits a general events brand named Repo.
- Update OpenSpec project `context` in `openspec/config.yaml` so new proposals inherit the generalized framing.

## Non-goals

- No application code, API, DB schema, i18n strings, or UI redesign in this change.
- No bulk rewrite of legacy `spec/features/NNN-*/` (historical; migrate on next touch per project rules).
- No rename of the product/brand “Repo”.
- No archive of past OpenSpec changes or migration of nightlife wording inside archived artifacts.
- No change to migration filenames (e.g. `0000_ambitious_nocturne.sql`) or other historical identifiers.

## Capabilities

### New Capabilities

- `product-context`: Canonical product/domain framing for agents and humans — what Repo is, who it serves, and core entities — expressed as general events (not nightlife-only), with locations instead of clubs in active docs.

### Modified Capabilities

- (none — no runtime behavior specs under `openspec/specs/` change; this is documentation/context only)

## Impact

| Area                           | Effect                                                                     |
| ------------------------------ | -------------------------------------------------------------------------- |
| `DOMAIN.md`                    | Product one-liner, audiences, entities, rules → general events + locations |
| `PRODUCT.md`                   | Users, purpose, personality → events platform (not nightlife-only)         |
| `openspec/config.yaml`         | Injected `context` for all future OpenSpec artifacts                       |
| `spec/constitution/mission.md` | Mission/vision/principles audience language                                |
| Apps / packages                | **None** (docs only)                                                       |

After this lands, `/opsx:propose`, Impeccable/product registers, and agents reading AGENTS.md → DOMAIN/PRODUCT will default to general-events framing.
