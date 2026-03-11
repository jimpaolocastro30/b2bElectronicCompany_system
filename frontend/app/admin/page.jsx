'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { http } from '../lib/http'

const fmt = (v) => `$${Number(v).toFixed(2)}`
const fmtShort = (v) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return fmt(v)
}

function SkeletonDashboard() {
  return (
    <>
      <div className="kpi-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="kpi">
            <div className="skeleton skeleton--text" />
            <div className="skeleton skeleton--lg" />
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <div className="panel"><div className="skeleton skeleton--text" /><div className="skeleton skeleton--chart" /></div>
        <div className="panel"><div className="skeleton skeleton--text" /><div className="skeleton skeleton--chart" /></div>
      </div>
      <div className="dash-grid">
        <div className="panel"><div className="skeleton skeleton--text" /><div className="skeleton skeleton--lg" /></div>
        <div className="panel"><div className="skeleton skeleton--text" /><div className="skeleton skeleton--lg" /></div>
      </div>
      <div className="panel"><div className="skeleton skeleton--text" /><div className="skeleton skeleton--chart" /></div>
    </>
  )
}

export default function OperationsDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    http.get('/api/v1/admin/dashboard')
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load dashboard data.'))
  }, [])

  if (error) return <div className="error">{error}</div>
  if (!data) return <SkeletonDashboard />

  const { kpis, revenueByMonth, revenueByService, usageDaily, billStatusDist, anomaliesBySeverity, topCustomers } = data

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2>Operations Dashboard</h2>
        <p className="muted">Overview of customers, revenue, usage, and trading activity.</p>
      </div>

      {/* ── KPI cards ─────────────────────────────── */}
      <div className="kpi-grid">
        <div className="kpi kpi--blue">
          <div className="kpi__label">Total Customers</div>
          <div className="kpi__value">{kpis.totalCustomers}</div>
          <div className="kpi__sub">{kpis.totalServicePoints} service points</div>
        </div>
        <div className="kpi kpi--cyan">
          <div className="kpi__label">Service Points</div>
          <div className="kpi__value">{kpis.totalServicePoints}</div>
          <div className="kpi__sub">{kpis.activeServicePoints} active</div>
        </div>
        <div className="kpi kpi--green">
          <div className="kpi__label">Total Revenue</div>
          <div className="kpi__value">{fmtShort(kpis.totalRevenue)}</div>
          <div className="kpi__sub">{kpis.totalBills} bills generated</div>
        </div>
        <div className="kpi kpi--amber">
          <div className="kpi__label">Outstanding</div>
          <div className="kpi__value">{fmtShort(kpis.outstanding)}</div>
          <div className="kpi__sub">unpaid balance</div>
        </div>
        <div className="kpi kpi--red">
          <div className="kpi__label">Anomalies</div>
          <div className="kpi__value">{kpis.anomalyCount}</div>
          <div className="kpi__sub">{kpis.unresolvedAnomalies} unresolved</div>
        </div>
        <div className="kpi kpi--violet">
          <div className="kpi__label">Active Contracts</div>
          <div className="kpi__value">{kpis.activeContracts}</div>
          <div className="kpi__sub">{kpis.contractCount} total</div>
        </div>
        <div className="kpi kpi--blue">
          <div className="kpi__label">Trading Volume</div>
          <div className="kpi__value">{kpis.tradingVolume}</div>
          <div className="kpi__sub">{fmtShort(kpis.tradingValue)} value</div>
        </div>
        <div className="kpi kpi--green">
          <div className="kpi__label">Accepted Bids</div>
          <div className="kpi__value">{kpis.acceptedBids}</div>
          <div className="kpi__sub">{kpis.bidCount} total bids</div>
        </div>
      </div>

      {/* ── Charts row ────────────────────────────── */}
      <div className="dash-grid">
        <div className="panel">
          <h3>Revenue by Month</h3>
          <p className="muted small">{revenueByMonth.length} months</p>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3>Usage Daily (Last 30 Days)</h3>
          <p className="muted small">{usageDaily.length} data points</p>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Revenue by service & bill status ───── */}
      <div className="dash-grid">
        <div className="panel">
          <h3>Revenue by Service Type</h3>
          <div className="summary-row">
            {revenueByService.map((s) => (
              <div key={s.type} className="summary-item">
                <span className="summary-item__label">{s.type}</span>
                <span className="summary-item__value">
                  <span className={`badge badge--${s.type.toLowerCase()}`}>{s.type}</span>{' '}
                  {fmt(s.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Bill Status Distribution</h3>
          <div className="summary-row">
            {billStatusDist.map((b) => (
              <div key={b.status} className="summary-item">
                <span className="summary-item__label">{b.status}</span>
                <span className="summary-item__value">
                  <span className={`badge badge--${b.status.toLowerCase()}`}>{b.count}</span>{' '}
                  {fmt(b.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Anomalies & Top customers ─────────── */}
      <div className="dash-grid">
        <div className="panel">
          <h3>Anomalies by Severity</h3>
          <div className="summary-row">
            {anomaliesBySeverity.map((a) => (
              <div key={a.severity} className="summary-item">
                <span className="summary-item__label">{a.severity}</span>
                <span className="summary-item__value">
                  <span className={`badge badge--${a.severity.toLowerCase()}`}>{a.count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Top Customers</h3>
          <div className="table" style={{ '--cols': 4 }}>
            <div className="row head">
              <span>Name</span>
              <span>Email</span>
              <span className="right">Total Billed</span>
              <span className="right">Bills</span>
            </div>
            {topCustomers.map((c) => (
              <div key={c.email} className="row">
                <span className="truncate">{c.name}</span>
                <span className="truncate muted">{c.email}</span>
                <span className="right mono">{fmt(c.total)}</span>
                <span className="right">{c.bills}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
