'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TopBar } from '../components/TopBar'
import { AuthGuard } from '../components/AuthGuard'

const sections = [
  { path: 'service-points', label: 'Service points' },
  { path: 'usage-ingest', label: 'Usage ingest' },
  { path: 'billing', label: 'Billing run' },
  { path: 'anomalies', label: 'Anomalies' },
  { path: 'contracts', label: 'Contracts' },
  { path: 'bids', label: 'Market bids' },
  { path: 'grid', label: 'Grid status' },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const base = pathname.startsWith('/personnel') ? '/personnel' : '/admin'

  return (
    <AuthGuard roles={['admin']}>
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
