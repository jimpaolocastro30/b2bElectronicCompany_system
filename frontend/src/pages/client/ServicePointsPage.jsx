import { useEffect, useState } from 'react'
import { http } from '../../api/http'

export function ServicePointsPage() {
  const [data, setData] = useState({ servicePoints: [] })
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    let cancelled = false
    setError('')
    http
      .get('/api/v1/self/profile')
      .then((res) => {
        if (!cancelled) setData(res.data)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.error || 'Failed to load')
      })
    return () => { cancelled = true }
  }, [])

  const points = (data.servicePoints || []).filter(
    (sp) =>
      !filter ||
      sp.serviceType?.toLowerCase().includes(filter.toLowerCase()) ||
      sp.accountNumber?.toLowerCase().includes(filter.toLowerCase()) ||
      sp.meterId?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <section className="panel">
      <h2>Service Points</h2>
      <p className="muted">Your power, gas, and water meter points.</p>
      {error && <div className="error">{error}</div>}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Filter by type, account, meter..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search"
        />
      </div>
      <div className="table">
        <div className="row head">
          <div>Account</div>
          <div>Type</div>
          <div>Meter ID</div>
          <div>Location</div>
          <div>Status</div>
        </div>
        {points.map((sp) => (
          <div className="row" key={sp.id}>
            <div className="mono">{sp.accountNumber}</div>
            <div>{sp.serviceType}</div>
            <div className="mono">{sp.meterId}</div>
            <div>
              {[sp.location?.city, sp.location?.region].filter(Boolean).join(', ') || '—'}
            </div>
            <div>{sp.isActive ? 'Active' : 'Inactive'}</div>
          </div>
        ))}
      </div>
      {points.length === 0 && !error && (
        <p className="muted">No service points found.</p>
      )}
    </section>
  )
}
