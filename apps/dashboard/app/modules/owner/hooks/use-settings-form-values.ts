import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CurrentOwnerResponse } from '@afterdark/types'
import type { SettingsFormValues } from '@afterdark/validators'
import {
  createSettingsFormValues,
  settingsValuesEqual,
} from '~/modules/owner/utils/settings-storage.utils'

type UpdateValuesCallback = (current: SettingsFormValues) => SettingsFormValues

export function useSettingsFormValues(owner: CurrentOwnerResponse) {
  const [values, setValues] = useState<SettingsFormValues>(() => createSettingsFormValues(owner))
  const [savedValues, setSavedValues] = useState<SettingsFormValues>(() =>
    createSettingsFormValues(owner)
  )

  useEffect(() => {
    const initialValues = createSettingsFormValues(owner)
    setValues(initialValues)
    setSavedValues(initialValues)
  }, [owner])

  const isDirty = useMemo(() => !settingsValuesEqual(values, savedValues), [values, savedValues])

  const updateValues = useCallback((updater: UpdateValuesCallback) => {
    setValues((current) => updater(current))
  }, [])

  const discard = useCallback(() => {
    setValues(savedValues)
  }, [savedValues])

  const commit = useCallback((nextValues: SettingsFormValues) => {
    setValues(nextValues)
    setSavedValues(nextValues)
  }, [])

  return { values, savedValues, isDirty, updateValues, discard, commit }
}
