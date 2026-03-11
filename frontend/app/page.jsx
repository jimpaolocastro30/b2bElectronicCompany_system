'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth/useAuth'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/login'); return }
    if (user.role === 'admin') router.replace('/admin')
    else if (user.role === 'personnel') router.replace('/personnel')
    else router.replace('/client')
  }, [user, loading, router])

  return <div className="container">Loading...</div>
}
