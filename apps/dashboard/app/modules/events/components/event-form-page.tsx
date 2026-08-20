import { useTranslation } from 'react-i18next'
import type { EventResponse } from '@repo/types'
import { Button } from '@repo/ui'
import { FormPageActions } from '~/modules/common/components/form-page-actions'
import { EventUnsavedChangesDialog } from '~/modules/events/components/event-unsaved-changes-dialog'
import { EventFormPageLayout } from '~/modules/events/components/event-form-page-layout'
import { EventFormErrorAlert } from '~/modules/events/components/event-form-error-alert'
import { EventLocationField } from '~/modules/events/components/event-location-field'
import { EventDetailsForm } from '~/modules/events/components/event-details-form'
import { EventFaqForm } from '~/modules/events/components/event-faq-form'
import { useEventForm } from '~/modules/events/hooks/use-event-form'
import { useUnsavedChangesGuard } from '~/modules/events/hooks/use-unsaved-changes-guard'
import { useKeyboardSubmit } from '~/modules/events/hooks/use-keyboard-submit'
import type { EventFormMode } from '~/modules/events/utils/event-form.types'

type EventFormPageProps = {
  mode: EventFormMode
  title: string
  description: string
  event?: EventResponse
}

export function EventFormPage({ mode, title, description, event }: EventFormPageProps) {
  const { t } = useTranslation('events')
  const { t: tCommon } = useTranslation('common')

  const {
    isCreate,
    locations,
    isLocationsLoading,
    isLocationsError,
    locationId,
    lastUsedLocationId,
    detailsValues,
    defaultFaqs,
    detailsFormRef,
    faqFormRef,
    anyDirty,
    canSubmit,
    isSubmitting,
    submitError,
    goToList,
    handleLocationIdChange,
    handleDetailsDirty,
    handleFaqDirty,
    handleSubmit,
  } = useEventForm({ mode, event })

  const { unsavedOpen, setUnsavedOpen, requestLeave, confirmLeave } = useUnsavedChangesGuard({
    isDirty: anyDirty,
    defaultLeaveAction: goToList,
  })

  useKeyboardSubmit(
    () => void handleSubmit(),
    !unsavedOpen && !isSubmitting && canSubmit && anyDirty
  )

  const footer = (
    <FormPageActions
      isDirty={anyDirty}
      isSaving={isSubmitting}
      dirtyLabel={tCommon('formActions.dirty')}
      cleanLabel={tCommon('formActions.clean')}
      cancelLabel={t('form.cancel')}
      onCancel={() => requestLeave(goToList)}
      cancelDisabled={isSubmitting}
    >
      <Button
        type="button"
        variant={anyDirty ? 'default' : 'outline'}
        className="w-full sm:w-auto"
        loading={isSubmitting}
        disabled={!canSubmit || isSubmitting || !anyDirty}
        onClick={() => {
          void handleSubmit()
        }}
      >
        {isCreate ? t('form.submitCreate') : t('form.submitEdit')}
      </Button>
    </FormPageActions>
  )

  return (
    <>
      <EventFormPageLayout
        title={title}
        description={description}
        onBack={() => requestLeave(goToList)}
        footer={footer}
        footerBanner={
          submitError ? (
            <EventFormErrorAlert title={t('form.submitErrorTitle')} message={submitError} />
          ) : null
        }
      >
        <div className="flex flex-col gap-12">
          <EventLocationField
            locations={locations}
            isLoading={isLocationsLoading}
            isError={isLocationsError}
            locationId={locationId}
            lastUsedLocationId={lastUsedLocationId}
            onLocationIdChange={handleLocationIdChange}
          />
          <EventDetailsForm
            ref={detailsFormRef}
            defaultValues={detailsValues}
            onDirtyChange={handleDetailsDirty}
          />
          <EventFaqForm ref={faqFormRef} defaultFaqs={defaultFaqs} onDirtyChange={handleFaqDirty} />
        </div>
      </EventFormPageLayout>

      <EventUnsavedChangesDialog
        open={unsavedOpen}
        onOpenChange={setUnsavedOpen}
        onConfirmLeave={confirmLeave}
      />
    </>
  )
}
