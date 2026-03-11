'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { http } from '../../lib/http'

export default function UsagePage() {
  const [readings, setReadings] = useState([])
  const [error, setError] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    let cancelled = false
    setError('')
    const params = new URLSearchParams()
    if (serviceType) params.set('serviceType', serviceType)
    if (from) params.set('from', new Date(from).toISOString())
    if (to) params.set('to', new Date(to + 'T23:59:59').toISOString())
    params.set('limit', '500')
    http
      .get(`/api/v1/self/usage?${params}`)
      .then((res) => {
        if (!cancelled) setReadings(res.data.readings || [])
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.error || 'Failed to load usage')
      })
    return () => { cancelled = true }
  }, [serviceType, from, to])

  const chartData = readings
    .slice()
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map((r) => ({
      date: new Date(r.timestamp).toLocaleDateString(),
      value: r.value,
      unit: r.unit,
    }))

  return (
    <section className="panel fade-in">
      <h2>Usage</h2>
      <p className="muted">Historical usage by service point.</p>
      {error && <div className="error">{error}</div>}
      <div className="toolbar">
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="select"
        >
          <option value="">All types</option>
          <option value="power">Power</option>
          <option value="gas">Gas</option>
          <option value="water">Water</option>
        </select>
        <label>
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      {chartData.length > 0 && (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="var(--accent, #0a7)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="table">
        <div className="row head">
          <div>Time</div>
          <div className="right">Value</div>
          <div>Unit</div>
          <div>Quality</div>
        </div>
        {readings.slice(0, 50).map((r) => (
          <div className="row" key={r.id}>
            <div>{new Date(r.timestamp).toLocaleString()}</div>
            <div className="right">{Number(r.value).toFixed(2)}</div>
            <div>{r.unit}</div>
            <div>{r.qualityFlag || '—'}</div>
          </div>
        ))}
      </div>
      {readings.length === 0 && !error && (
        <p className="muted">No usage data for this period.</p>
      )}
    </section>
  )
}
