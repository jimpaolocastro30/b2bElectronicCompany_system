'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/useAuth'

export function AuthGuard({ roles, children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/login'); return }
    if (roles?.length && !roles.includes(user.role)) { router.replace('/'); return }
  }, [user, loading, roles, router])

  if (loading) return <div className="container">Loading...</div>
  if (!user) return null
  if (roles?.length && !roles.includes(user.role)) return null

  return children
}
