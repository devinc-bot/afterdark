import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const loaderSource = readFileSync(join(here, 'loader.tsx'), 'utf8')
const globalsSource = readFileSync(join(here, '../../globals.css'), 'utf8')

/** Measured light session surface / background from globals (`--color-surface`). */
const LIGHT_SURFACE = '#f4f5f2'

/**
 * Loader `--on` must not be plain `var(--color-primary)` alone in light:
 * light `--color-primary` `#65a30d` is ~2.8:1 on `#f4f5f2` (fails WCAG non-text UI 3:1).
 *
 * Accepted wiring:
 * - Preferred: `var(--color-loader-on)` with a dedicated light-safe token in globals
 * - Alternative: `var(--color-primary-hover)` (light `#4d7c0f` ≈4.56:1 on `#f4f5f2`)
 */
const LIGHT_SAFE_ON_VARS = ['var(--color-loader-on)', 'var(--color-primary-hover)'] as const

function styleVarAssignment(source: string, name: 'on' | 'off'): string {
  const match = source.match(new RegExp(`['"]--${name}['"]:\\s*['"]([^'"]+)['"]`))
  expect(match, `expected Loader style --${name} assignment`).not.toBeNull()
  return match![1]
}

function cssVarHex(css: string, scope: 'theme' | 'light', varName: string): string | null {
  const block =
    scope === 'light'
      ? css.match(/html\[data-theme=['"]light['"]\]\s*\{([\s\S]*?)\n\}/)?.[1]
      : css.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1]
  if (!block) return null
  const match = block.match(new RegExp(`${escapeRegExp(varName)}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`))
  return match?.[1] ?? null
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function srgbChannelToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number {
  const normalized = hex.replace('#', '')
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((ch) => `${ch}${ch}`)
          .join('')
      : normalized
  const value = Number.parseInt(full, 16)
  const r = srgbChannelToLinear((value >> 16) & 255)
  const g = srgbChannelToLinear((value >> 8) & 255)
  const b = srgbChannelToLinear(value & 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground)
  const l2 = relativeLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

test('loader off fill uses a theme CSS variable, not hardcoded #404040', () => {
  const off = styleVarAssignment(loaderSource, 'off')

  expect(off).not.toBe('#404040')
  expect(off).toMatch(/^var\(--color-[a-z0-9-]+\)$/)
})

test('loader on fill uses a light-safe theme token (loader-on or primary-hover)', () => {
  const on = styleVarAssignment(loaderSource, 'on')

  // Reject insufficient light primary; see LIGHT_SAFE_ON_VARS comment above.
  expect(on).not.toBe('var(--color-primary)')
  expect(LIGHT_SAFE_ON_VARS).toContain(on)
})

test('globals light loader/primary-hover wiring keeps on-accent ≥3:1 on light surface', () => {
  const on = styleVarAssignment(loaderSource, 'on')
  expect(LIGHT_SAFE_ON_VARS).toContain(on)

  if (on === 'var(--color-loader-on)') {
    const lightLoaderOn = cssVarHex(globalsSource, 'light', '--color-loader-on')
    expect(lightLoaderOn, 'expected --color-loader-on hex in html[data-theme=light]').toBeTruthy()
    expect(contrastRatio(lightLoaderOn!, LIGHT_SURFACE)).toBeGreaterThanOrEqual(3)
    return
  }

  // Alternative path: primary-hover must remain light-safe (≥3:1 on #f4f5f2).
  const lightPrimaryHover = cssVarHex(globalsSource, 'light', '--color-primary-hover')
  expect(lightPrimaryHover).toBeTruthy()
  expect(contrastRatio(lightPrimaryHover!, LIGHT_SURFACE)).toBeGreaterThanOrEqual(3)
})

test('when --color-loader-on exists, dark theme keeps a bright on accent', () => {
  const darkLoaderOn = cssVarHex(globalsSource, 'theme', '--color-loader-on')
  const lightLoaderOn = cssVarHex(globalsSource, 'light', '--color-loader-on')

  if (!darkLoaderOn && !lightLoaderOn) {
    // No dedicated tokens yet — light-safe on fill test covers primary-hover alternative.
    expect(LIGHT_SAFE_ON_VARS).toEqual(expect.arrayContaining(['var(--color-loader-on)']))
    return
  }

  expect(darkLoaderOn, 'expected --color-loader-on hex in @theme (dark default)').toBeTruthy()
  // Bright accent on dark surfaces: luminance should stay high (lime-like), not a dark green.
  expect(relativeLuminance(darkLoaderOn!)).toBeGreaterThan(0.4)
})

test('when --color-loader-off exists, Loader off references it', () => {
  const definesLoaderOff = /--color-loader-off\s*:/.test(globalsSource)
  if (!definesLoaderOff) {
    // Dedicated off token optional; off fill test still requires some --color-* var.
    expect(definesLoaderOff).toBe(false)
    return
  }

  expect(styleVarAssignment(loaderSource, 'off')).toBe('var(--color-loader-off)')
})
