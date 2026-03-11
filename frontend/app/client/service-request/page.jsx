'use client'

import { useState } from 'react'
import { http } from '../../lib/http'

export default function ServiceRequestPage() {
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSent(false)
    try {
      await http.post('/api/v1/self/service-requests', {
        type: type.trim(),
        description: description.trim(),
        preferredDate: preferredDate ? new Date(preferredDate).toISOString() : undefined,
      })
      setSent(true)
      setType('')
      setDescription('')
      setPreferredDate('')
    } catch (e) {
      setError(e?.response?.data?.error || 'Request failed')
    }
  }

  return (
    <section className="panel">
      <h2>Service request</h2>
      <p className="muted">Submit a meter issue, tariff change, or connection request.</p>
      {error && <div className="error">{error}</div>}
      {sent && <div className="success">Request submitted.</div>}
      <form onSubmit={submit} className="form">
        <label>
          Request type
          <input
            type="text"
            placeholder="e.g. Meter issue, Tariff change"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </label>
        <label>
          Description
          <textarea
            placeholder="Describe your request…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </label>
        <label>
          Preferred date (optional)
          <input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
          />
        </label>
        <button type="submit">Submit request</button>
      </form>
    </section>
  )
}
