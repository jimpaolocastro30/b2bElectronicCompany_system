import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { http } from '../../api/http'

export function BillsPage() {
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
    <section className="panel">
      <h2>Bills</h2>
      <p className="muted">View and manage your utility bills.</p>
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
            <div>{b.status}</div>
            <div className="right">
              {b.currency} {Number(b.totalAmount).toFixed(2)}
            </div>
            <div>
              <Link to={`/client/bills/${b.id}`} className="link">Details</Link>
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
