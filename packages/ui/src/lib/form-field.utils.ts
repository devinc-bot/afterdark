export function fieldErrorMessage(errors: ReadonlyArray<unknown>): string | null {
  const [first] = errors
  if (!first) return null
  if (typeof first === 'string') return first
  if (typeof first === 'object' && 'message' in first) {
    return String((first as { message: unknown }).message)
  }
  return null
}

export function requiredFieldLabel(label: string): string {
  return `${label} *`
}

export function optionalFieldLabel(label: string, optionalText: string): string {
  return `${label} (${optionalText})`
}
