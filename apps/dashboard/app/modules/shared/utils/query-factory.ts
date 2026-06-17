import type { ApiError } from '@afterdark/types'
import { API_ROUTES } from '~/config/constants/api'
import { getAccessTokenSync } from '~/modules/auth/utils/auth-storage.utils'
import { refreshAccessToken } from '~/modules/auth/utils/refresh-access-token.utils'

type RequestConfig = RequestInit & { _retry?: boolean }

export class QueryFactoryError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiError | null
  ) {
    super(body?.message ?? `Request failed with status ${status}`)
    this.name = 'QueryFactoryError'
  }
}

export class QueryFactory {
  baseUrl: URL
  private defaultInit: RequestInit

  constructor(baseUrl: string, defaultRequestInit?: RequestInit) {
    this.baseUrl = new URL(baseUrl)
    this.defaultInit = {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...defaultRequestInit,
      ...(defaultRequestInit?.headers
        ? {
            headers: {
              'Content-Type': 'application/json',
              ...toHeaderRecord(defaultRequestInit.headers),
            },
          }
        : {}),
    }
  }

  addParams(params: Record<string, string> | URLSearchParams) {
    const url = new URL(this.baseUrl)
    const urlParams = new URLSearchParams(url.searchParams)

    if (params instanceof URLSearchParams) {
      params.forEach((value, key) => urlParams.append(key, value))
    } else {
      Object.entries(params).forEach(([key, value]) => urlParams.append(key, value))
    }

    url.search = urlParams.toString()
    this.baseUrl = url

    return this
  }

  get<T>(path: string, requestInit?: RequestInit) {
    return this.request<T>(path, { ...requestInit, method: 'GET' })
  }

  post<T>(path: string, data: unknown, requestInit?: RequestInit) {
    return this.request<T>(path, {
      ...requestInit,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put<T>(path: string, data: unknown, requestInit?: RequestInit) {
    return this.request<T>(path, {
      ...requestInit,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  delete<T>(path: string, requestInit?: RequestInit) {
    return this.request<T>(path, { ...requestInit, method: 'DELETE' })
  }

  patch<T>(path: string, data: unknown, requestInit?: RequestInit) {
    return this.request<T>(path, {
      ...requestInit,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  private resolveUrl(path: string): string {
    return new URL(path, this.baseUrl).href
  }

  private mergeInit(requestInit?: RequestInit): RequestConfig {
    return {
      ...this.defaultInit,
      ...requestInit,
      headers: mergeHeaders(this.defaultInit.headers, requestInit?.headers),
    }
  }

  private async buildHeaders(init: RequestConfig): Promise<Headers> {
    const headers = new Headers(init.headers)
    const token = getAccessTokenSync()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  }

  private shouldSkipAuthRetry(pathname: string): boolean {
    const authPrefix = API_ROUTES.auth.prefix

    return (
      pathname.includes(`${authPrefix}${API_ROUTES.auth.path.login()}`) ||
      pathname.includes(`${authPrefix}${API_ROUTES.auth.path.refreshToken()}`) ||
      pathname.includes(`${authPrefix}${API_ROUTES.auth.path.register()}`)
    )
  }

  private async parseBody<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }

  private async parseErrorBody(response: Response): Promise<ApiError | null> {
    try {
      return (await response.json()) as ApiError
    } catch {
      return null
    }
  }

  private async execute<T>(url: string, init: RequestConfig): Promise<T> {
    const headers = await this.buildHeaders(init)
    const response = await fetch(url, { ...init, headers })

    if (response.status === 401 && !init._retry) {
      const pathname = new URL(url).pathname

      if (!this.shouldSkipAuthRetry(pathname)) {
        const retryInit: RequestConfig = { ...init, _retry: true }

        try {
          await refreshAccessToken()
          return this.execute<T>(url, retryInit)
        } catch {
          const body = await this.parseErrorBody(response)
          throw new QueryFactoryError(response.status, body)
        }
      }
    }

    if (!response.ok) {
      const body = await this.parseErrorBody(response)
      throw new QueryFactoryError(response.status, body)
    }

    return this.parseBody<T>(response)
  }

  private request<T>(path: string, requestInit?: RequestInit): Promise<T> {
    const url = this.resolveUrl(path)
    const init = this.mergeInit(requestInit)

    return this.execute<T>(url, init)
  }
}

function toHeaderRecord(headers: HeadersInit): Record<string, string> {
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries())
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers)
  }

  return headers
}

function mergeHeaders(base?: HeadersInit, next?: HeadersInit): Headers {
  const headers = new Headers(base)

  if (next) {
    new Headers(next).forEach((value, key) => headers.set(key, value))
  }

  return headers
}
