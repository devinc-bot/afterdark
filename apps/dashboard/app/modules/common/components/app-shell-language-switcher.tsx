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
} from '@afterdark/ui'
import { useLanguage } from '@afterdark/i18n/client'
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, type Language } from '@afterdark/i18n/config'
import { Languages } from 'lucide-react'

export function AppShellLanguageSwitcher() {
  const { t } = useTranslation('dashboard')
  const { language, setLanguage } = useLanguage()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="gap-3 rounded-none"
              aria-label={t('nav.language')}
            >
              <span className="flex size-9 shrink-0 items-center justify-center [&_svg]:size-7">
                <Languages aria-hidden="true" />
              </span>
              <span>{LANGUAGE_NAMES[language]}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-full">
            <DropdownMenuRadioGroup
              value={language}
              onValueChange={(value) => void setLanguage(value as Language)}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuRadioItem
                  key={lang}
                  value={lang}
                  className="cursor-pointer hover:bg-surface-container-high data-[state=checked]:bg-surface-container data-[state=checked]:font-semibold data-[state=checked]:text-ink"
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
