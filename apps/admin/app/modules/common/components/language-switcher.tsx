import { useLanguage } from '@repo/i18n/client'
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, type Language } from '@repo/i18n/config'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@repo/ui'
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { t } = useTranslation('admin')
  const { language, setLanguage } = useLanguage()
  const languageName = LANGUAGE_NAMES[language]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`${t('nav.language')}: ${languageName}`}
        >
          {language.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-40">
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(value) => void setLanguage(value as Language)}
        >
          {SUPPORTED_LANGUAGES.map((option) => (
            <DropdownMenuRadioItem
              key={option}
              value={option}
              className="data-[state=checked]:font-medium"
            >
              {LANGUAGE_NAMES[option]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
