---
name: Repo Soft Depth
description: Cheerful, original, minimal events brand — product-hero surfaces with soft depth, dual theme, bilingual UI.
colors:
  background: '#131314'
  foreground: '#e5e2e3'
  surface: '#131314'
  surface-muted: '#1c1b1c'
  surface-raised: '#201f20'
  surface-high: '#2a2a2b'
  surface-highest: '#353436'
  surface-lowest: '#0e0e0f'
  primary: '#ecb1ff'
  on-primary: '#4a1a5e'
  primary-hover: '#7d4a90'
  accent: '#e8006e'
  secondary: '#c8c6c7'
  muted-foreground: '#d0c3cf'
  ink-muted: '#d5c0d7'
  outline: '#998d99'
  border: '#514254'
  hairline: '#4d444e'
  error: '#ffb4ab'
  error-container: '#93000a'
  ring: '#ecb1ff'
  chart-1: '#ecb1ff'
  chart-2: '#ffb1c3'
  chart-3: '#c8c6c7'
  chart-4: '#7d4a90'
  chart-5: '#e8006e'
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
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  control: 12px
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
    rounded: '{rounded.control}'
    padding: 0 20px
    height: 40px
  button-outline:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.control}'
    padding: 0 20px
    height: 40px
  card:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.control}'
  input:
    backgroundColor: '{colors.surface-muted}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.control}'
---

## Overview

Repo’s visual system lives in `packages/ui/src/globals.css` (Tailwind v4 `@theme` tokens) and is shared by `apps/web` (brand surface) and `apps/dashboard` (ops surface).

**Personality:** Alegre · Original · Minimalista — aligned with [dock.cool](https://www.dock.cool/#hero): product as hero, soft depth on dark (and soon light), large type, short copy, generous air.

**Color strategy:** Restrained accent on tinted neutrals. Primary lilac (`#ecb1ff`) and magenta accent (`#e8006e`) are sparingly used; surfaces carry most of the UI.

**Themes:** Dark is the default (`data-theme="dark"`). Light is first-class via `[data-theme="light"]` overrides in `globals.css` and `ThemeProvider` / `ThemeToggle` in `@repo/ui`. Persist key: `repo:theme`.

**Locales:** UI copy via `@repo/i18n` — **English and Spanish**. Identifiers stay English. `document.documentElement.lang` follows the active locale.

**Density:** Comfortable. Dashboard prioritizes speed and clarity; web may use more atmosphere (washes, hero imagery) without neon costume.

## Colors

### Neutrals (dark, shipping)

| Role | Hex | Use |
| --- | --- | --- |
| Background / surface | `#131314` | Page canvas |
| Surface muted / low | `#1c1b1c` | Recessed panels, inputs |
| Surface raised / card | `#201f20` | Cards, elevated blocks |
| Surface high | `#2a2a2b` | Popovers, hover lifts |
| Surface highest | `#353436` | Strongest fill step |
| Foreground / ink | `#e5e2e3` | Primary text |
| Muted foreground | `#d0c3cf` / `#d5c0d7` | Secondary text |
| Border / hairline | `#514254` / `#4d444e` | Dividers, control edges |

### Brand

| Role | Hex | Use |
| --- | --- | --- |
| Primary | `#ecb1ff` | CTAs, focus ring, charts |
| On-primary | `#4a1a5e` | Text on primary fills |
| Primary hover | `#7d4a90` | Hover / inverse primary |
| Accent | `#e8006e` | Rare emphasis (not default chrome) |

### Feedback

Error text `#ffb4ab`, error container `#93000a`. Focus ring matches primary.

### Light mode

`[data-theme="light"]` mirrors the dark surface ramp toward near-white with low chroma on the primary hue (`#f5f3f7` canvas, white raised surfaces). Primary deepens to `#7d4a90` for contrast on light fills. Prefer surface steps over borders for hierarchy.

## Typography

| Role | Family | Notes |
| --- | --- | --- |
| Display / headings | Montserrat | 600–700; scale 20→48px (+ mobile 28px headline) |
| Body | Inter | 14px base / 16px large; comfortable line-height |
| Labels | Geist Sans | Slight tracking on sm/xs labels |
| Mono | Geist Mono | Code, dense metadata |

Scale (px): 10 / 12 / 14 / 16 / 20 / 24 / 32 / 48 (+ 56–60 display extras). Prefer `text-wrap: balance` on headings. Cap display clamp max around 6rem. Public heroes may go large; dashboard stays tighter.

**Reflex note:** Inter is already shipping — preserve it for identity continuity. New decorative pairings should still avoid saturated AI display-serif defaults.

## Elevation

Depth is **tonal surfaces first**, then soft shadow:

- Surface steps (`lowest` → `highest`) for most hierarchy
- `--shadow-glass`: `0 8px 32px rgba(0,0,0,0.35)` for floating panels when needed
- Primary glow / inner glow / `neon-*` utilities exist in CSS but are **legacy costume** — prefer soft depth; do not lead new UI with glow or `neon-glow-text`

Glass (`backdrop-filter` cards) is rare and purposeful, not default chrome.

Motion: 150–500ms with standard / emphasized curves; landing fade-up and hero drift exist with `prefers-reduced-motion` cutoffs. Prefer opacity/transform; no bounce.

## Components

Shared primitives in `@repo/ui` (shadcn-based):

- **Button:** `rounded-control` (12px), primary fill / outline / ghost / gradient-border variants; instant transition; `active:scale-[0.98]` with motion-reduce off.
- **Inputs / fields:** muted surface fill, hairline or gradient-border field treatments, invalid → error border.
- **Cards:** raised surface, control radius; avoid nested cards.
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
