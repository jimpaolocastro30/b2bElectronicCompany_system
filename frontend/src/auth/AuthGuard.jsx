import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

export function AuthGuard({ roles }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="container">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/" replace />

  return <Outlet />
}

