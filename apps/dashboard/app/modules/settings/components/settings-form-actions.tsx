import { useTranslation } from 'react-i18next'
import { Button, cn } from '@afterdark/ui'
import { SETTINGS_FORM_ID } from '~/modules/settings/constants/settings-form'

export function SettingsFormActions({
  isDirty,
  isSaving,
  onDiscard,
}: {
  isDirty: boolean
  isSaving: boolean
  onDiscard: () => void
}) {
  const { t } = useTranslation('settings')

  return (
    <div className="flex flex-col-reverse gap-3 border-t border-hairline/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p
        className={cn(
          'flex items-center gap-2 text-sm transition-colors duration-(--duration-fast)',
          isDirty ? 'text-ink' : 'text-ink-muted'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'size-1.5 shrink-0 rounded-full transition-[background-color,opacity,transform] duration-(--duration-fast) ease-emphasized',
            isDirty
              ? 'scale-100 bg-primary opacity-100 motion-safe:animate-pulse'
              : 'scale-75 bg-ink-muted/40 opacity-60'
          )}
        />
        {isDirty ? t('shared.actions.dirty') : t('shared.actions.clean')}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          disabled={!isDirty || isSaving}
          onClick={onDiscard}
        >
          {t('shared.actions.discard')}
        </Button>
        <Button
          type="submit"
          form={SETTINGS_FORM_ID}
          variant={isDirty ? 'default' : 'outline'}
          className="w-full sm:w-auto"
          loading={isSaving}
          disabled={!isDirty || isSaving}
        >
          {t('shared.actions.save')}
        </Button>
      </div>
    </div>
  )
}
