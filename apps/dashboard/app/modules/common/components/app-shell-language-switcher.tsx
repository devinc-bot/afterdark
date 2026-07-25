import { useTranslation } from 'react-i18next'
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui'
import { useLanguage } from '@repo/i18n/client'
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, type Language } from '@repo/i18n/config'
import { ChevronUp, Languages } from 'lucide-react'

export function AppShellLanguageSwitcher() {
  const { t } = useTranslation('dashboard')
  const { language, setLanguage } = useLanguage()
  const languageName = LANGUAGE_NAMES[language]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="group/lang-trigger data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label={`${t('nav.language')}: ${languageName}`}
            >
              <Languages aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate transition-opacity duration-(--duration-instant) motion-reduce:transition-none">
                {languageName}
              </span>
              <ChevronUp
                aria-hidden="true"
                className={cn(
                  'ml-auto size-4 shrink-0 opacity-60',
                  'transition-transform duration-(--duration-fast) ease-emphasized',
                  'group-data-[state=open]/lang-trigger:rotate-180',
                  'motion-reduce:transition-none'
                )}
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
              value={language}
              onValueChange={(value) => void setLanguage(value as Language)}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuRadioItem
                  key={lang}
                  value={lang}
                  className="data-[state=checked]:font-medium"
                >
                  {LANGUAGE_NAMES[lang]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
