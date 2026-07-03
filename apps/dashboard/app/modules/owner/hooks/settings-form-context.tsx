import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { CurrentOwnerResponse } from '@afterdark/types'
import type { SettingsFormValues } from '@afterdark/validators'
import { useAutoDismiss } from '~/modules/common/hooks/use-auto-dismiss'
import { useUnsavedChangesGuard } from '~/modules/common/hooks/use-unsaved-changes-guard'
import { toSessionUser } from '~/modules/common/formatters/session-user.formatter'
import { useSessionStore } from '~/modules/common/stores/session.store'
import { useSettings } from '~/modules/settings/queries/use-settings'
import { updateSettings } from '~/modules/settings/services/settings.service'
import {
  SETTINGS_SAVE_STATUS,
  SETTINGS_SUCCESS_DISMISS_MS,
  type SettingsSaveStatus,
} from '~/modules/owner/constants/settings-form'
import { useSettingsFormValues } from '~/modules/owner/hooks/use-settings-form-values'
import {
  focusSettingsField,
  getFirstInvalidFieldId,
  mapSettingsFormErrors,
  resolveSaveErrorMessage,
  validateSettingsForm,
  type SettingsFieldErrors,
} from '~/modules/owner/utils/settings-form.utils'
import { createSettingsFormValues } from '~/modules/owner/utils/settings-storage.utils'

type ProfileField = 'name' | 'lastName' | 'phone' | 'birthday' | 'nationalId' | 'taxId'

type SettingsFormContextValue = {
  user: CurrentOwnerResponse
  values: SettingsFormValues
  savedValues: SettingsFormValues
  errors: SettingsFieldErrors
  isDirty: boolean
  saveStatus: SettingsSaveStatus
  saveMessage: string | null
  setProfileField: (field: ProfileField, value: string) => void
  save: () => Promise<void>
  discard: () => void
}

const SettingsFormContext = createContext<SettingsFormContextValue | null>(null)

export function SettingsFormProvider({
  owner,
  children,
}: {
  owner: CurrentOwnerResponse
  children: ReactNode
}) {
  const { t } = useTranslation('settings')
  const { refetch: refetchSettings } = useSettings()
  const { values, savedValues, isDirty, updateValues, discard, commit } =
    useSettingsFormValues(owner)
  const [errors, setErrors] = useState<SettingsFieldErrors>({})
  const [saveStatus, setSaveStatus] = useState<SettingsSaveStatus>(SETTINGS_SAVE_STATUS.IDLE)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const isSavingRef = useRef(false)

  useUnsavedChangesGuard(isDirty, t('owner.actions.confirmLeave'))
  useAutoDismiss(
    saveStatus === SETTINGS_SAVE_STATUS.SUCCESS && !!saveMessage,
    SETTINGS_SUCCESS_DISMISS_MS,
    () => {
      setSaveStatus(SETTINGS_SAVE_STATUS.IDLE)
      setSaveMessage(null)
    }
  )

  const clearFeedback = useCallback(() => {
    setErrors({})
    setSaveStatus(SETTINGS_SAVE_STATUS.IDLE)
    setSaveMessage(null)
  }, [])

  const setProfileField = useCallback(
    (field: ProfileField, value: string) => {
      updateValues((current) => ({
        ...current,
        profile: { ...current.profile, [field]: value },
      }))
      clearFeedback()
    },
    [updateValues, clearFeedback]
  )

  const handleDiscard = useCallback(() => {
    discard()
    clearFeedback()
  }, [discard, clearFeedback])

  const save = useCallback(async () => {
    if (isSavingRef.current) {
      return
    }

    const validation = validateSettingsForm(values)
    if (!validation.success) {
      const fieldErrors = mapSettingsFormErrors(validation.error)
      setErrors(fieldErrors)
      setSaveStatus(SETTINGS_SAVE_STATUS.ERROR)
      setSaveMessage(t('owner.messages.validationSummary'))

      const firstInvalidFieldId = getFirstInvalidFieldId(fieldErrors)
      if (firstInvalidFieldId) {
        focusSettingsField(firstInvalidFieldId)
      }
      return
    }

    isSavingRef.current = true
    setSaveStatus(SETTINGS_SAVE_STATUS.SAVING)
    setSaveMessage(t('owner.messages.saving'))
    setErrors({})

    try {
      const updatedOwner = await updateSettings(validation.data.profile)

      commit(createSettingsFormValues(updatedOwner as CurrentOwnerResponse))
      setSaveStatus(SETTINGS_SAVE_STATUS.SUCCESS)
      setSaveMessage(t('owner.messages.saveSuccess'))

      useSessionStore.setState({
        user: toSessionUser(
          updatedOwner as Pick<
            CurrentOwnerResponse,
            'sub' | 'name' | 'lastName' | 'email' | 'avatar'
          >
        ),
      })
      void refetchSettings()
    } catch (error) {
      setSaveStatus(SETTINGS_SAVE_STATUS.ERROR)
      setSaveMessage(resolveSaveErrorMessage(error, t('owner.messages.saveFallback')))
    } finally {
      isSavingRef.current = false
    }
  }, [t, refetchSettings, commit, values])

  return (
    <SettingsFormContext
      value={{
        user: owner,
        values,
        savedValues,
        errors,
        isDirty,
        saveStatus,
        saveMessage,
        setProfileField,
        save,
        discard: handleDiscard,
      }}
    >
      {children}
    </SettingsFormContext>
  )
}

export function useSettingsForm() {
  const context = useContext(SettingsFormContext)

  if (!context) {
    throw new Error('useSettingsForm must be used within SettingsFormProvider')
  }

  return context
}
