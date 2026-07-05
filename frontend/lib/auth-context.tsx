'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, AuthUser } from '@/lib/api'

export type Role = 'Admin' | 'Manager' | 'Operator'

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  signup: (data: { firstName: string; lastName: string; company: string; email: string; password: string; code: string }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isAuthenticated: false,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(() => typeof window !== 'undefined' && !!window.localStorage.getItem('transportai_token'))

  useEffect(() => {
    const token = window.localStorage.getItem('transportai_token')
    if (!token) {
      return
    }
    api.me()
      .then(setUser)
      .catch(() => window.localStorage.removeItem('transportai_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)
    window.localStorage.setItem('transportai_token', response.token)
    setUser(response.user)
  }

  const signup = async (data: { firstName: string; lastName: string; company: string; email: string; password: string; code: string }) => {
    const response = await api.signup(data)
    window.localStorage.setItem('transportai_token', response.token)
    setUser(response.user)
  }

  const logout = () => {
    api.logout().catch(() => {})
    window.localStorage.removeItem('transportai_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function usePermission() {
  const { user } = useAuth()
  const role = user?.role ?? 'Operator'

  return {
    canApprove: role === 'Admin' || role === 'Manager',
    canDelete: role === 'Admin',
    canExport: role === 'Admin' || role === 'Manager',
    canManageUsers: role === 'Admin',
    canBilling: role === 'Admin',
  }
}
