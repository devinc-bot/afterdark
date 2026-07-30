import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/button.tsx'
import { THEME } from './theme.ts'
import { useTheme } from './theme-provider.tsx'

type ThemeToggleProps = {
  className?: string
  size?: 'default' | 'sm' | 'icon'
}

export function ThemeToggle({ className, size = 'icon' }: ThemeToggleProps) {
  const { t } = useTranslation('common')
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === THEME.DARK

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={className}
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
      title={isDark ? t('theme.light') : t('theme.dark')}
    >
      {isDark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
    </Button>
  )
}
