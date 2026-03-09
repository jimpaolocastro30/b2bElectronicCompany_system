import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { http } from '../api/http'
import { TopBar } from '../components/TopBar'

export function AdminPanel() {
  const [pricing, setPricing] = useState([])
  const [inventory, setInventory] = useState([])
  const [error, setError] = useState('')

  const [sku, setSku] = useState('')
  const [unitPrice, setUnitPrice] = useState('')

  async function load() {
    setError('')
    try {
      const [pRes, iRes] = await Promise.all([
        http.get('/api/v1/pricing'),
        http.get('/api/v1/inventory'),
      ])
      setPricing(pRes.data.pricing || [])
      setInventory(iRes.data.items || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load data')
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const socket = io('/', { transports: ['websocket'] })
    socket.on('pricing:updated', () => load())
    socket.on('inventory:updated', () => load())
    return () => socket.disconnect()
  }, [])

  async function upsertPricing(e) {
    e.preventDefault()
    setError('')
    try {
      await http.post('/api/v1/pricing', {
        sku: sku.trim(),
        unitPrice: Number(unitPrice),
        currency: 'USD',
      })
      setSku('')
      setUnitPrice('')
      await load()
    } catch (e2) {
      setError(e2?.response?.data?.error || 'Pricing update failed')
    }
  }

  return (
    <>
      <TopBar />
      <main className="container">
        <div className="grid">
          <section className="panel">
            <h2>Admin</h2>
            <p className="muted">
              Manage pricing and monitor ERP sync outputs (inventory/pricing).
            </p>
            {error && <div className="error">{error}</div>}

            <h3>Pricing upsert</h3>
            <form onSubmit={upsertPricing} className="form inline">
              <input
                placeholder="SKU"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
              <input
                placeholder="Unit price"
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
              />
              <button type="submit">Save</button>
            </form>

            <div className="table">
              <div className="row head">
                <div>SKU</div>
                <div className="right">Unit price</div>
              </div>
              {pricing.map((p) => (
                <div className="row" key={p.sku}>
                  <div className="mono">{p.sku}</div>
                  <div className="right">
                    {Number(p.unitPrice).toFixed(2)} {p.currency}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Inventory snapshot</h2>
            <div className="table">
              <div className="row head">
                <div>SKU</div>
                <div>Name</div>
                <div className="right">On hand</div>
                <div className="right">Reserved</div>
                <div className="right">Available</div>
              </div>
              {inventory.map((i) => (
                <div className="row" key={i.sku}>
                  <div className="mono">{i.sku}</div>
                  <div>{i.name}</div>
                  <div className="right">{i.quantityOnHand}</div>
                  <div className="right">{i.reserved}</div>
                  <div className="right">{i.available ?? 0}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

