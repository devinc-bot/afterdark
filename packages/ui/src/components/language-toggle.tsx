import { Languages } from 'lucide-react'
import { useLanguage } from '@repo/i18n/client'
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, type Language } from '@repo/i18n/config'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type LanguageToggleProps = {
  className?: string
  /** Visible/ARIA language control label prefix (e.g. translated "Language") */
  languageLabel: string
}

export function LanguageToggle({ className, languageLabel }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage()
  const languageName = LANGUAGE_NAMES[language]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('shrink-0', className)}
          aria-label={`${languageLabel}: ${languageName}`}
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
