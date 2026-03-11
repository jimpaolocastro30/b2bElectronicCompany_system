'use client'

import { useEffect, useState } from 'react'
import { http } from '../../lib/http'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const fmt = (v) => `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const SERVICE_COLORS = { power: '#f59e0b', gas: '#3b82f6', water: '#06b6d4' }

export default function RevenueReport() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    http.get('/api/v1/admin/dashboard')
      .then((r) => setData(r.data))
      .catch((e) => setError(e?.response?.data?.error || 'Failed to load revenue data'))
  }, [])

  if (error) return <div className="error">{error}</div>

  if (!data) {
    return (
      <section className="fade-in">
        <div className="section-header"><h2>Revenue Report</h2></div>
        <div className="skeleton skeleton--chart" />
      </section>
    )
  }

  const { kpis, revenueByMonth, revenueByService, billStatusDist, topCustomers } = data
  const serviceTotal = revenueByService.reduce((s, r) => s + r.total, 0) || 1

  return (
    <section className="fade-in">
      <div className="section-header">
        <h2>Revenue Report</h2>
        <p className="muted">Billing revenue breakdown, trends, and top customers.</p>
      </div>

      <div className="summary-row">
        <div className="summary-item">
          <span className="summary-item__label">Total Revenue</span>
          <span className="summary-item__value">{fmt(kpis.totalRevenue)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-item__label">Outstanding</span>
          <span className="summary-item__value">{fmt(kpis.outstanding)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-item__label">Total Bills</span>
          <span className="summary-item__value">{kpis.totalBills.toLocaleString()}</span>
        </div>
      </div>

      <div className="dash-grid">
        <div className="panel panel--full">
          <h3>Revenue by Month</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [fmt(v), 'Revenue']} />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3>Revenue by Service Type</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {revenueByService.map((s) => (
              <div key={s.type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{s.type}</span>
                  <span className="mono">{fmt(s.total)}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--slate-100)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(s.total / serviceTotal) * 100}%`,
                      height: '100%',
                      borderRadius: 4,
                      background: SERVICE_COLORS[s.type] || 'var(--slate-500)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Bill Status Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {billStatusDist.map((s) => (
              <div key={s.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`badge badge--${s.status}`}>{s.status}</span>
                <span style={{ fontSize: 13 }}>
                  <strong>{s.count}</strong> bills &middot; {fmt(s.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Top Customers</h3>
        <div className="table" style={{ '--cols': 4 }}>
          <div className="row head">
            <span>Name</span>
            <span>Email</span>
            <span className="right">Bills</span>
            <span className="right">Total Revenue</span>
          </div>
          {topCustomers.map((c) => (
            <div className="row" key={c.email}>
              <span className="truncate">{c.name}</span>
              <span className="truncate muted">{c.email}</span>
              <span className="right">{c.bills}</span>
              <span className="right mono">{fmt(c.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
