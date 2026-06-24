---
target: user-management-view.tsx
total_score: 26
p0_count: 0
p1_count: 2
p2_count: 3
timestamp: 2026-06-23T15-07-29Z
slug: user-management-components-user-management-view-tsx
---

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                                                  |
| --------- | ------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | Create flow confirms via toast; status toggle has no undo feedback beyond label swap                       |
| 2         | Match System / Real World       | 3         | Spanish copy is natural; "Club" vs "Club asignado" label mismatch; `lastActiveLabel` is cosmetic mock text |
| 3         | User Control and Freedom        | 2         | No confirmation before deactivating access; edit is a dead-end toast                                       |
| 4         | Consistency and Standards       | 3         | Matches dashboard header/grid vocabulary; minor page padding drift (`px-4` vs `px-6`)                      |
| 5         | Error Prevention                | 2         | Zod on submit only; no guardrail on destructive status toggle                                              |
| 6         | Recognition Rather Than Recall  | 3         | Table keeps identity/role/club visible; roles need inline explanation                                      |
| 7         | Flexibility and Efficiency      | 2         | No search, filter, sort, or bulk actions for growing rosters                                               |
| 8         | Aesthetic and Minimalist Design | 3         | Focused admin layout; form card icon + KPI big-number pattern add mild noise                               |
| 9         | Error Recovery                  | 3         | Inline field errors in Spanish; validation deferred until submit                                           |
| 10        | Help and Documentation          | 2         | Page description helps; no guidance on what each operational role permits                                  |
| **Total** |                                 | **26/40** | **Acceptable — solid prototype, not ship-ready for production ops**                                        |

**Cognitive load:** 2 checklist failures (dual-panel desktop focus; 5-field form without section breaks). Moderate load — manageable for 4 mock rows, will strain at scale.

**Emotional journey:** Low stakes on create (positive toast peak). Valley on edit click (promise → "próximamente" toast). High-stakes deactivate has no reassurance step — anxiety spike for venue owners.

## Anti-Patterns Verdict

**LLM assessment:** Does not read as generic AI slop. No gradient text, eyebrow kickers, numbered sections, or side-stripe borders. The layout (form + KPI left, table right) is familiar admin grammar — earned for product register, not decorative. Mild tells: decorative `UserPlus` tile on the form card, and the `KpiInformation` primary variant (large accent number) brushes the hero-metric template without crossing into a metrics grid. Spanish copy and token-based avatar tones feel intentional and on-brand for staff tooling.

**Deterministic scan:** `detect.mjs` on `apps/dashboard/app/modules/user-management` returned **0 findings** (clean).

**Browser visualization:** Skipped — no browser automation available in this session. Dev server is running (`pnpm dev`); manual review at `http://localhost:3002/users` recommended for responsive/tablet pass.

## Overall Impression

A competent, restrained staff-admin surface that matches the dashboard's emerging vocabulary. The architecture (view orchestrates form + KPI + table) is clean. The biggest gap is trust: destructive actions and fake edit affordances undermine an otherwise precise operations page. This is a good mock shell; production needs guardrails and findability before owners rely on it nightly.

## What's Working

1. **Information architecture** — Create on the left, roster on the right co-locates intent and outcome. New users appear at the top of the table immediately; no context switching.
2. **Copy discipline** — Spanish throughout, "equipo" not "staff", operational role labels ("Control de entradas", "Gestión de barra"). Empty state points to the form.
3. **Accessibility baseline** — Status `Switch` pairs control + text label; edit button and toggle carry `aria-label`s; table section has `aria-labelledby`.

## Priority Issues

### [P1] Destructive status toggle without confirmation

**Why it matters:** Deactivating door access is irreversible in the operator's mind. One mis-tap on a dense table row removes someone's ability to work tonight.
**Fix:** Add a lightweight confirm pattern for deactivation only (inline dialog or `AlertDialog`). Keep activation instant.
**Suggested command:** `/impeccable harden`

### [P1] Edit button promises a flow that doesn't exist

**Why it matters:** The pencil icon is a standard edit affordance. Clicking it and getting a "próximamente" toast erodes trust in every other control on the page.
**Fix:** Either wire a real edit drawer/modal, or disable the button with a tooltip explaining availability — don't look clickable until it is.
**Suggested command:** `/impeccable harden`

### [P2] Table won't scale without findability

**Why it matters:** Four mock users fit; twenty across four clubs won't. Power users will scan by name, club, or role constantly.
**Fix:** Add search (name/email) and filters (club, role, status) above the table header; consider column sort on name/club.
**Suggested command:** `/impeccable shape`

### [P2] Form validates only on submit

**Why it matters:** Five fields with password + selects — users discover all errors at once after clicking "Crear cuenta", increasing correction cost.
**Fix:** Move validators to `onBlur` or `onChange` for high-error fields (email, password, club).
**Suggested command:** `/impeccable polish`

### [P2] Mobile table forces horizontal scroll

**Why it matters:** `min-w-[880px]` on the table guarantees sideways scrolling on phones. Casey can't review roster one-handed in the venue.
**Fix:** Responsive card list below `lg`, or hide low-priority columns with a compact row layout.
**Suggested command:** `/impeccable adapt`

## Persona Red Flags

**Alex (Power User):** No search/filter/sort on the roster. Horizontal scroll on narrow viewports. Edit button is a noop — wastes a click per row. Cannot bulk-deactivate staff before an event.

**Sam (Accessibility):** Table horizontal scroll traps keyboard focus in a scroll region. Role icons are `aria-hidden` with text beside them — OK, but club badge + 6 columns is a long row announcement. Form validation errors may not announce on submit without live region (verify with screen reader).

**María (Owner Operator — afterdark staff):** "Rol operativo" doesn't say what each role can access. Deactivating Marco has no "¿Estás seguro?" — she'll hesitate or mis-click under pressure. KPI shows total headcount but not "quién está afuera ahora" (inactive count is buried in subtext math).

## Minor Observations

- `showing(n, n)` always shows identical visible/total until pagination exists — misleading copy.
- Page header `max-w-2xl` while content is `max-w-6xl` — description feels visually detached on wide screens.
- `px-4 py-6` here vs `px-6 py-8` on dashboard home — minor rhythm inconsistency.
- `lastActiveLabel` is freeform mock strings, not relative timestamps — will feel fake once real data lands.
- KPI uses `variant="primary"` accent number — fine alone, but watch for hero-metric creep if more KPIs appear.

## Questions to Consider

- What if deactivation required typing the user's name — only for owners, only on deactivate?
- Does the KPI earn its pixels, or should active/inactive counts live as compact stats in the table header?
- What would this page look like if the table were the hero and create were a slide-over triggered by one button?
