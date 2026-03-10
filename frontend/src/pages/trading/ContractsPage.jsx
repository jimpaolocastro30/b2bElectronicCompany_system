import { useEffect, useState } from 'react'
import { http } from '../../api/http'

export function ContractsPage() {
  const [contracts, setContracts] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    counterpartyName: '',
    productType: 'base-load',
    volume: '',
    price: '',
    currency: 'USD',
    startDate: '',
    endDate: '',
  })

  function load() {
    setError('')
    http
      .get('/api/v1/trading/contracts')
      .then((res) => setContracts(res.data.contracts || []))
      .catch((e) => setError(e?.response?.data?.error || 'Failed to load'))
  }

  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault()
    setError('')
    try {
      await http.post('/api/v1/trading/contracts', {
        counterpartyName: form.counterpartyName.trim(),
        productType: form.productType.trim(),
        volume: Number(form.volume),
        price: Number(form.price),
        currency: form.currency,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      })
      setForm({ ...form, counterpartyName: '', volume: '', price: '', startDate: '', endDate: '' })
      load()
    } catch (e) {
      setError(e?.response?.data?.error || 'Create failed')
    }
  }

  return (
    <section className="panel">
      <h2>Bilateral contracts</h2>
      <p className="muted">Day-ahead and bilateral energy contracts.</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={create} className="form inline" style={{ flexWrap: 'wrap', gap: 8 }}>
        <input
          placeholder="Counterparty"
          value={form.counterpartyName}
          onChange={(e) => setForm({ ...form, counterpartyName: e.target.value })}
          required
        />
        <input
          placeholder="Product type"
          value={form.productType}
          onChange={(e) => setForm({ ...form, productType: e.target.value })}
        />
        <input
          type="number"
          placeholder="Volume"
          value={form.volume}
          onChange={(e) => setForm({ ...form, volume: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          type="date"
          placeholder="Start"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          required
        />
        <input
          type="date"
          placeholder="End"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          required
        />
        <button type="submit">Add contract</button>
      </form>
      <div className="table" style={{ marginTop: 16 }}>
        <div className="row head">
          <div>Counterparty</div>
          <div>Product</div>
          <div className="right">Volume</div>
          <div className="right">Price</div>
          <div>Start</div>
          <div>End</div>
          <div>Status</div>
        </div>
        {contracts.map((c) => (
          <div className="row" key={c.id}>
            <div>{c.counterpartyName}</div>
            <div>{c.productType}</div>
            <div className="right">{c.volume}</div>
            <div className="right">{c.currency} {c.price}</div>
            <div>{c.startDate ? new Date(c.startDate).toLocaleDateString() : '—'}</div>
            <div>{c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}</div>
            <div>{c.status}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
