'use client'

import { useEffect, useState } from 'react'
import { http } from '../../lib/http'

export default function AnomaliesPage() {
  const [list, setList] = useState([])
  const [error, setError] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    let cancelled = false
    setError('')
    const params = type ? `?type=${encodeURIComponent(type)}` : ''
    http
      .get(`/api/v1/security/anomalies${params}`)
      .then((res) => {
        if (!cancelled) setList(res.data.anomalies || [])
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.error || 'Failed to load')
      })
    return () => { cancelled = true }
  }, [type])

  return (
    <section className="panel fade-in">
      <h2>Anomalies</h2>
      <p className="muted">Security and usage anomaly flags.</p>
      {error && <div className="error">{error}</div>}
      <div className="toolbar">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="usage">Usage</option>
          <option value="billing">Billing</option>
          <option value="access">Access</option>
          <option value="trading">Trading</option>
        </select>
      </div>
      <div className="table">
        <div className="row head">
          <div>Type</div>
          <div>Severity</div>
          <div>Description</div>
          <div>Detected</div>
          <div>Resolved</div>
        </div>
        {list.map((a) => (
          <div className="row" key={a.id}>
            <div><span className="badge badge--pending">{a.relatedType}</span></div>
            <div><span className={`badge badge--${a.severity}`}>{a.severity}</span></div>
            <div>{a.description}</div>
            <div>{a.detectedAt ? new Date(a.detectedAt).toLocaleString() : '—'}</div>
            <div>{a.resolvedAt ? new Date(a.resolvedAt).toLocaleString() : '—'}</div>
          </div>
        ))}
      </div>
      {list.length === 0 && !error && <p className="muted">No anomalies.</p>}
    </section>
  )
}
