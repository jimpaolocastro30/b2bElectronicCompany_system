'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { http } from '../../lib/http'

export default function BillsPage() {
  const [bills, setBills] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setError('')
    http
      .get('/api/v1/self/bills')
      .then((res) => {
        if (!cancelled) setBills(res.data.bills || [])
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.error || 'Failed to load bills')
      })
    return () => { cancelled = true }
  }, [])

  return (
    <section className="panel fade-in">
      <div className="section-header">
        <h2>Bills</h2>
        <p className="muted">View and manage your utility bills.</p>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="table">
        <div className="row head">
          <div>Period</div>
          <div>Status</div>
          <div className="right">Total</div>
          <div></div>
        </div>
        {bills.map((b) => (
          <div className="row" key={b.id}>
            <div>
              {new Date(b.periodStart).toLocaleDateString()} – {new Date(b.periodEnd).toLocaleDateString()}
            </div>
            <div><span className={`badge badge--${b.status}`}>{b.status}</span></div>
            <div className="right">
              {b.currency} {Number(b.totalAmount).toFixed(2)}
            </div>
            <div>
              <Link href={`/client/bills/${b.id}`} className="link">Details</Link>
            </div>
          </div>
        ))}
      </div>
      {bills.length === 0 && !error && (
        <p className="muted">No bills yet.</p>
      )}
    </section>
  )
}
