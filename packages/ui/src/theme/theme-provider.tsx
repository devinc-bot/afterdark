import { createContext, use, useEffect, useState, type ReactNode } from 'react'
import {
  applyTheme,
  DEFAULT_THEME,
  isTheme,
  persistTheme,
  readStoredTheme,
  THEME,
  type Theme,
} from './theme.ts'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)

  useEffect(() => {
    const next = readStoredTheme()
    setThemeState(next)
    applyTheme(next)
  }, [])

  const setTheme = (next: Theme) => {
    if (!isTheme(next)) return
    setThemeState(next)
    applyTheme(next)
    persistTheme(next)
  }

  const toggleTheme = () => {
    setTheme(theme === THEME.DARK ? THEME.LIGHT : THEME.DARK)
  }

  return <ThemeContext value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const value = use(ThemeContext)
  if (!value) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return value
}
