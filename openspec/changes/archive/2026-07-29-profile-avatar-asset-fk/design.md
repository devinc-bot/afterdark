## Context

`owners`, `users`, and `staff` each have optional `avatar` text. Media lives in `assets`. `user_assets_lnk` exists for POST/HISTORY links but has no repository consumers. Scope: FK avatars for all three profiles + drop `user_assets_lnk`. API keeps `avatar` as URL via join.

## Goals / Non-Goals

**Goals:**
- `avatar_id` FK → `assets.id` on owners, users, staff (ON DELETE SET NULL).
- Resolve `assets.url` on profile reads into existing DTO `avatar`.
- Drop `user_assets_lnk` schema + table + unused enum.

**Non-Goals:**
- Upload flows.
- Event/location asset link tables.
- Gallery/multi-avatar for profiles.

## Decisions

### 1. Same FK pattern on owner, user, staff

- **Choice:** `avatarId: integer('avatar_id').references(() => assets.id, { onDelete: 'set null' })`.
- **Rationale:** One avatar per profile; consistent with prior owner-only decision.

### 2. Drop `user_assets_lnk`

- **Choice:** Delete schema module, export, and migrate DROP TABLE; remove `USER_ASSET_LINK_TYPE` from `@repo/types` if nothing else references it.
- **Rationale:** Unused; avatar FK supersedes storing profile image via that link table. POST/HISTORY gallery remains out of scope (can return later as a new change if needed).

### 3. API still returns URL string

- **Choice:** Repos left-join `assets` and map `url` → `avatar`.
- **Rationale:** Locked previously; zero UI churn.

### 4. Legacy text discarded

- **Choice:** No string→asset backfill.
- **Rationale:** Unsafe without known asset rows.

## Risks / Trade-offs

- **[Risk] Dropping `user_assets_lnk` loses unused gallery shape** → Mitigation: table unused in repos; document in DATABASE.md.
- **[Risk] Three-table ALTER in one migration** → Mitigation: single drizzle generate; review SQL carefully on SQLite.
- **[Risk] Missed `owners.avatar` / `users.avatar` / `staff.avatar` selects** → Mitigation: repo grep before land.

## Migration Plan

1. Update three schemas; remove `user-asset-lnk.ts` export.
2. `pnpm db:generate`; ensure DROP `user_assets_lnk` + avatar column replacements.
3. Migrate local DB; smoke owner/staff/user profile GET.
4. Update DATABASE.md inventory.

## Open Questions

- None.
