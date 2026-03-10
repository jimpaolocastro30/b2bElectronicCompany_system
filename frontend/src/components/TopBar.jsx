import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function TopBar() {
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="brand">
          <span className="brand__dot" />
          <span className="brand__text">Energy B2B</span>
        </div>

        <nav className="nav">
          {user?.role === 'client' && <Link to="/client">Portal</Link>}
          {user?.role === 'admin' && <Link to="/admin">Operations</Link>}
          {user?.role === 'personnel' && <Link to="/personnel">Operations</Link>}
        </nav>

        <div className="topbar__right">
          <span className="pill">
            {user?.email} · {user?.role}
          </span>
          <button className="ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

