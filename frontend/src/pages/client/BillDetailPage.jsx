import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { http } from '../../api/http'

export function BillDetailPage() {
  const { id } = useParams()
  const [bill, setBill] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setError('')
    http
      .get(`/api/v1/self/bills/${id}`)
      .then((res) => {
        if (!cancelled) setBill(res.data)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.error || 'Failed to load bill')
      })
    return () => { cancelled = true }
  }, [id])

  if (error) return <section className="panel"><div className="error">{error}</div><Link to="/client">Back to portal</Link></section>
  if (!bill) return <section className="panel"><p>Loading…</p></section>

  return (
    <section className="panel">
      <h2>Bill details</h2>
      <p className="muted">
        {new Date(bill.periodStart).toLocaleDateString()} – {new Date(bill.periodEnd).toLocaleDateString()} · {bill.status}
      </p>
      <div className="table">
        <div className="row head">
          <div>Service</div>
          <div className="right">Usage</div>
          <div>Unit</div>
          <div className="right">Unit price</div>
          <div className="right">Amount</div>
        </div>
        {(bill.services || []).map((s, i) => (
          <div className="row" key={i}>
            <div>{s.serviceType}</div>
            <div className="right">{Number(s.usage).toFixed(2)}</div>
            <div>{s.unit}</div>
            <div className="right">{bill.currency} {Number(s.unitPrice).toFixed(2)}</div>
            <div className="right">{bill.currency} {Number(s.amount).toFixed(2)}</div>
          </div>
        ))}
      </div>
      <p><strong>Total: {bill.currency} {Number(bill.totalAmount).toFixed(2)}</strong></p>
      {bill.issuedAt && <p className="muted">Issued: {new Date(bill.issuedAt).toLocaleString()}</p>}
      {bill.paidAt && <p className="muted">Paid: {new Date(bill.paidAt).toLocaleString()}</p>}
      <Link to="/client">Back to portal</Link>
    </section>
  )
}
