import type { ApiErrorBody } from '../types'

// Local development and the production reverse proxy both expose the API at
// the same-origin /api path. An environment value is only needed to override it.
const API_URL = String(import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const TOKEN_KEY = 'pm_access_token'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

function defaultMessage(status: number): string {
  if (status === 400) return 'Please check your request and try again.'
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status === 403) return "You don't have permission to perform this action."
  if (status === 404) return 'The requested resource could not be found.'
  if (status === 409) return 'This action conflicts with existing data.'
  if (status === 422) return 'Please correct the highlighted fields.'
  if (status >= 500) return 'The server encountered a problem. Please try again.'
  return 'Something went wrong. Please try again.'
}

async function parseError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody = {}
  try { body = await response.json() as ApiErrorBody } catch { /* no JSON body */ }

  const fieldErrors: Record<string, string> = {}
  if (Array.isArray(body.detail)) {
    for (const issue of body.detail) {
      const key = issue.loc?.at(-1)
      if (key !== undefined && issue.msg) fieldErrors[String(key)] = issue.msg
    }
  }
  const message = response.status === 403
    ? defaultMessage(response.status)
    : typeof body.detail === 'string' ? body.detail : defaultMessage(response.status)
  return new ApiError(message, response.status, fieldErrors)
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers = new Headers(init.headers)
  if (!(init.body instanceof URLSearchParams) && init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (authenticated) {
    const token = tokenStore.get()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError('Unable to connect to the server.', 0)
  }

  if (!response.ok) {
    const error = await parseError(response)
    if (response.status === 401 && authenticated) {
      tokenStore.clear()
      window.dispatchEvent(new Event('auth:expired'))
    }
    throw error
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function queryString(values: Record<string, string | number | undefined | null>) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}
