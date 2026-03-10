import { Link, Outlet, useLocation } from 'react-router-dom'
import { TopBar } from '../components/TopBar'

const nav = [
  { path: '/client', label: 'Overview' },
  { path: '/client/service-points', label: 'Service points' },
  { path: '/client/usage', label: 'Usage' },
  { path: '/client/bills', label: 'Bills' },
  { path: '/client/service-request', label: 'Service request' },
]

export function ClientPortal() {
  const loc = useLocation()

  return (
    <>
      <TopBar />
      <main className="container">
        <nav className="portal-nav">
          {nav.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={loc.pathname === path || (path !== '/client' && loc.pathname.startsWith(path)) ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="grid">
          <Outlet />
        </div>
      </main>
    </>
  )
}

export function ClientOverview() {
  return (
    <section className="panel">
      <h2>Usage &amp; Billing</h2>
      <p className="muted">Manage your service points, view usage, and pay bills.</p>
      <ul>
        <li><Link to="/client/service-points">Service points</Link> – Your power, gas, and water meters.</li>
        <li><Link to="/client/usage">Usage</Link> – Historical usage and charts.</li>
        <li><Link to="/client/bills">Bills</Link> – View and download bills.</li>
        <li><Link to="/client/service-request">Service request</Link> – Submit a request.</li>
      </ul>
    </section>
  )
}
