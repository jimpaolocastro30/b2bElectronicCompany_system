'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { http } from '../../lib/http'

export default function GridStatusPage() {
  const [snapshots, setSnapshots] = useState([])
  const [error, setError] = useState('')
  const [region, setRegion] = useState('')
  const [limit, setLimit] = useState(50)

  useEffect(() => {
    let cancelled = false
    setError('')
    const params = new URLSearchParams()
    if (region) params.set('region', region)
    params.set('limit', limit)
    http
      .get(`/api/v1/grid/status?${params}`)
      .then((res) => {
        if (!cancelled) setSnapshots(res.data.snapshots || [])
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.error || 'Failed to load')
      })
    return () => { cancelled = true }
  }, [region, limit])

  const chartData = snapshots
    .slice()
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map((s) => ({
      time: new Date(s.timestamp).toLocaleTimeString(),
      load: s.load,
      frequency: s.frequency,
      renewables: s.renewablesShare,
    }))

  return (
    <section className="panel fade-in">
      <h2>Grid status</h2>
      <p className="muted">Real-time grid snapshots (region, frequency, load, renewables).</p>
      {error && <div className="error">{error}</div>}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Filter by region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      {chartData.length > 0 && (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="load" name="Load (MW)" stroke="var(--accent, #0a7)" />
              <Line type="monotone" dataKey="frequency" name="Frequency (Hz)" stroke="#c60" />
              <Line type="monotone" dataKey="renewables" name="Renewables %" stroke="#6a6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="table" style={{ marginTop: 16 }}>
        <div className="row head">
          <div>Time</div>
          <div>Region</div>
          <div className="right">Load (MW)</div>
          <div className="right">Frequency (Hz)</div>
          <div className="right">Renewables %</div>
          <div>Alerts</div>
        </div>
        {snapshots.slice(0, 30).map((s) => (
          <div className="row" key={s.id}>
            <div>{new Date(s.timestamp).toLocaleString()}</div>
            <div>{s.region}</div>
            <div className="right">{s.load ?? '—'}</div>
            <div className="right">{s.frequency ?? '—'}</div>
            <div className="right">{s.renewables != null ? `${s.renewables}%` : '—'}</div>
            <div>{(s.alerts || []).join(', ') || '—'}</div>
          </div>
        ))}
      </div>
      {snapshots.length === 0 && !error && <p className="muted">No grid snapshots.</p>}
    </section>
  )
}
