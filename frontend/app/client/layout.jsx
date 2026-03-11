'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TopBar } from '../components/TopBar'
import { AuthGuard } from '../components/AuthGuard'

const nav = [
  { path: '/client', label: 'Overview' },
  { path: '/client/service-points', label: 'Service points' },
  { path: '/client/usage', label: 'Usage' },
  { path: '/client/bills', label: 'Bills' },
  { path: '/client/service-request', label: 'Service request' },
]

export default function ClientLayout({ children }) {
  const pathname = usePathname()

  return (
    <AuthGuard roles={['client']}>
      <TopBar />
      <main className="container">
        <nav className="portal-nav">
          {nav.map(({ path, label }) => (
            <Link
              key={path}
              href={path}
              className={pathname === path || (path !== '/client' && pathname.startsWith(path)) ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="grid">
          {children}
        </div>
      </main>
    </AuthGuard>
  )
}
