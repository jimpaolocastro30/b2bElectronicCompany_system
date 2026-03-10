import { Link, Outlet, useLocation } from 'react-router-dom'
import { TopBar } from '../components/TopBar'

const sections = [
  { path: 'service-points', label: 'Service points' },
  { path: 'usage-ingest', label: 'Usage ingest' },
  { path: 'billing', label: 'Billing run' },
  { path: 'anomalies', label: 'Anomalies' },
  { path: 'contracts', label: 'Contracts' },
  { path: 'bids', label: 'Market bids' },
  { path: 'grid', label: 'Grid status' },
]

export function OperationsLayout() {
  const loc = useLocation()
  const base = loc.pathname.startsWith('/personnel') ? 'personnel' : 'admin'

  return (
    <>
      <TopBar />
      <main className="container">
        <nav className="portal-nav">
          <Link to={`/${base}`} className={loc.pathname === `/${base}` ? 'active' : ''}>
            Overview
          </Link>
          {sections.map(({ path, label }) => {
            const p = `/${base}/${path}`
            return (
              <Link
                key={path}
                to={p}
                className={loc.pathname === p || loc.pathname.startsWith(p + '/') ? 'active' : ''}
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="grid">
          <Outlet />
        </div>
      </main>
    </>
  )
}

export function OperationsOverview() {
  const loc = useLocation()
  const base = loc.pathname.startsWith('/personnel') ? 'personnel' : 'admin'

  return (
    <section className="panel">
      <h2>Operations</h2>
      <p className="muted">Service points, usage ingest, billing, and trading.</p>
      <ul>
        <li><Link to={`/${base}/service-points`}>Service points</Link> – Search and filter.</li>
        <li><Link to={`/${base}/usage-ingest`}>Usage ingest</Link> – Bulk upload readings.</li>
        <li><Link to={`/${base}/billing`}>Billing run</Link> – Generate bills for a period.</li>
        <li><Link to={`/${base}/anomalies`}>Anomalies</Link> – Security and usage flags.</li>
        <li><Link to={`/${base}/contracts`}>Contracts</Link> – Bilateral contracts.</li>
        <li><Link to={`/${base}/bids`}>Market bids</Link> – Day-ahead bids.</li>
        <li><Link to={`/${base}/grid`}>Grid status</Link> – Grid snapshots.</li>
      </ul>
    </section>
  )
}
