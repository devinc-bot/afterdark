import { DEFAULT_LANGUAGE, LANGUAGE, type Language } from '../config/languages.ts'
import { SERVER_RESOURCES } from '../loaders/server-loader.ts'

function resolveKey(resources: Record<string, unknown>, keyPath: string): string | undefined {
  const value = keyPath.split('.').reduce<unknown>((current, part) => {
    if (typeof current !== 'object' || current === null) return undefined
    return (current as Record<string, unknown>)[part]
  }, resources)

  return typeof value === 'string' ? value : undefined
}

export function translateSync(fullKey: string, language: Language = DEFAULT_LANGUAGE): string {
  const colonIndex = fullKey.indexOf(':')
  if (colonIndex === -1) return fullKey

  const namespace = fullKey.slice(0, colonIndex)
  const keyPath = fullKey.slice(colonIndex + 1)
  const langResources = SERVER_RESOURCES[language] ?? SERVER_RESOURCES[LANGUAGE.ES]
  const namespaceResources = langResources[namespace as keyof typeof langResources]

  if (!namespaceResources) return fullKey

  return resolveKey(namespaceResources as Record<string, unknown>, keyPath) ?? fullKey
}
