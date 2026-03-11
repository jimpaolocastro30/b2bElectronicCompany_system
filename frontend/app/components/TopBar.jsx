'use client'

import Link from 'next/link'
import { useAuth } from '../auth/useAuth'

export function TopBar() {
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="brand">
          <span className="brand__dot" />
          <span className="brand__text">{process.env.NEXT_PUBLIC_SITE_NAME || 'Energy B2B'}</span>
        </div>
        <nav className="nav">
          {user?.role === 'client' && <Link href="/client">Portal</Link>}
          {user?.role === 'admin' && <Link href="/admin">Operations</Link>}
          {user?.role === 'personnel' && <Link href="/personnel">Operations</Link>}
        </nav>
        <div className="topbar__right">
          <span className="pill">
            {user?.email} &middot; {user?.role}
          </span>
          <button className="ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
