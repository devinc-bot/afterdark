import { useTranslation } from 'react-i18next'
import {
  Checkbox,
  Field,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@afterdark/ui'
import type { SettingsFormValues } from '@afterdark/validators'
import { LANGUAGE_OPTIONS, NOTIFICATION_OPTIONS } from '~/modules/owner/constants/settings.mock'
import { NOTIFICATION_FIELD_BY_ID } from '~/modules/owner/constants/settings-form'
import { SettingsSection } from '~/modules/owner/components/settings-section'
import { useSettingsForm } from '~/modules/owner/hooks/settings-form-context'

export function PreferencesSettingsSection() {
  const { t } = useTranslation('settings')
  const { values, errors, setLanguage, setNotification } = useSettingsForm()
  const languageError = errors.preferences?.language ?? null

  return (
    <SettingsSection title={t('sections.preferences')}>
      <div className="flex flex-col gap-6">
        <Select
          value={values.preferences.language}
          onValueChange={(value) =>
            setLanguage(value as SettingsFormValues['preferences']['language'])
          }
        >
          <Field
            label={t('preferences.language')}
            htmlFor="settings-language"
            error={languageError}
          >
            <SelectTrigger
              id="settings-language"
              error={Boolean(languageError)}
              aria-invalid={languageError ? true : undefined}
            >
              <SelectValue placeholder={t('preferences.languagePlaceholder')} />
            </SelectTrigger>
          </Field>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-3 font-label text-xs font-semibold uppercase tracking-label-xs text-ink-muted">
            {t('preferences.notifications')}
          </legend>
          <ul className="divide-y divide-hairline/60">
            {NOTIFICATION_OPTIONS.map((option) => {
              const field = NOTIFICATION_FIELD_BY_ID[option.id]
              const checked = values.preferences.notifications[field]
              const fieldError = errors.preferences?.notifications?.[field]
              const inputId = `settings-notification-${option.id}`
              const errorId = fieldError ? `${inputId}-error` : undefined

              return (
                <li key={option.id}>
                  <label
                    htmlFor={inputId}
                    className="flex min-h-11 cursor-pointer items-start gap-3 py-3"
                  >
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={(value) => setNotification(field, value === true)}
                      aria-invalid={fieldError ? true : undefined}
                      aria-describedby={errorId}
                      className="mt-0.5"
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-normal text-ink">{option.label}</span>
                      <p className="text-sm text-ink-muted">{option.description}</p>
                      {fieldError ? (
                        <p id={errorId} className="text-sm text-error" role="alert">
                          {fieldError}
                        </p>
                      ) : null}
                    </div>
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>

        <p className="text-sm text-ink-muted">{t('preferences.localHint')}</p>
      </div>
    </SettingsSection>
  )
}
