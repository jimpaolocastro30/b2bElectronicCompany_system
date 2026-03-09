import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) return <div className="container">Loading…</div>
  if (!user) return <Navigate to="/login" replace />

  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (user.role === 'personnel') return <Navigate to="/personnel" replace />
  return <Navigate to="/client" replace />
}

