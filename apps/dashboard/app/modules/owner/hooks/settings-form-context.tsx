import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { CurrentOwnerResponse } from '@afterdark/types'
import type { SettingsFormValues } from '@afterdark/validators'
import { useCurrentOwner } from '~/modules/common/queries/use-current-user'
import { toSessionUser } from '~/modules/common/services/owner.service'
import { useSessionStore } from '~/modules/common/stores/session.store'
import {
  SETTINGS_SAVE_STATUS,
  SETTINGS_SUCCESS_DISMISS_MS,
  type SettingsSaveStatus,
} from '~/modules/owner/constants/settings-form'
import { updateCurrentOwner } from '~/modules/owner/services/update-current-user.service'
import {
  focusSettingsField,
  getFirstInvalidFieldId,
  mapSettingsFormErrors,
  resolveSaveErrorMessage,
  validateSettingsForm,
  type SettingsFieldErrors,
} from '~/modules/owner/utils/settings-form.utils'
import {
  createSettingsFormValues,
  saveStoredSettings,
  settingsValuesEqual,
} from '~/modules/owner/utils/settings-storage.utils'

type SettingsFormContextValue = {
  user: CurrentOwnerResponse
  values: SettingsFormValues
  savedValues: SettingsFormValues
  errors: SettingsFieldErrors
  isDirty: boolean
  saveStatus: SettingsSaveStatus
  saveMessage: string | null
  setProfileField: (
    field: 'name' | 'lastName' | 'phone' | 'birthday' | 'nationalId' | 'taxId',
    value: string
  ) => void
  setOrganizationField: (field: 'brandName' | 'location', value: string) => void
  setTwoFactorEnabled: (enabled: boolean) => void
  setLanguage: (language: SettingsFormValues['preferences']['language']) => void
  setNotification: (
    field: keyof SettingsFormValues['preferences']['notifications'],
    enabled: boolean
  ) => void
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
  const { refetch: refetchOwner } = useCurrentOwner()
  const [values, setValues] = useState<SettingsFormValues | null>(() =>
    createSettingsFormValues(owner)
  )
  const [savedValues, setSavedValues] = useState<SettingsFormValues | null>(() =>
    createSettingsFormValues(owner)
  )
  const [errors, setErrors] = useState<SettingsFieldErrors>({})
  const [saveStatus, setSaveStatus] = useState<SettingsSaveStatus>(SETTINGS_SAVE_STATUS.IDLE)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const isSavingRef = useRef(false)

  useEffect(() => {
    const initialValues = createSettingsFormValues(owner)
    setValues(initialValues)
    setSavedValues(initialValues)
    setErrors({})
    setSaveStatus(SETTINGS_SAVE_STATUS.IDLE)
    setSaveMessage(null)
  }, [owner])

  useEffect(() => {
    if (!values || !savedValues || settingsValuesEqual(values, savedValues)) {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [values, savedValues])

  useEffect(() => {
    if (saveStatus !== SETTINGS_SAVE_STATUS.SUCCESS || !saveMessage) {
      return
    }

    const timer = window.setTimeout(() => {
      setSaveStatus(SETTINGS_SAVE_STATUS.IDLE)
      setSaveMessage(null)
    }, SETTINGS_SUCCESS_DISMISS_MS)

    return () => window.clearTimeout(timer)
  }, [saveMessage, saveStatus])

  const isDirty = useMemo(() => {
    if (!values || !savedValues) {
      return false
    }

    return !settingsValuesEqual(values, savedValues)
  }, [values, savedValues])

  const updateValues = useCallback(
    (updater: (current: SettingsFormValues) => SettingsFormValues) => {
      setValues((current) => {
        if (!current) {
          return current
        }

        return updater(current)
      })
      setErrors({})
      setSaveStatus(SETTINGS_SAVE_STATUS.IDLE)
      setSaveMessage(null)
    },
    []
  )

  const setProfileField = useCallback(
    (field: 'name' | 'lastName' | 'phone' | 'birthday' | 'nationalId' | 'taxId', value: string) => {
      updateValues((current) => ({
        ...current,
        profile: { ...current.profile, [field]: value },
      }))
    },
    [updateValues]
  )

  const setOrganizationField = useCallback(
    (field: 'brandName' | 'location', value: string) => {
      updateValues((current) => ({
        ...current,
        organization: { ...current.organization, [field]: value },
      }))
    },
    [updateValues]
  )

  const setTwoFactorEnabled = useCallback(
    (enabled: boolean) => {
      updateValues((current) => ({
        ...current,
        security: { twoFactorEnabled: enabled },
      }))
    },
    [updateValues]
  )

  const setLanguage = useCallback(
    (language: SettingsFormValues['preferences']['language']) => {
      updateValues((current) => ({
        ...current,
        preferences: { ...current.preferences, language },
      }))
    },
    [updateValues]
  )

  const setNotification = useCallback(
    (field: keyof SettingsFormValues['preferences']['notifications'], enabled: boolean) => {
      updateValues((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          notifications: { ...current.preferences.notifications, [field]: enabled },
        },
      }))
    },
    [updateValues]
  )

  const discard = useCallback(() => {
    if (!savedValues) {
      return
    }

    setValues(savedValues)
    setErrors({})
    setSaveStatus(SETTINGS_SAVE_STATUS.IDLE)
    setSaveMessage(null)
  }, [savedValues])

  const save = useCallback(async () => {
    if (!values || !savedValues || isSavingRef.current) {
      return
    }

    const validation = validateSettingsForm(values)
    if (!validation.success) {
      const fieldErrors = mapSettingsFormErrors(validation.error)
      setErrors(fieldErrors)
      setSaveStatus(SETTINGS_SAVE_STATUS.ERROR)
      setSaveMessage(t('messages.validationSummary'))

      const firstInvalidFieldId = getFirstInvalidFieldId(fieldErrors)
      if (firstInvalidFieldId) {
        focusSettingsField(firstInvalidFieldId)
      }
      return
    }

    isSavingRef.current = true
    setSaveStatus(SETTINGS_SAVE_STATUS.SAVING)
    setSaveMessage(t('messages.saving'))
    setErrors({})

    try {
      const updatedOwner = await updateCurrentOwner(validation.data.profile)

      const storedPayload = {
        organization: validation.data.organization,
        security: validation.data.security,
        preferences: validation.data.preferences,
      }

      saveStoredSettings(storedPayload)

      const nextValues = createSettingsFormValues(updatedOwner)
      setValues(nextValues)
      setSavedValues(nextValues)
      setSaveStatus(SETTINGS_SAVE_STATUS.SUCCESS)
      setSaveMessage(t('messages.saveSuccess'))

      useSessionStore.setState({ user: toSessionUser(updatedOwner) })
      void refetchOwner()
    } catch (error) {
      setSaveStatus(SETTINGS_SAVE_STATUS.ERROR)
      setSaveMessage(resolveSaveErrorMessage(error, t('messages.saveFallback')))
    } finally {
      isSavingRef.current = false
    }
  }, [t, refetchOwner, savedValues, values])

  if (!values || !savedValues) {
    return null
  }

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
        setOrganizationField,
        setTwoFactorEnabled,
        setLanguage,
        setNotification,
        save,
        discard,
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
