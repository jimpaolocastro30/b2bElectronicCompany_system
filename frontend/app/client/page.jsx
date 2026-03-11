'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts'
import { http } from '../lib/http'

export default function ClientDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    http.get('/api/v1/self/dashboard')
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard data.'))
  }, [])

  if (error) return <div className="error">{error}</div>

  if (!data) {
    return (
      <div className="fade-in">
        <div className="kpi-grid">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="kpi">
              <div className="skeleton skeleton--text" />
              <div className="skeleton skeleton--lg" />
            </div>
          ))}
        </div>
        <div className="dash-grid">
          <div className="panel"><div className="skeleton skeleton--chart" /></div>
          <div className="panel"><div className="skeleton skeleton--chart" /></div>
        </div>
        <div className="panel"><div className="skeleton skeleton--chart" /></div>
      </div>
    )
  }

  const { kpis, servicePointsByType, usageByType, usageDaily, billsByMonth, recentBills } = data
  const trendUp = kpis.usageTrend >= 0

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1>Dashboard</h1>
        <p className="muted">Your account overview and recent activity.</p>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid">
        <div className="kpi kpi--blue">
          <div className="kpi__label">Service Points</div>
          <div className="kpi__value">{kpis.servicePoints}</div>
          <div className="kpi__sub">
            {Object.entries(servicePointsByType).map(([type, count]) => (
              <span key={type} className={`badge badge--${type}`} style={{ marginRight: 6 }}>
                {type} {count}
              </span>
            ))}
          </div>
        </div>

        <div className="kpi kpi--green">
          <div className="kpi__label">Active Points</div>
          <div className="kpi__value">{kpis.activePoints}</div>
          <div className="kpi__sub">of {kpis.servicePoints} total</div>
        </div>

        <div className="kpi kpi--cyan">
          <div className="kpi__label">Current Usage (30d)</div>
          <div className="kpi__value">{kpis.currentUsage}</div>
          <div className={`kpi__trend ${trendUp ? 'kpi__trend--up' : 'kpi__trend--down'}`}>
            {trendUp ? '+' : ''}{kpis.usageTrend}%
          </div>
        </div>

        <div className="kpi kpi--violet">
          <div className="kpi__label">Usage Trend</div>
          <div className="kpi__value">
            {trendUp ? '+' : ''}{kpis.usageTrend}%
          </div>
          <div className="kpi__sub">vs previous 30 days</div>
        </div>

        <div className="kpi kpi--blue">
          <div className="kpi__label">Total Billed</div>
          <div className="kpi__value">${Number(kpis.totalBilled).toFixed(2)}</div>
          <div className="kpi__sub">${Number(kpis.totalPaid).toFixed(2)} paid</div>
        </div>

        <div className="kpi kpi--amber">
          <div className="kpi__label">Outstanding</div>
          <div className="kpi__value">${Number(kpis.outstanding).toFixed(2)}</div>
        </div>

        <div className="kpi kpi--red">
          <div className="kpi__label">Overdue Bills</div>
          <div className="kpi__value">{kpis.overdueBills}</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="dash-grid">
        {/* Usage daily line chart */}
        <div className="panel">
          <h3>Daily Usage (Last 30 Days)</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={v => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Billing by month bar chart */}
        <div className="panel">
          <h3>Billing by Month</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={billsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => `$${Number(v).toFixed(2)}`} />
                <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Usage breakdown by type */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <h3>Usage Breakdown by Service Type</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
          {usageByType.map(item => (
            <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge badge--${item.type}`}>{item.type}</span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>
                {item.total} <span className="muted small">{item.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent bills table */}
      <div className="panel">
        <h3>Recent Bills</h3>
        <div className="table" style={{ '--cols': 5 }}>
          <div className="row head">
            <div>Bill ID</div>
            <div>Period</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {recentBills.map(bill => (
            <div className="row" key={bill.id}>
              <div className="mono">{bill.id}</div>
              <div>
                {bill.periodStart} — {bill.periodEnd}
              </div>
              <div style={{ fontWeight: 600 }}>
                {bill.currency === 'USD' ? '$' : bill.currency}
                {Number(bill.totalAmount).toFixed(2)}
              </div>
              <div>
                <span className={`badge badge--${bill.status}`}>{bill.status}</span>
              </div>
              <div>
                <Link href={`/client/bills/${bill.id}`} className="link">View</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
