'use client'

import { useEffect, useState } from 'react'
import { http } from '../../lib/http'

export default function ServicePointAdminPage() {
  const [list, setList] = useState([])
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [serviceType, setServiceType] = useState('')

  useEffect(() => {
    let cancelled = false
    setError('')
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (serviceType) params.set('serviceType', serviceType)
    http
      .get(`/api/v1/admin/service-points?${params}`)
      .then((res) => {
        if (!cancelled) setList(res.data.servicePoints || [])
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.error || 'Failed to load')
      })
    return () => { cancelled = true }
  }, [q, serviceType])

  return (
    <section className="panel">
      <h2>Service points</h2>
      <p className="muted">Search and filter all service points.</p>
      {error && <div className="error">{error}</div>}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="search"
        />
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
        >
          <option value="">All types</option>
          <option value="power">Power</option>
          <option value="gas">Gas</option>
          <option value="water">Water</option>
        </select>
      </div>
      <div className="table">
        <div className="row head">
          <div>Account</div>
          <div>Type</div>
          <div>Meter ID</div>
          <div>Customer</div>
          <div>Zone</div>
          <div>Status</div>
        </div>
        {list.map((sp) => (
          <div className="row" key={sp.id}>
            <div className="mono">{sp.accountNumber}</div>
            <div>{sp.serviceType}</div>
            <div className="mono">{sp.meterId}</div>
            <div className="mono">{sp.customerId?.slice(-8)}</div>
            <div>{sp.gridZone || '—'}</div>
            <div>{sp.isActive ? 'Active' : 'Inactive'}</div>
          </div>
        ))}
      </div>
      {list.length === 0 && !error && <p className="muted">No service points.</p>}
    </section>
  )
}
