import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { http } from '../api/http'
import { TopBar } from '../components/TopBar'

export function PersonnelView() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  async function load() {
    setError('')
    try {
      const res = await http.get('/api/v1/orders')
      setOrders(res.data.orders || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load orders')
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const socket = io('/', { transports: ['websocket'] })
    socket.on('order:created', () => load())
    socket.on('order:fulfilled', () => load())
    return () => socket.disconnect()
  }, [])

  async function fulfill(id) {
    setError('')
    try {
      await http.post(`/api/v1/orders/${id}/fulfill`)
      await load()
    } catch (e) {
      setError(e?.response?.data?.error || 'Fulfillment failed')
    }
  }

  return (
    <>
      <TopBar />
      <main className="container">
        <section className="panel">
          <h2>Personnel</h2>
          <p className="muted">Order fulfillment and stock updates.</p>

          {error && <div className="error">{error}</div>}

          <div className="table">
            <div className="row head">
              <div>Order</div>
              <div>Status</div>
              <div className="right">Total</div>
              <div className="right">Action</div>
            </div>
            {orders.map((o) => (
              <div className="row" key={o.id}>
                <div className="mono">{o.id}</div>
                <div>{o.status}</div>
                <div className="right">{Number(o.total).toFixed(2)}</div>
                <div className="right">
                  <button
                    className="small"
                    onClick={() => fulfill(o.id)}
                    disabled={o.status === 'fulfilled'}
                  >
                    {o.status === 'fulfilled' ? 'Done' : 'Fulfill'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

