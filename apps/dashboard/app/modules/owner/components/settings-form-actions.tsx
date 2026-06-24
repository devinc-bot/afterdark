import { Button } from '@afterdark/ui'
import { SETTINGS_COPY } from '~/modules/owner/constants/settings.copy'
import { SETTINGS_FORM_ID, SETTINGS_SAVE_STATUS } from '~/modules/owner/constants/settings-form'
import { useSettingsForm } from '~/modules/owner/hooks/settings-form-context'

export function SettingsFormActions() {
  const { isDirty, saveStatus, discard } = useSettingsForm()
  const isSaving = saveStatus === SETTINGS_SAVE_STATUS.SAVING

  return (
    <div className="flex flex-col-reverse gap-3 border-t border-hairline/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink-muted">
        {isDirty ? SETTINGS_COPY.actions.dirty : SETTINGS_COPY.actions.clean}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          disabled={!isDirty || isSaving}
          onClick={discard}
        >
          {SETTINGS_COPY.actions.discard}
        </Button>
        <Button
          type="submit"
          form={SETTINGS_FORM_ID}
          variant={isDirty ? 'default' : 'outline'}
          className="w-full sm:w-auto"
          loading={isSaving}
          disabled={!isDirty || isSaving}
        >
          {SETTINGS_COPY.actions.save}
        </Button>
      </div>
    </div>
  )
}
