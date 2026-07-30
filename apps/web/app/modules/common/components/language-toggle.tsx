import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@repo/i18n/client'
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, type Language } from '@repo/i18n/config'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  cn,
} from '@repo/ui'

type LanguageToggleProps = {
  className?: string
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { t } = useTranslation('landing')
  const { language, setLanguage } = useLanguage()
  const languageName = LANGUAGE_NAMES[language]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('size-11 shrink-0 rounded-app-sm', className)}
          aria-label={`${t('nav.language')}: ${languageName}`}
          title={languageName}
        >
          <Languages className="size-5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="min-w-40">
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
  )
}
