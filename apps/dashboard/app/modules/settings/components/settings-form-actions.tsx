import { useTranslation } from 'react-i18next'
import { Button } from '@repo/ui'
import { FormPageActions } from '~/modules/common/components/form-page-actions'
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
    <FormPageActions
      isDirty={isDirty}
      isSaving={isSaving}
      dirtyLabel={t('shared.actions.dirty')}
      cleanLabel={t('shared.actions.clean')}
      cancelLabel={t('shared.actions.discard')}
      onCancel={onDiscard}
      withBorder
    >
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
    </FormPageActions>
  )
}
