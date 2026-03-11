'use client'

import { useState } from 'react'
import { http } from '../../lib/http'

export default function BillingRunPage() {
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function run(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    if (!periodStart || !periodEnd) {
      setError('Set period start and end')
      return
    }
    try {
      const res = await http.post('/api/v1/admin/billing/run', {
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd + 'T23:59:59').toISOString(),
      })
      setResult(res.data)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Billing run failed')
    }
  }

  return (
    <section className="panel fade-in">
      <h2>Billing run</h2>
      <p className="muted">Generate bills for a period from usage and tariffs.</p>
      {error && <div className="error">{error}</div>}
      {result && (
        <div className="success">
          Bills created: {result.billsCreated}
        </div>
      )}
      <form onSubmit={run} className="form inline">
        <label>
          Period start
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            required
          />
        </label>
        <label>
          Period end
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            required
          />
        </label>
        <button type="submit">Run billing</button>
      </form>
    </section>
  )
}
