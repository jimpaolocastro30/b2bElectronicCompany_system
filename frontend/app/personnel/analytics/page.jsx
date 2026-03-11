'use client'

import { useEffect, useState } from 'react'
import { http } from '../../lib/http'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const UNIT_MAP = { power: 'kWh', gas: 'm³', water: 'L' }
const COLOR_MAP = { power: 'amber', gas: 'blue', water: 'cyan' }

export default function UsageAnalytics() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    http.get('/api/v1/admin/dashboard')
      .then((r) => setData(r.data))
      .catch((e) => setError(e?.response?.data?.error || 'Failed to load usage data'))
  }, [])

  if (error) return <div className="error">{error}</div>

  if (!data) {
    return (
      <section className="fade-in">
        <div className="section-header"><h2>Usage Analytics</h2></div>
        <div className="skeleton skeleton--chart" />
      </section>
    )
  }

  const { usageByService, usageDaily } = data

  return (
    <section className="fade-in">
      <div className="section-header">
        <h2>Usage Analytics</h2>
        <p className="muted">Service consumption metrics across all customers (last 30 days).</p>
      </div>

      <div className="kpi-grid">
        {['power', 'gas', 'water'].map((type) => {
          const entry = usageByService.find((u) => u.type === type)
          return (
            <div className={`kpi kpi--${COLOR_MAP[type]}`} key={type}>
              <div className="kpi__label">{type}</div>
              <div className="kpi__value">
                {entry ? entry.total.toLocaleString() : '0'}
              </div>
              <div className="kpi__sub">{entry?.unit || UNIT_MAP[type]}</div>
            </div>
          )
        })}
      </div>

      <div className="panel">
        <h3>Daily Usage Trend</h3>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usageDaily} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [Number(v).toLocaleString(), 'Usage']} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h3>Usage by Service Type</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
          {usageByService.map((s) => {
            const max = Math.max(...usageByService.map((u) => u.total)) || 1
            const color = SERVICE_BAR_COLORS[s.type] || 'var(--slate-500)'
            return (
              <div key={s.type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{s.type}</span>
                  <span className="mono">{s.total.toLocaleString()} {s.unit}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--slate-100)', overflow: 'hidden' }}>
                  <div style={{ width: `${(s.total / max) * 100}%`, height: '100%', borderRadius: 4, background: color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const SERVICE_BAR_COLORS = { power: '#f59e0b', gas: '#3b82f6', water: '#06b6d4' }
