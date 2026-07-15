'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, AuthUser } from '@/lib/api'

export type Role = 'Admin' | 'Manager' | 'Operator'

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  signup: (data: { firstName: string; lastName: string; company: string; email: string; password: string; code: string }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  isAuthenticated: false,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Rely on HTTP-Only cookie, so we unconditionally try to fetch the user
    // on initial load to verify if they have an active session.
    api.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)
    setUser(response.user)
  }

  const signup = async (data: { firstName: string; lastName: string; company: string; email: string; password: string; code: string }) => {
    const response = await api.signup(data)
    setUser(response.user)
  }

  const logout = () => {
    api.logout().catch(() => {})
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const u = await api.me()
      setUser(u)
    } catch {
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser, isAuthenticated: !!user, loading }}>
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
