---
target: apps/web landing
total_score: 25
p0_count: 0
p1_count: 2
timestamp: 2026-07-25T01-37-01Z
slug: apps-web-app-modules-landing
---
# Critique: apps/web landing

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Theme toggle feedback clear; empty agenda state is honest |
| 2 | Match System / Real World | 2 | Copy still nightlife/club-centric vs general events PRODUCT |
| 3 | User Control and Freedom | 3 | Skip link, theme toggle, clear CTAs |
| 4 | Consistency and Standards | 2 | Brand string EventFlow vs Repo; light CTA contrast weak |
| 5 | Error Prevention | 3 | Auth chrome vs guest paths are clear |
| 6 | Recognition Rather Than Recall | 3 | Nav labels plain Spanish |
| 7 | Flexibility and Efficiency | 2 | No language control on public web chrome |
| 8 | Aesthetic and Minimalist Design | 3 | Hero image-led, airy type; soft depth improved |
| 9 | Error Recovery | 2 | Landing has little error surface; empty state OK |
| 10 | Help and Documentation | 2 | Organizer path buried in footer |
| **Total** | | **25/40** | **Fair → Good** |

## Anti-Patterns Verdict

**LLM assessment:** Not generic SaaS cream. Hero is image-led with real atmosphere. Residual risk: nightlife copy + EventFlow naming vs Repo/general-events PRODUCT; icon+title grids in clarity could tip toward template if overused. Cheerful / dock.cool energy is only partially present — still more nocturnal editorial than product-hero Mac-app polish.

**Deterministic scan:** `detect.mjs --json` on landing → `[]` (clean). No overlay injection run (dev server already live; CSP null).

## Overall Impression

Strong dark hero composition. Light mode now works end-to-end. Biggest gap: copy and brand naming still say “noche/club/EventFlow” while PRODUCT wants Repo + general events + alegre/minimal.

## What's Working

1. Full-bleed hero with brand as the display signal — passes brand-first test.
2. Soft depth / quieter neon utilities remove costume glow.
3. Theme toggle + `data-theme` light tokens verified in browser.

## Priority Issues

### [P1] Nightlife copy vs general-events PRODUCT
- **What:** Headlines and body lean hard into “noche”, “clubes”, “flyer”.
- **Why:** Mis-sells daytime/conference/pop-up venues; fights DOMAIN generalization.
- **Fix:** Rewrite landing EN/ES strings to event-agnostic cheerful tone.
- **Suggested command:** `/impeccable clarify apps/web landing copy`

### [P1] Light-mode primary CTA contrast
- **What:** Primary “Crear cuenta” fill can read faint on bright hero wash.
- **Why:** WCAG risk; undermines dual-theme requirement.
- **Fix:** Audit `LANDING_CTA_PRIMARY` against light surfaces; ensure on-primary contrast ≥4.5:1 on hero overlays.
- **Suggested command:** `/impeccable audit apps/web landing light`

### [P2] Brand naming EventFlow vs Repo
- **What:** UI still says EventFlow everywhere.
- **Why:** Agents and PRODUCT say Repo; users get mixed identity.
- **Fix:** Align `common` appName strings (or deliberate dual naming decision).
- **Suggested command:** `/impeccable clarify brand name`

### [P2] No language switcher on public web
- **What:** EN locale files exist; web chrome has no language control (dashboard does).
- **Why:** PRODUCT requires EN+ES; guests can’t switch.
- **Fix:** Add compact language control next to ThemeToggle in landing header.
- **Suggested command:** `/impeccable craft web language switcher`

### [P3] Organizer CTA only in footer
- **What:** “¿Organizás?” is easy to miss.
- **Why:** Split audience (attendee vs owner) under-served on first viewport by design — OK — but discovery of owner path is weak.
- **Fix:** Keep hero clean; strengthen footer or secondary entry.
- **Suggested command:** `/impeccable layout landing footer`

## Persona Red Flags

**Attendee (first visit):** Empty agenda + nightlife framing may feel “not for me” if seeking daytime events. Theme toggle helps; language switch missing.

**Owner evaluating the brand:** Footer-only organizer path; landing doesn’t show product UI as hero (dock.cool gap).

## Minor Observations

- Meta title still “eventos nocturnos”.
- Clarity section is a 3-up icon grid — acceptable once, don’t proliferate.
- Hero video + overlays need light-theme wash retune for ink readability.

## Questions to Consider

- What if the hero sold “tu entrada, lista” with a product UI mock instead of only crowd media?
- Should light mode use a different hero treatment so wash doesn’t fight ink?
- Is EventFlow a public brand and Repo an internal codename — or a rename debt?
