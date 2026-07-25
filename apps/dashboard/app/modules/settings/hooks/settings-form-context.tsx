import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { ZodType } from 'zod'
import type { BaseProfileResponse } from '@repo/types'
import { useAutoDismiss, useUnsavedChangesGuard } from '@repo/ui'
import { toSessionUser } from '~/modules/common/formatters/session-user.formatter'
import { useSessionStore } from '~/modules/common/stores/session.store'
import { useSettings } from '~/modules/settings/queries/use-settings'
import { updateSettings } from '~/modules/settings/services/settings.service'
import {
  SETTINGS_SAVE_STATUS,
  SETTINGS_SUCCESS_DISMISS_MS,
  type SettingsSaveStatus,
} from '~/modules/settings/constants/settings-form'
import { useSettingsFormValues } from '~/modules/settings/hooks/use-settings-form-values'
import {
  focusSettingsField,
  getFirstInvalidFieldId,
  mapSettingsFormErrors,
  resolveSaveErrorMessage,
  resolveSaveSuccessMessageKey,
  validateSettingsForm,
  type SettingsFieldErrors,
} from '~/modules/settings/utils/settings-form.utils'

type ProfileFieldValue = string | Record<string, string>
type ProfileValues<TProfile extends Record<string, ProfileFieldValue>> = { profile: TProfile }

export type SettingsFormProviderConfig<
  TUser extends BaseProfileResponse,
  TProfile extends Record<string, ProfileFieldValue>,
> = {
  formSchema: ZodType<ProfileValues<TProfile>>
  toFormValues: (user: TUser) => ProfileValues<TProfile>
  fieldOrder: readonly (keyof TProfile & string)[]
}

export function createSettingsFormProvider<
  TUser extends BaseProfileResponse,
  TProfile extends Record<string, ProfileFieldValue>,
>(config: SettingsFormProviderConfig<TUser, TProfile>) {
  type TValues = ProfileValues<TProfile>
  type TField = keyof TProfile & string

  type SettingsFormContextValue = {
    user: TUser
    values: TValues
    errors: SettingsFieldErrors<TField>
    isDirty: boolean
    saveStatus: SettingsSaveStatus
    saveMessage: string | null
    setProfileField: (field: TField, value: string) => void
    setNestedProfileField: (section: TField, field: string, value: string) => void
    save: () => Promise<void>
    discard: () => void
  }

  const SettingsFormContext = createContext<SettingsFormContextValue | null>(null)

  function Provider({ user, children }: { user: TUser; children: ReactNode }) {
    const { t } = useTranslation('settings')
    const { refetch: refetchSettings } = useSettings()
    const { values, isDirty, updateValues, discard, commit } = useSettingsFormValues(
      user,
      config.toFormValues
    )
    const [errors, setErrors] = useState<SettingsFieldErrors<TField>>({})
    const [saveStatus, setSaveStatus] = useState<SettingsSaveStatus>(SETTINGS_SAVE_STATUS.IDLE)
    const [saveMessage, setSaveMessage] = useState<string | null>(null)
    const isSavingRef = useRef(false)

    useUnsavedChangesGuard(isDirty, t('shared.actions.confirmLeave'))
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
      (field: TField, value: string) => {
        updateValues((current) => ({
          ...current,
          profile: { ...current.profile, [field]: value },
        }))
        clearFeedback()
      },
      [updateValues, clearFeedback]
    )

    const setNestedProfileField = useCallback(
      (section: TField, field: string, value: string) => {
        updateValues((current) => ({
          ...current,
          profile: {
            ...current.profile,
            [section]: { ...(current.profile[section] as Record<string, string>), [field]: value },
          },
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

      const validation = validateSettingsForm(config.formSchema, values)
      if (!validation.success) {
        const fieldErrors = mapSettingsFormErrors<TField>(validation.error)
        setErrors(fieldErrors)
        setSaveStatus(SETTINGS_SAVE_STATUS.ERROR)
        setSaveMessage(t('shared.messages.validationSummary'))

        const firstInvalidFieldId = getFirstInvalidFieldId(fieldErrors, config.fieldOrder)
        if (firstInvalidFieldId) {
          focusSettingsField(firstInvalidFieldId)
        }
        return
      }

      isSavingRef.current = true
      setSaveStatus(SETTINGS_SAVE_STATUS.SAVING)
      setSaveMessage(t('shared.messages.saving'))
      setErrors({})

      try {
        const updatedUser = (await updateSettings(validation.data.profile)) as unknown as TUser

        commit(config.toFormValues(updatedUser))
        setSaveStatus(SETTINGS_SAVE_STATUS.SUCCESS)
        setSaveMessage(t(resolveSaveSuccessMessageKey()))

        useSessionStore.setState({ user: toSessionUser(updatedUser) })
        void refetchSettings()
      } catch (error) {
        setSaveStatus(SETTINGS_SAVE_STATUS.ERROR)
        setSaveMessage(resolveSaveErrorMessage(error, t('shared.messages.saveFallback')))
      } finally {
        isSavingRef.current = false
      }
    }, [t, refetchSettings, commit, values])

    return (
      <SettingsFormContext
        value={{
          user,
          values,
          errors,
          isDirty,
          saveStatus,
          saveMessage,
          setProfileField,
          setNestedProfileField,
          save,
          discard: handleDiscard,
        }}
      >
        {children}
      </SettingsFormContext>
    )
  }

  function useSettingsForm() {
    const context = useContext(SettingsFormContext)

    if (!context) {
      throw new Error('useSettingsForm must be used within its SettingsFormProvider')
    }

    return context
  }

  return { Provider, useSettingsForm }
}
