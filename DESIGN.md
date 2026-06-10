# Xata – One Postgres, thousands of branches.

## Mission

Create implementation-ready, token-driven UI guidance for Xata – One Postgres, thousands of branches. that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand

- Product/brand: Xata – One Postgres, thousands of branches.
- URL: https://xata.io/
- Audience: developers and technical teams
- Product surface: marketing site

## Style Foundations

- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=GeistMono`, `font.family.stack=GeistMono, ui-monospace, SFMono-Regular, Roboto Mono, Menlo, Monaco, Liberation Mono, DejaVu Sans Mono, Courier New, monospace`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=12.8px`, `font.size.md=14px`, `font.size.lg=16px`, `font.size.xl=18px`, `font.size.2xl=20px`, `font.size.3xl=48px`, `font.size.4xl=72px`
- Color palette: `color.text.primary=lab(100 0 0)`, `color.text.secondary=lab(84.9837 0.601262 -2.17986)`, `color.text.tertiary=lab(65.6464 1.53497 -5.42429)`, `color.text.inverse=#ffffff`, `color.surface.base=#000000`, `color.surface.muted=lab(2.51107 0.242703 -0.886115)`, `color.surface.raised=oklab(0.273999 0.00165433 -0.00575992 / 0.25)`, `color.surface.strong=oklab(0.273999 0.00165433 -0.00575992 / 0.3)`, `color.border.default=lab(15.0806 4.80817 -10.5003)`, `color.border.muted=oklab(0.141 0.00136173 -0.00480696 / 0.5)`
- Spacing scale: `space.1=6px`, `space.2=8px`, `space.3=10px`, `space.4=16px`, `space.5=24px`, `space.6=32px`, `space.7=40px`, `space.8=65px`
- Radius/shadow/motion tokens: `radius.xs=6px`, `radius.sm=8px`, `radius.md=33554400px` | `shadow.1=oklab(0.999994 0.0000455678 0.0000200868 / 0.25) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, lab(100 0 0) 0px 0px 0px 0px, oklab(0.141 0.00136173 -0.00480696 / 0.2) 0px 4px 6px -1px, oklab(0.141 0.00136173 -0.00480696 / 0.2) 0px 2px 4px -2px`, `shadow.2=oklab(0 0 0 / 0) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, lab(100 0 0) 0px 0px 0px 0px, oklab(0.141 0.00136173 -0.00480696 / 0.1) 0px 1px 3px 0px, oklab(0.141 0.00136173 -0.00480696 / 0.1) 0px 1px 2px -1px` | `motion.duration.instant=150ms`, `motion.duration.fast=200ms`, `motion.duration.normal=300ms`

## Accessibility

- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone

Concise, confident, implementation-focused.

## Rules: Do

- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't

- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow

1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure

- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations

- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (42), buttons (11), navigation (2), lists (1).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates

- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
