import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOCALES_DIR = join(__dirname, '..', 'locales')
const REFERENCE_LANGUAGE = 'es'

type NestedRecord = { [key: string]: string | NestedRecord }

let exitCode = 0

function err(msg: string) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`)
  exitCode = 1
}

function ok(msg: string) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`)
}

function warn(msg: string) {
  console.warn(`\x1b[33m⚠\x1b[0m ${msg}`)
}

function flattenKeys(obj: NestedRecord, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    return typeof value === 'object' ? flattenKeys(value, fullKey) : [fullKey]
  })
}

function extractPlaceholders(value: string): string[] {
  const matches = value.match(/\{\{(\w+)\}\}/g) ?? []
  const icuMatches = value.match(/\{(\w+),/g) ?? []
  return [...matches.map((m) => m.slice(2, -2)), ...icuMatches.map((m) => m.slice(1, -1))]
}

function loadJson(path: string): NestedRecord | null {
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as NestedRecord
  } catch {
    return null
  }
}

function getNestedValue(obj: NestedRecord, key: string): string | undefined {
  const parts = key.split('.')
  let current: NestedRecord | string = obj
  for (const part of parts) {
    if (typeof current !== 'object') return undefined
    current = current[part] ?? ''
  }
  return typeof current === 'string' ? current : undefined
}

function checkNamespace(namespace: string, languages: string[]) {
  const refPath = join(LOCALES_DIR, namespace, `${REFERENCE_LANGUAGE}.json`)
  const ref = loadJson(refPath)

  if (!ref) {
    err(`${namespace}/${REFERENCE_LANGUAGE}.json not found or invalid JSON`)
    return
  }

  const refKeys = flattenKeys(ref)
  ok(`${namespace} (${REFERENCE_LANGUAGE}): ${refKeys.length} keys`)

  for (const lang of languages) {
    if (lang === REFERENCE_LANGUAGE) continue

    const path = join(LOCALES_DIR, namespace, `${lang}.json`)
    const data = loadJson(path)

    if (!data) {
      err(`${namespace}/${lang}.json not found or invalid JSON`)
      continue
    }

    const langKeys = flattenKeys(data)

    const missingKeys = refKeys.filter((k) => !langKeys.includes(k))
    const extraKeys = langKeys.filter((k) => !refKeys.includes(k))

    if (missingKeys.length > 0) {
      err(`${namespace}/${lang}: missing keys: ${missingKeys.join(', ')}`)
    }

    if (extraKeys.length > 0) {
      warn(
        `${namespace}/${lang}: extra keys (not in ${REFERENCE_LANGUAGE}): ${extraKeys.join(', ')}`
      )
    }

    for (const key of refKeys) {
      const refValue = getNestedValue(ref, key)
      const langValue = getNestedValue(data, key)

      if (!refValue || !langValue) continue

      const refPlaceholders = extractPlaceholders(refValue).sort()
      const langPlaceholders = extractPlaceholders(langValue).sort()

      if (JSON.stringify(refPlaceholders) !== JSON.stringify(langPlaceholders)) {
        err(
          `${namespace}/${lang}:${key} — placeholder mismatch. ` +
            `${REFERENCE_LANGUAGE}: [${refPlaceholders.join(', ')}] ` +
            `${lang}: [${langPlaceholders.join(', ')}]`
        )
      }
    }

    if (missingKeys.length === 0 && extraKeys.length === 0) {
      ok(`${namespace}/${lang}: all ${langKeys.length} keys present`)
    }
  }
}

function run() {
  console.log('\n🌐 Checking i18n translations...\n')

  let namespaces: string[]
  try {
    namespaces = readdirSync(LOCALES_DIR)
  } catch {
    err(`Could not read locales directory: ${LOCALES_DIR}`)
    process.exit(1)
  }

  const allLanguages = new Set<string>()

  for (const ns of namespaces) {
    const nsDir = join(LOCALES_DIR, ns)
    let files: string[]
    try {
      files = readdirSync(nsDir).filter((f) => f.endsWith('.json'))
    } catch {
      err(`Could not read namespace directory: ${nsDir}`)
      continue
    }

    for (const file of files) {
      allLanguages.add(file.replace('.json', ''))
    }
  }

  const languages = Array.from(allLanguages)

  for (const ns of namespaces) {
    checkNamespace(ns, languages)
  }

  if (exitCode === 0) {
    console.log('\n✅ All i18n checks passed!\n')
  } else {
    console.log('\n❌ i18n checks failed. Fix the errors above.\n')
    process.exit(exitCode)
  }
}

run()
