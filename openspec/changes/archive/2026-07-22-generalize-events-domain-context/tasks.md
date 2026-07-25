## 1. OpenSpec harness context

- [x] 1.1 Update `openspec/config.yaml` project `context` one-liner from nightlife to general events/ticketing (leave apps/packages/conventions blocks unchanged)

## 2. Domain and mission

- [x] 2.1 Rewrite `DOMAIN.md` product summary, audiences, roles, core entities, and product rules to events-in-general + `Location` (not nightlife/`Club` as canonical)
- [x] 2.2 Rewrite `spec/constitution/mission.md` product, problem, vision, principles, and out-of-mission bullets to the same events-first framing (locations, not clubs-only)

## 3. Product register

- [x] 3.1 Update `PRODUCT.md` users, purpose, and personality so attendees/purpose are events-first; soften nightlife-only brand claims while keeping restrained dark direction and nightclub-flyer anti-references as bans

## 4. Sanity check

- [x] 4.1 Grep active harness docs (`DOMAIN.md`, `PRODUCT.md`, `openspec/config.yaml`, `spec/constitution/mission.md`) for leftover nightlife/club-canonical wording and fix stragglers; do not bulk-edit `spec/features/`
