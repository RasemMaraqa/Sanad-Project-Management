import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import { tokenStore } from '../api/client'
import type { User } from '../types'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; username: string; password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(tokenStore.get()))
  const queryClient = useQueryClient()

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    const token = tokenStore.get()
    if (!token) { setIsLoading(false); return }
    authApi.me().then(setUser).catch(logout).finally(() => setIsLoading(false))
  }, [logout])

  useEffect(() => {
    window.addEventListener('auth:expired', logout)
    return () => window.removeEventListener('auth:expired', logout)
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const token = await authApi.login(email, password)
    tokenStore.set(token.access_token)
    try { setUser(await authApi.me()) } catch (error) { tokenStore.clear(); throw error }
  }, [])

  const register = useCallback(async (data: { email: string; username: string; password: string }) => {
    await authApi.register(data)
    await login(data.email, data.password)
  }, [login])

  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), isLoading, login, register, logout }), [user, isLoading, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
