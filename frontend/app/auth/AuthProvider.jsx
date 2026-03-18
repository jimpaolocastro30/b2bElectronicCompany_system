'use client'

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { http } from '../lib/http'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    try {
      const res = await http.get('/auth/me', { skipAuthRefresh: true })
      setUser(res.data.user || null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const login = useCallback(async ({ email, password }) => {
    const res = await http.post('/auth/login', { email, password })
    if (res.data?.mfaRequired) {
      return { mfaRequired: true, mfaToken: res.data.mfaToken }
    }
    await loadMe()
    return { mfaRequired: false }
  }, [loadMe])

  const verifyMfa = useCallback(async ({ mfaToken, code }) => {
    await http.post('/auth/mfa/verify', { mfaToken, code })
    await loadMe()
  }, [loadMe])

  const logout = useCallback(async () => {
    try {
      await http.post('/auth/logout')
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, verifyMfa, logout, reload: loadMe }),
    [user, loading, login, verifyMfa, logout, loadMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
