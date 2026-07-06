import { useCallback, useEffect, useMemo, useState } from 'react'

type UpdateValuesCallback<TValues> = (current: TValues) => TValues

type ToFormValuesProp<TUser, TValues> = (user: TUser) => TValues

type AreEqualProp<TValues> = (a: TValues, b: TValues) => boolean

export function useSettingsFormValues<TUser, TValues>(
  user: TUser,
  toFormValues: ToFormValuesProp<TUser, TValues>,
  areEqual: AreEqualProp<TValues> = (a, b) => JSON.stringify(a) === JSON.stringify(b)
) {
  const [values, setValues] = useState<TValues>(() => toFormValues(user))
  const [savedValues, setSavedValues] = useState<TValues>(() => toFormValues(user))

  useEffect(() => {
    const initialValues = toFormValues(user)
    setValues(initialValues)
    setSavedValues(initialValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  /** True when `values` diverge from `savedValues` per `areEqual`. */
  const isDirty = useMemo(() => !areEqual(values, savedValues), [values, savedValues, areEqual])

  /** Apply an updater fn to current form values. */
  const updateValues = useCallback((updater: UpdateValuesCallback<TValues>) => {
    setValues((current) => updater(current))
  }, [])

  /** Revert `values` to last saved snapshot. */
  const discard = useCallback(() => {
    setValues(savedValues)
  }, [savedValues])

  /** Set `values` and mark them as the new saved snapshot. */
  const commit = useCallback((nextValues: TValues) => {
    setValues(nextValues)
    setSavedValues(nextValues)
  }, [])

  return { values, savedValues, isDirty, updateValues, discard, commit }
}
