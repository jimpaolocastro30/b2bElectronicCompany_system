'use client'

import { useEffect, useState } from 'react'
import { http } from '../../lib/http'

const fmt = (v) => `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function TradingReport() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    http.get('/api/v1/admin/dashboard')
      .then((r) => setData(r.data))
      .catch((e) => setError(e?.response?.data?.error || 'Failed to load trading data'))
  }, [])

  if (error) return <div className="error">{error}</div>

  if (!data) {
    return (
      <section className="fade-in">
        <div className="section-header"><h2>Trading Performance</h2></div>
        <div className="skeleton skeleton--lg" style={{ marginBottom: 16 }} />
        <div className="skeleton skeleton--lg" />
      </section>
    )
  }

  const { kpis, anomaliesBySeverity } = data

  return (
    <section className="fade-in">
      <div className="section-header">
        <h2>Trading Performance</h2>
        <p className="muted">Contracts, bids, trading volume, and anomaly overview.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi kpi--violet">
          <div className="kpi__label">Total Contracts</div>
          <div className="kpi__value">{kpis.contractCount.toLocaleString()}</div>
        </div>
        <div className="kpi kpi--green">
          <div className="kpi__label">Active Contracts</div>
          <div className="kpi__value">{kpis.activeContracts.toLocaleString()}</div>
        </div>
        <div className="kpi kpi--blue">
          <div className="kpi__label">Total Bids</div>
          <div className="kpi__value">{kpis.bidCount.toLocaleString()}</div>
        </div>
        <div className="kpi kpi--green">
          <div className="kpi__label">Accepted Bids</div>
          <div className="kpi__value">{kpis.acceptedBids.toLocaleString()}</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <h3>Trading Volume &amp; Value</h3>
        <div className="summary-row">
          <div className="summary-item">
            <span className="summary-item__label">Total Volume</span>
            <span className="summary-item__value">{kpis.tradingVolume.toLocaleString()} MWh</span>
          </div>
          <div className="summary-item">
            <span className="summary-item__label">Total Value</span>
            <span className="summary-item__value">{fmt(kpis.tradingValue)}</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Anomalies by Severity</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
          {['low', 'medium', 'high', 'critical'].map((sev) => {
            const entry = anomaliesBySeverity.find((a) => a.severity === sev)
            return (
              <div
                key={sev}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(15,23,42,0.06)',
                }}
              >
                <span className={`badge badge--${sev}`}>{sev}</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{entry?.count ?? 0}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
