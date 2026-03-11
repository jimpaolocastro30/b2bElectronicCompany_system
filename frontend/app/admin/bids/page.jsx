'use client'

import { useEffect, useState } from 'react'
import { http } from '../../lib/http'

export default function MarketBidsPage() {
  const [bids, setBids] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    market: '',
    deliveryDate: '',
    hourBlock: '1-24',
    volume: '',
    price: '',
    currency: 'USD',
  })

  function load() {
    setError('')
    http
      .get('/api/v1/trading/market-bids')
      .then((res) => setBids(res.data.bids || []))
      .catch((e) => setError(e?.response?.data?.error || 'Failed to load'))
  }

  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault()
    setError('')
    try {
      await http.post('/api/v1/trading/market-bids', {
        market: form.market.trim(),
        deliveryDate: new Date(form.deliveryDate).toISOString(),
        hourBlock: form.hourBlock.trim(),
        volume: Number(form.volume),
        price: Number(form.price),
        currency: form.currency,
      })
      setForm({ ...form, market: '', deliveryDate: '', volume: '', price: '' })
      load()
    } catch (e) {
      setError(e?.response?.data?.error || 'Create failed')
    }
  }

  return (
    <section className="panel fade-in">
      <h2>Market bids</h2>
      <p className="muted">Day-ahead market bids (placeholder; no ISO connectivity).</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={create} className="form inline" style={{ flexWrap: 'wrap', gap: 8 }}>
        <input
          placeholder="Market (e.g. ISO-NE)"
          value={form.market}
          onChange={(e) => setForm({ ...form, market: e.target.value })}
          required
        />
        <input
          type="date"
          placeholder="Delivery date"
          value={form.deliveryDate}
          onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
          required
        />
        <input
          placeholder="Hour block"
          value={form.hourBlock}
          onChange={(e) => setForm({ ...form, hourBlock: e.target.value })}
        />
        <input
          type="number"
          placeholder="Volume (MWh)"
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
        <button type="submit">Add bid</button>
      </form>
      <div className="table" style={{ marginTop: 16 }}>
        <div className="row head">
          <div>Market</div>
          <div>Delivery</div>
          <div>Hour block</div>
          <div className="right">Volume</div>
          <div className="right">Price</div>
          <div>Status</div>
        </div>
        {bids.map((b) => (
          <div className="row" key={b.id}>
            <div>{b.market}</div>
            <div>{b.deliveryDate ? new Date(b.deliveryDate).toLocaleDateString() : '—'}</div>
            <div>{b.hourBlock}</div>
            <div className="right">{b.volume}</div>
            <div className="right">{b.currency} {b.price}</div>
            <div><span className={`badge badge--${b.status}`}>{b.status}</span></div>
          </div>
        ))}
      </div>
    </section>
  )
}
