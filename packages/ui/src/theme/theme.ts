export const THEME = {
  DARK: 'dark',
  LIGHT: 'light',
} as const

export type Theme = (typeof THEME)[keyof typeof THEME]

export const THEMES: Theme[] = [THEME.DARK, THEME.LIGHT]

export const DEFAULT_THEME: Theme = THEME.DARK

export const THEME_STORAGE_KEY = 'repo:theme'

export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark';}})();`

export function isTheme(value: unknown): value is Theme {
  return value === THEME.DARK || value === THEME.LIGHT
}

export function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
}

export function persistTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function setTheme(theme: Theme): void {
  if (!isTheme(theme)) return
  applyTheme(theme)
  persistTheme(theme)
}
