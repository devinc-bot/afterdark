import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@repo/ui'
import { FormPageActions } from '~/modules/common/components/form-page-actions'
import {
  LOCATION_FORM_ID,
  LOCATION_FORM_MODE,
  LocationForm,
  type LocationFormMode,
  type LocationFormValues,
} from '~/modules/locations/components/location-form'
import { LocationFormPageLayout } from '~/modules/locations/components/location-form-page-layout'
import { LocationUnsavedChangesDialog } from '~/modules/locations/components/location-unsaved-changes-dialog'
import {
  useCreateLocation,
  useUpdateLocation,
} from '~/modules/locations/mutation/use-locations-mutations'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

type LocationFormPageProps = {
  mode: LocationFormMode
  title: string
  description: string
  locationDocumentId?: string
  defaultValues?: Partial<LocationFormValues>
}

export function LocationFormPage({
  mode,
  title,
  description,
  locationDocumentId,
  defaultValues,
}: LocationFormPageProps) {
  const { t } = useTranslation('locations')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const createLocationMutation = useCreateLocation()
  const updateLocationMutation = useUpdateLocation()
  const isCreate = mode === LOCATION_FORM_MODE.CREATE
  const pending = isCreate ? createLocationMutation.isPending : updateLocationMutation.isPending

  const [isDirty, setIsDirty] = useState(false)
  const [unsavedOpen, setUnsavedOpen] = useState(false)
  const leaveActionRef = useRef<() => void>(() => {
    navigate({ to: DASHBOARD_ROUTES.locations() })
  })

  const goToList = useCallback(() => {
    navigate({ to: DASHBOARD_ROUTES.locations() })
  }, [navigate])

  const goToEventCreation = useCallback(() => {
    navigate({ to: DASHBOARD_ROUTES.eventsNew() })
  }, [navigate])

  const requestLeave = useCallback(
    (action: () => void) => {
      leaveActionRef.current = action
      if (isDirty) {
        setUnsavedOpen(true)
        return
      }
      action()
    },
    [isDirty]
  )

  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  return (
    <>
      <LocationFormPageLayout
        title={title}
        description={description}
        onBack={() => requestLeave(goToList)}
        footer={
          <FormPageActions
            isDirty={isDirty}
            isSaving={pending}
            dirtyLabel={tCommon('formActions.dirty')}
            cleanLabel={tCommon('formActions.clean')}
            cancelLabel={t('formPage.cancel')}
            onCancel={() => requestLeave(goToList)}
            cancelDisabled={pending}
          >
            <Button
              type="submit"
              form={LOCATION_FORM_ID}
              variant={isDirty ? 'default' : 'outline'}
              className="w-full sm:w-auto"
              loading={pending}
              disabled={!isDirty || pending}
            >
              {pending
                ? isCreate
                  ? t('formPage.submitCreatePending')
                  : t('formPage.submitEditPending')
                : isCreate
                  ? t('formPage.submitCreate')
                  : t('formPage.submitEdit')}
            </Button>
          </FormPageActions>
        }
      >
        <LocationForm
          mode={mode}
          locationDocumentId={locationDocumentId}
          defaultValues={defaultValues}
          createLocationMutation={createLocationMutation}
          updateLocationMutation={updateLocationMutation}
          onDirtyChange={setIsDirty}
          onSuccess={isCreate ? goToEventCreation : goToList}
        />
      </LocationFormPageLayout>

      <LocationUnsavedChangesDialog
        open={unsavedOpen}
        onOpenChange={setUnsavedOpen}
        onConfirmLeave={() => leaveActionRef.current()}
      />
    </>
  )
}
