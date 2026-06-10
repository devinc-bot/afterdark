---
name: Afterdark Pulse Refined
colors:
  surface: "#131314"
  surface-dim: "#131314"
  surface-bright: "#39393a"
  surface-container-lowest: "#0e0e0f"
  surface-container-low: "#1c1b1c"
  surface-container: "#201f20"
  surface-container-high: "#2a2a2b"
  surface-container-highest: "#353436"
  on-surface: "#e5e2e3"
  on-surface-variant: "#d0c3cf"
  inverse-surface: "#e5e2e3"
  inverse-on-surface: "#313031"
  outline: "#998d99"
  outline-variant: "#4d444e"
  surface-tint: "#ecb1ff"
  primary: "#f8d7ff"
  on-primary: "#4a1a5e"
  primary-container: "#ecb1ff"
  on-primary-container: "#6f3e82"
  inverse-primary: "#7d4a90"
  secondary: "#c8c6c7"
  on-secondary: "#303031"
  secondary-container: "#474748"
  on-secondary-container: "#b6b5b6"
  tertiary: "#ffd9e0"
  on-tertiary: "#66002c"
  tertiary-container: "#ffb1c3"
  on-tertiary-container: "#a5004c"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#f8d8ff"
  primary-fixed-dim: "#ecb1ff"
  on-primary-fixed: "#320046"
  on-primary-fixed-variant: "#633276"
  secondary-fixed: "#e4e2e3"
  secondary-fixed-dim: "#c8c6c7"
  on-secondary-fixed: "#1b1b1c"
  on-secondary-fixed-variant: "#474748"
  tertiary-fixed: "#ffd9e0"
  tertiary-fixed-dim: "#ffb1c3"
  on-tertiary-fixed: "#3f0019"
  on-tertiary-fixed-variant: "#8f0041"
  background: "#131314"
  on-background: "#e5e2e3"
  surface-variant: "#353436"
typography:
  headline-4xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 56px
  headline-3xl:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
  headline-2xl:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  headline-xl:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 18px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.05em
  label-xs:
    fontFamily: Geist
    fontSize: 10px
    fontWeight: "600"
    lineHeight: 14px
    letterSpacing: 0.1em
  headline-3xl-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  "1": 2px
  "2": 4px
  "3": 6px
  "4": 8px
  "5": 10px
  "6": 12px
  "7": 16px
  "8": 24px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Style Foundations

### Design Principles

- Visual style: structured, tokenized, content-first
- Design language: Cyberpunk Glassmorphism
- Personality: Techno-Elite
- Density: Comfortable
- Accessibility: High contrast dark theme

### Font System

font.family.display=Montserrat
font.family.heading=Montserrat
font.family.body=Inter
font.family.mono=GeistMono
font.family.stack.display=Montserrat, sans-serif
font.family.stack.body=Inter, sans-serif
font.family.stack.mono=GeistMono, ui-monospace, SFMono-Regular, Roboto Mono, Menlo, Monaco, Liberation Mono, DejaVu Sans Mono, Courier New, monospace
font.size.base=14px
font.weight.base=400
font.lineHeight.base=20px

### Typography Scale

font.size.xs=10px
font.size.sm=12px
font.size.md=14px
font.size.lg=16px
font.size.xl=20px
font.size.2xl=24px
font.size.3xl=32px
font.size.4xl=48px

### Core Tokens

color.text.primary=#e5e2e3
color.text.secondary=#d5c0d7
color.text.tertiary=#ffffff
color.text.inverse=#313031
color.surface.base=#131314
color.surface.muted=#1c1b1c
color.surface.raised=#201f20
color.surface.strong=rgba(0,0,0,0.60)
color.border.default=#514254
color.border.strong=#bf00ff
color.primary=#ecb1ff
color.accent=#e8006e

### Spacing Tokens

space.1=2px
space.2=4px
space.3=6px
space.4=8px
space.5=10px
space.6=12px
space.7=16px
space.8=24px

### Radius Tokens

radius.xs=2px
radius.sm=4px
radius.md=6px
radius.lg=8px
radius.xl=12px
radius.full=9999px

### Shadow & Glow Tokens

shadow.glass=0 8px 32px rgba(0,0,0,0.35)
shadow.primaryGlow=
0 0 8px rgba(236,177,255,0.20),
0 0 24px rgba(236,177,255,0.15)
shadow.innerGlow=
inset 0 0 10px rgba(236,177,255,0.10)

### Motion Tokens

motion.duration.instant=150ms
motion.duration.fast=200ms
motion.duration.normal=300ms
motion.duration.slow=500ms
motion.easing.standard=cubic-bezier(0.4,0,0.2,1)
motion.easing.emphasized=cubic-bezier(0.2,0,0,1)
