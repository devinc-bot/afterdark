import type { ApiError, LoginResponse } from '@repo/types'
import { API_ROUTES, buildApiPath } from '../config/api-routes.ts'

const UNAUTHENTICATED_AUTH_PATHS = [
  toPathname(buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.login())),
  toPathname(buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.refreshToken())),
  toPathname(buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.logout())),
] as const

export type QueryFactoryRefreshOptions = {
  path: string
  data: unknown
  onSuccess: (response: LoginResponse) => void | Promise<void>
}

export type QueryFactoryOptions = {
  getAccessToken?: () => string | null
  defaultRequestInit?: RequestInit
  refresh?: QueryFactoryRefreshOptions
  onAuthenticationFailure?: () => void | Promise<void>
}

export type QueryFactoryResponse<T> = {
  data: T
  headers: Headers
}

export class QueryFactoryError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiError | null
  ) {
    super(body?.message ?? `Request failed with status ${status}`)
    this.name = 'QueryFactoryError'
  }
}

export class QueryFactoryAuthenticationError extends Error {
  readonly isAuthenticationFailure = true as const

  constructor(
    readonly originalError: QueryFactoryError,
    readonly refreshError: QueryFactoryError
  ) {
    super(refreshError.message)
    this.name = 'QueryFactoryAuthenticationError'
  }
}

export class QueryFactory {
  baseUrl: URL
  private defaultInit: RequestInit
  private getAccessToken?: () => string | null
  private refresh?: QueryFactoryRefreshOptions
  private onAuthenticationFailure?: () => void | Promise<void>
  private refreshPromise: Promise<void> | null = null

  constructor(baseUrl: string, options?: QueryFactoryOptions) {
    this.baseUrl = new URL(baseUrl)
    this.getAccessToken = options?.getAccessToken
    this.refresh = options?.refresh
    this.onAuthenticationFailure = options?.onAuthenticationFailure

    const defaultRequestInit = options?.defaultRequestInit
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
    if (data instanceof FormData) {
      return this.request<T>(path, {
        ...requestInit,
        method: 'POST',
        body: data,
      })
    }

    return this.request<T>(path, {
      ...requestInit,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  postWithResponse<T>(path: string, data: unknown, requestInit?: RequestInit) {
    if (data instanceof FormData) {
      return this.requestWithResponse<T>(path, {
        ...requestInit,
        method: 'POST',
        body: data,
      })
    }

    return this.requestWithResponse<T>(path, {
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
    if (data instanceof FormData) {
      return this.request<T>(path, {
        ...requestInit,
        method: 'PATCH',
        body: data,
      })
    }

    return this.request<T>(path, {
      ...requestInit,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  private resolveUrl(path: string): string {
    return new URL(path, this.baseUrl).href
  }

  private mergeInit(requestInit?: RequestInit): RequestInit {
    const init: RequestInit = {
      ...this.defaultInit,
      ...requestInit,
      headers: mergeHeaders(this.defaultInit.headers, requestInit?.headers),
    }

    if (init.body instanceof FormData) {
      const headers = new Headers(init.headers)
      headers.delete('Content-Type')
      init.headers = headers
    }

    return init
  }

  private async buildHeaders(init: RequestInit, includeAccessToken = true): Promise<Headers> {
    const headers = new Headers(init.headers)
    const token = this.getAccessToken?.()

    if (includeAccessToken && token) {
      headers.set('Authorization', `Bearer ${token}`)
    } else if (!includeAccessToken) {
      headers.delete('Authorization')
    }

    return headers
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

  private async execute<T>(url: string, init: RequestInit, includeAccessToken = true): Promise<T> {
    const response = await this.executeWithResponse<T>(url, init, includeAccessToken)
    return response.data
  }

  private async executeWithResponse<T>(
    url: string,
    init: RequestInit,
    includeAccessToken = true
  ): Promise<QueryFactoryResponse<T>> {
    const headers = await this.buildHeaders(init, includeAccessToken)
    const response = await fetch(url, { ...init, headers })

    if (!response.ok) {
      const body = await this.parseErrorBody(response)
      throw new QueryFactoryError(response.status, body)
    }

    return { data: await this.parseBody<T>(response), headers: response.headers }
  }

  private async request<T>(path: string, requestInit?: RequestInit): Promise<T> {
    const response = await this.requestWithResponse<T>(path, requestInit)
    return response.data
  }

  private async requestWithResponse<T>(
    path: string,
    requestInit?: RequestInit
  ): Promise<QueryFactoryResponse<T>> {
    const url = this.resolveUrl(path)
    const init = this.mergeInit(requestInit)
    const accessToken = this.getAccessToken?.() ?? null

    try {
      return await this.executeWithResponse<T>(url, init)
    } catch (error) {
      if (!(error instanceof QueryFactoryError) || error.status !== 401 || !this.canRefresh(url)) {
        throw error
      }

      if ((this.getAccessToken?.() ?? null) !== accessToken) {
        return this.executeWithResponse<T>(url, init)
      }

      try {
        await this.refreshAccessToken()
      } catch (refreshError) {
        if (refreshError instanceof QueryFactoryError && refreshError.status === 401) {
          const authenticationError = new QueryFactoryAuthenticationError(error, refreshError)
          await this.onAuthenticationFailure?.()
          throw authenticationError
        }
        throw refreshError
      }

      return this.executeWithResponse<T>(url, init)
    }
  }

  private canRefresh(url: string): boolean {
    if (!this.refresh) {
      return false
    }

    const pathname = new URL(url).pathname
    return !UNAUTHENTICATED_AUTH_PATHS.includes(
      pathname as (typeof UNAUTHENTICATED_AUTH_PATHS)[number]
    )
  }

  private async refreshAccessToken(): Promise<void> {
    const refresh = this.refresh
    if (!refresh) {
      return
    }

    if (!this.refreshPromise) {
      const refreshPromise = this.execute<LoginResponse>(
        this.resolveUrl(refresh.path),
        this.mergeInit({
          method: 'POST',
          body: JSON.stringify(refresh.data),
        }),
        false
      ).then((response) => refresh.onSuccess(response))
      this.refreshPromise = refreshPromise
    }

    const refreshPromise = this.refreshPromise
    try {
      await refreshPromise
    } finally {
      if (this.refreshPromise === refreshPromise) {
        this.refreshPromise = null
      }
    }
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

function toPathname(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}
