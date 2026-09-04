import { apiRequest } from './client'
import type { AuthToken, User } from '../types'

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ email: data.email, username: data.username, password_hash: data.password }),
    }, false),
  login: (email: string, password: string) => {
    const body = new URLSearchParams({ username: email, password })
    return apiRequest<AuthToken>('/login', { method: 'POST', body }, false)
  },
  me: () => apiRequest<User>('/me'),
}
