import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { http } from '../api/http'
import { TopBar } from '../components/TopBar'

export function ClientPortal() {
  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState({})
  const [error, setError] = useState('')

  const totalItems = useMemo(
    () =>
      Object.values(selected).reduce(
        (sum, n) => sum + (Number.isFinite(n) ? n : 0),
        0,
      ),
    [selected],
  )

  async function load() {
    setError('')
    try {
      const [invRes, ordersRes] = await Promise.all([
        http.get('/api/v1/inventory'),
        http.get('/api/v1/orders'),
      ])
      setInventory(invRes.data.items || [])
      setOrders(ordersRes.data.orders || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load data')
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const socket = io('/', { transports: ['websocket'] })
    socket.on('inventory:updated', (payload) => {
      setInventory((prev) => {
        const next = [...prev]
        const idx = next.findIndex((x) => x.sku === payload.sku)
        if (idx >= 0) next[idx] = { ...next[idx], ...payload }
        return next
      })
    })
    socket.on('order:created', () => load())
    return () => socket.disconnect()
  }, [])

  function setQty(sku, qty) {
    setSelected((prev) => ({ ...prev, [sku]: qty }))
  }

  async function createOrder() {
    setError('')
    const items = Object.entries(selected)
      .map(([sku, q]) => ({ sku, quantity: Number(q) || 0 }))
      .filter((x) => x.quantity > 0)
    if (!items.length) return

    try {
      await http.post('/api/v1/orders', { items })
      setSelected({})
      await load()
    } catch (e) {
      setError(e?.response?.data?.error || 'Order failed')
    }
  }

  return (
    <>
      <TopBar />
      <main className="container">
        <div className="grid">
          <section className="panel">
            <h2>Catalog / Inventory</h2>
            <p className="muted">
              Real-time inventory helps prevent oversell.
            </p>

            {error && <div className="error">{error}</div>}

            <div className="table">
              <div className="row head">
                <div>SKU</div>
                <div>Name</div>
                <div className="right">Available</div>
                <div className="right">Qty</div>
              </div>
              {inventory.map((i) => (
                <div className="row" key={i.sku}>
                  <div className="mono">{i.sku}</div>
                  <div>
                    <div>{i.name}</div>
                    {i.description ? (
                      <div className="muted small">{i.description}</div>
                    ) : null}
                  </div>
                  <div className="right">{i.available ?? 0}</div>
                  <div className="right">
                    <input
                      className="qty"
                      type="number"
                      min="0"
                      value={selected[i.sku] ?? ''}
                      onChange={(e) =>
                        setQty(i.sku, Math.max(0, Number(e.target.value || 0)))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="actions">
              <button onClick={createOrder} disabled={totalItems === 0}>
                Create order
              </button>
              <span className="muted">
                Items: <b>{totalItems}</b>
              </span>
            </div>
          </section>

          <section className="panel">
            <h2>My Orders</h2>
            <div className="table">
              <div className="row head">
                <div>Order</div>
                <div>Status</div>
                <div className="right">Total</div>
              </div>
              {orders.map((o) => (
                <div className="row" key={o.id}>
                  <div className="mono">{o.id.slice(-8)}</div>
                  <div>{o.status}</div>
                  <div className="right">{Number(o.total).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

