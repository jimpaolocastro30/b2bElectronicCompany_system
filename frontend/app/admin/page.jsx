'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function OperationsOverview() {
  const pathname = usePathname()
  const base = pathname.startsWith('/personnel') ? '/personnel' : '/admin'

  return (
    <section className="panel">
      <h2>Operations</h2>
      <p className="muted">Service points, usage ingest, billing, and trading.</p>
      <ul>
        <li><Link href={`${base}/service-points`}>Service points</Link> - Search and filter.</li>
        <li><Link href={`${base}/usage-ingest`}>Usage ingest</Link> - Bulk upload readings.</li>
        <li><Link href={`${base}/billing`}>Billing run</Link> - Generate bills for a period.</li>
        <li><Link href={`${base}/anomalies`}>Anomalies</Link> - Security and usage flags.</li>
        <li><Link href={`${base}/contracts`}>Contracts</Link> - Bilateral contracts.</li>
        <li><Link href={`${base}/bids`}>Market bids</Link> - Day-ahead bids.</li>
        <li><Link href={`${base}/grid`}>Grid status</Link> - Grid snapshots.</li>
      </ul>
    </section>
  )
}
