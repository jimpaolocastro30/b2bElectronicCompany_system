'use client'

import Link from 'next/link'

export default function ClientOverview() {
  return (
    <section className="panel">
      <h2>Usage &amp; Billing</h2>
      <p className="muted">Manage your service points, view usage, and pay bills.</p>
      <ul>
        <li><Link href="/client/service-points">Service points</Link> - Your power, gas, and water meters.</li>
        <li><Link href="/client/usage">Usage</Link> - Historical usage and charts.</li>
        <li><Link href="/client/bills">Bills</Link> - View and download bills.</li>
        <li><Link href="/client/service-request">Service request</Link> - Submit a request.</li>
      </ul>
    </section>
  )
}
