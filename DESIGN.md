---
name: Repo Citrus Soft
description: Cheerful, original, minimal events brand — Citrus Soft palette A/B variant.
colors:
  background: '#121311'
  foreground: '#e6e7e2'
  surface: '#121311'
  surface-muted: '#1a1b18'
  surface-raised: '#1e1f1c'
  surface-high: '#282a26'
  surface-highest: '#33352f'
  surface-lowest: '#0d0e0c'
  primary: '#d4e85a'
  on-primary: '#2a3208'
  primary-hover: '#6b7a1a'
  accent: '#ff6b3d'
  secondary: '#c6c7c2'
  muted-foreground: '#c5c8b8'
  ink-muted: '#b8bcab'
  outline: '#8e9280'
  border: '#4a4e42'
  hairline: '#44473c'
  error: '#ffb4ab'
  error-container: '#93000a'
  ring: '#d4e85a'
  chart-1: '#d4e85a'
  chart-2: '#ffb399'
  chart-3: '#c6c7c2'
  chart-4: '#6b7a1a'
  chart-5: '#ff6b3d'
typography:
  display:
    fontFamily: Montserrat, sans-serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  headline:
    fontFamily: Montserrat, sans-serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  title:
    fontFamily: Montserrat, sans-serif
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body:
    fontFamily: Inter, sans-serif
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter, sans-serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label:
    fontFamily: 'Geist Sans', sans-serif
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono:
    fontFamily: 'Geist Mono', ui-monospace, monospace
    fontSize: 12px
    fontWeight: '400'
rounded:
  app: 16px
  app-xs: calc(app - 8px)
  app-sm: calc(app - 4px)
  app-lg: calc(app + 4px)
  app-xl: calc(app + 8px)
  xs: 4px
  sm: 6px
  md: calc(app - 8px)
  lg: calc(app - 4px)
  xl: app
  full: 9999px
spacing:
  '1': 2px
  '2': 4px
  '3': 6px
  '4': 8px
  '5': 10px
  '6': 12px
  '7': 16px
  '8': 24px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.app}'
    padding: 0 20px
    height: 40px
  button-outline:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.app}'
    padding: 0 20px
    height: 40px
  card:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.app}'
  input:
    backgroundColor: '{colors.surface-muted}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.app}'
---

## Overview

Repo’s visual system lives in `packages/ui/src/globals.css` (Tailwind v4 `@theme` tokens) and is shared by `apps/web` (brand surface) and `apps/dashboard` (ops surface).

**Personality:** Alegre · Original · Minimalista — aligned with [dock.cool](https://www.dock.cool/#hero): product as hero, soft depth on dark (and soon light), large type, short copy, generous air.

**Color strategy:** Restrained accent on olive-tinted neutrals. Primary citrus (`#d4e85a`) and coral accent (`#ff6b3d`) are sparingly used; surfaces carry most of the UI.

**Themes:** Dark is the default (`data-theme="dark"`). Light is first-class via `[data-theme="light"]` overrides in `globals.css` and `ThemeProvider` / `ThemeToggle` in `@repo/ui`. Persist key: `repo:theme`.

**Locales:** UI copy via `@repo/i18n` — **English and Spanish**. Identifiers stay English. `document.documentElement.lang` follows the active locale.

**Density:** Comfortable. Dashboard prioritizes speed and clarity; web may use more atmosphere (washes, hero imagery) without neon costume.

## Colors

### Neutrals (dark, shipping)

| Role                  | Hex                   | Use                     |
| --------------------- | --------------------- | ----------------------- |
| Background / surface  | `#121311`             | Page canvas             |
| Surface muted / low   | `#1a1b18`             | Recessed panels, inputs |
| Surface raised / card | `#1e1f1c`             | Cards, elevated blocks  |
| Surface high          | `#282a26`             | Popovers, hover lifts   |
| Surface highest       | `#33352f`             | Strongest fill step     |
| Foreground / ink      | `#e6e7e2`             | Primary text            |
| Muted foreground      | `#c5c8b8` / `#b8bcab` | Secondary text          |
| Border / hairline     | `#4a4e42` / `#44473c` | Dividers, control edges |

### Brand

| Role          | Hex       | Use                                |
| ------------- | --------- | ---------------------------------- |
| Primary       | `#d4e85a` | CTAs, focus ring, charts           |
| On-primary    | `#2a3208` | Text on primary fills              |
| Primary hover | `#6b7a1a` | Hover / inverse primary            |
| Accent        | `#ff6b3d` | Rare emphasis (not default chrome) |

### Feedback

Error text `#ffb4ab`, error container `#93000a`. Focus ring matches primary.

### Light mode

`[data-theme="light"]` mirrors the dark surface ramp toward near-white with low chroma on the citrus hue (`#f4f5f2` canvas, white raised surfaces). Primary fill is `#65a30d` with white on-primary; soft lime `#84cc16` stays on primary-container / chart. Hover deepens to `#4d7c0f`. Prefer surface steps over borders for hierarchy.

## Typography

| Role               | Family     | Notes                                           |
| ------------------ | ---------- | ----------------------------------------------- |
| Display / headings | Montserrat | 600–700; scale 20→48px (+ mobile 28px headline) |
| Body               | Inter      | 14px base / 16px large; comfortable line-height |
| Labels             | Geist Sans | Slight tracking on sm/xs labels                 |
| Mono               | Geist Mono | Code, dense metadata                            |

Scale (px): 10 / 12 / 14 / 16 / 20 / 24 / 32 / 48 (+ 56–60 display extras). Prefer `text-wrap: balance` on headings. Cap display clamp max around 6rem. Public heroes may go large; dashboard stays tighter.

**Reflex note:** Inter is already shipping — preserve it for identity continuity. New decorative pairings should still avoid saturated AI display-serif defaults.

## Elevation

Depth is **tonal surfaces first**, then soft shadow:

- Surface steps (`lowest` → `highest`) for most hierarchy
- `--shadow-glass`: layered soft depth (top highlight + contact + ambient) for floating panels; theme-aware dark/light
- `.glass-panel`: purposeful glass for menus/popovers (`backdrop-filter` + translucent popover fill); solid fallback without support
- Primary glow / inner glow / `neon-*` utilities exist in CSS but are **legacy costume** — prefer soft depth; do not lead new UI with glow or `neon-glow-text`

Glass (`backdrop-filter`) is rare and purposeful — floating panels only, not default chrome.

Motion: 150–500ms with standard / emphasized curves; landing fade-up and hero drift exist with `prefers-reduced-motion` cutoffs. Prefer opacity/transform; no bounce.

## Components

Shared primitives in `@repo/ui` (shadcn-based):

- **Button:** `rounded-app` (12px), primary fill / outline / ghost / gradient-border variants; instant transition; `active:scale-[0.98]` with motion-reduce off.
- **Inputs / fields:** muted surface fill, hairline or gradient-border field treatments, invalid → error border.
- **Cards:** raised surface, app radius; avoid nested cards.
- **Focus:** 2px ring primary at 25% opacity (buttons) / global `:focus-visible` ring.
- **App chrome:** sidebar uses lowest surface; web public shell may add atmosphere washes — keep them soft, not neon.

Dashboard: precise forms, tables, sheets — minimal atmosphere. Web: product/event imagery as hero when the surface calls for it.

## Do's and Don'ts

**Do**

- Lead with real product or event surfaces (lists, maps, tickets, venue UI)
- Use soft surface steps and space for hierarchy
- Keep copy short; bilingual (EN/ES) via i18n
- Plan every new surface for dark and light contrast
- Respect reduced motion

**Don't**

- Neon glow, gradient text, or nightclub-flyer chrome as brand default
- Dense card grids with icon + title + blurb repeated
- Tiny uppercase tracked eyebrows on every section
- Spanish-only or dark-only assumptions in new work
- Decorative glassmorphism stacks or competing accents
