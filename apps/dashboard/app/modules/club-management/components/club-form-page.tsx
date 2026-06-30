import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@afterdark/ui'
import {
  CLUB_FORM_ID,
  CLUB_FORM_MODE,
  ClubForm,
  type ClubFormMode,
  type ClubFormValues,
} from '~/modules/club-management/components/club-form'
import { ClubFormPageLayout } from '~/modules/club-management/components/club-form-page-layout'
import { ClubUnsavedChangesDialog } from '~/modules/club-management/components/club-unsaved-changes-dialog'
import {
  useCreateClub,
  useUpdateClub,
} from '~/modules/club-management/mutation/use-club-management-mutations'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

type ClubFormPageProps = {
  mode: ClubFormMode
  title: string
  description: string
  clubDocumentId?: string
  defaultValues?: Partial<ClubFormValues>
}

export function ClubFormPage({
  mode,
  title,
  description,
  clubDocumentId,
  defaultValues,
}: ClubFormPageProps) {
  const { t } = useTranslation('clubs')
  const navigate = useNavigate()
  const createClubMutation = useCreateClub()
  const updateClubMutation = useUpdateClub()
  const isCreate = mode === CLUB_FORM_MODE.CREATE
  const pending = isCreate ? createClubMutation.isPending : updateClubMutation.isPending

  const [isDirty, setIsDirty] = useState(false)
  const [unsavedOpen, setUnsavedOpen] = useState(false)
  const leaveActionRef = useRef<() => void>(() => {
    navigate({ to: DASHBOARD_ROUTES.clubManagement() })
  })

  const goToList = useCallback(() => {
    navigate({ to: DASHBOARD_ROUTES.clubManagement() })
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
      <ClubFormPageLayout
        title={title}
        description={description}
        onBack={() => requestLeave(goToList)}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="default"
              disabled={pending}
              className="min-w-36 sm:min-w-40"
              onClick={() => requestLeave(goToList)}
            >
              {t('formPage.cancel')}
            </Button>
            <Button
              type="submit"
              form={CLUB_FORM_ID}
              size="default"
              loading={pending}
              className="min-w-36 sm:min-w-40"
            >
              {pending
                ? isCreate
                  ? t('formPage.submitCreatePending')
                  : t('formPage.submitEditPending')
                : isCreate
                  ? t('formPage.submitCreate')
                  : t('formPage.submitEdit')}
            </Button>
          </>
        }
      >
        <ClubForm
          mode={mode}
          clubDocumentId={clubDocumentId}
          defaultValues={defaultValues}
          createClubMutation={createClubMutation}
          updateClubMutation={updateClubMutation}
          onDirtyChange={setIsDirty}
          onSuccess={goToList}
        />
      </ClubFormPageLayout>

      <ClubUnsavedChangesDialog
        open={unsavedOpen}
        onOpenChange={setUnsavedOpen}
        onConfirmLeave={() => leaveActionRef.current()}
      />
    </>
  )
}
