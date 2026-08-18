import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  THEME,
  THEMES,
  useTheme,
  type Theme,
} from '@repo/ui'
import { ChevronUp, Moon, Sun } from 'lucide-react'

export function AppShellThemeSwitcher() {
  const { t } = useTranslation('admin')
  const { theme, setTheme } = useTheme()
  const ThemeIcon = theme === THEME.DARK ? Moon : Sun
  const themeLabel = theme === THEME.DARK ? t('nav.themeDark') : t('nav.themeLight')

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="group/theme-trigger data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label={`${t('nav.theme')}: ${themeLabel}`}
            >
              <ThemeIcon aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{themeLabel}</span>
              <ChevronUp
                aria-hidden="true"
                className="ml-auto size-4 shrink-0 opacity-60 transition-transform duration-(--duration-fast) ease-emphasized group-data-[state=open]/theme-trigger:rotate-180 motion-reduce:transition-none"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="top"
            sideOffset={4}
            className="min-w-(--radix-dropdown-menu-trigger-width)"
          >
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as Theme)}
            >
              {THEMES.map((option) => (
                <DropdownMenuRadioItem
                  key={option}
                  value={option}
                  className="data-[state=checked]:font-medium"
                >
                  {option === THEME.DARK ? t('nav.themeDark') : t('nav.themeLight')}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
