'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TopBar } from '../components/TopBar'
import { AuthGuard } from '../components/AuthGuard'

const sections = [
  { path: 'reports', label: 'Revenue' },
  { path: 'analytics', label: 'Usage Analytics' },
  { path: 'trading-report', label: 'Trading' },
  { path: 'service-points', label: 'Service Points' },
  { path: 'usage-ingest', label: 'Ingest' },
  { path: 'billing', label: 'Billing' },
  { path: 'anomalies', label: 'Anomalies' },
  { path: 'contracts', label: 'Contracts' },
  { path: 'bids', label: 'Bids' },
  { path: 'grid', label: 'Grid' },
]

export default function PersonnelLayout({ children }) {
  const pathname = usePathname()
  const base = pathname.startsWith('/personnel') ? '/personnel' : '/admin'

  return (
    <AuthGuard roles={['personnel']}>
      <TopBar />
      <main className="container">
        <nav className="portal-nav">
          <Link href={base} className={pathname === base ? 'active' : ''}>
            Overview
          </Link>
          {sections.map(({ path, label }) => {
            const p = `${base}/${path}`
            return (
              <Link key={path} href={p} className={pathname === p || pathname.startsWith(p + '/') ? 'active' : ''}>
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="grid">
          {children}
        </div>
      </main>
    </AuthGuard>
  )
}
