export type SetCookieOptions = {
  name: string
  value: string
  maxAgeMs: number
}

export type CookieNameOptions = {
  name: string
}

function isBrowser(): boolean {
  return typeof document !== 'undefined'
}

function getCookieStore(): CookieStore | undefined {
  return globalThis.cookieStore
}

function buildCookieInit({ name, value, maxAgeMs }: SetCookieOptions) {
  return {
    name,
    value,
    path: '/',
    expires: Date.now() + maxAgeMs,
    sameSite: 'lax' as const,
    ...(import.meta.env.PROD ? { secure: true } : {}),
  }
}

function setCookieLegacy(options: SetCookieOptions): void {
  const { name, value, maxAgeMs } = options
  const maxAgeSeconds = Math.floor(maxAgeMs / 1000)
  const secure = import.meta.env.PROD ? '; Secure' : ''

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`
}

function getCookieLegacy({ name }: CookieNameOptions): string | null {
  const prefix = `${name}=`

  for (const entry of document.cookie.split('; ')) {
    if (!entry.startsWith(prefix)) continue
    return decodeURIComponent(entry.slice(prefix.length))
  }

  return null
}

function deleteCookieLegacy({ name }: CookieNameOptions): void {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export function setCookie(options: SetCookieOptions): void {
  if (!isBrowser()) return

  const store = getCookieStore()

  if (store) {
    void store.set(buildCookieInit(options)).catch(() => {
      setCookieLegacy(options)
    })
    return
  }

  setCookieLegacy(options)
}

export async function getCookie(options: CookieNameOptions): Promise<string | null> {
  if (!isBrowser()) return null

  const store = getCookieStore()

  if (store) {
    try {
      const cookie = await store.get(options.name)
      if (cookie?.value) return cookie.value
    } catch {
      return getCookieLegacy(options)
    }
  }

  return getCookieLegacy(options)
}

export function getCookieSync(options: CookieNameOptions): string | null {
  if (!isBrowser()) return null
  return getCookieLegacy(options)
}

export function deleteCookie(options: CookieNameOptions): void {
  if (!isBrowser()) return

  const store = getCookieStore()

  if (store) {
    void store.delete(options.name).catch(() => {
      deleteCookieLegacy(options)
    })
    return
  }

  deleteCookieLegacy(options)
}
