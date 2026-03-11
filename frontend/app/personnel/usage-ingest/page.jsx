'use client'

import { useState } from 'react'
import { http } from '../../lib/http'

export default function UsageIngestPage() {
  const [json, setJson] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    let readings
    try {
      readings = JSON.parse(json)
      if (!Array.isArray(readings)) throw new Error('Must be an array')
    } catch (err) {
      setError('Invalid JSON or not an array')
      return
    }
    const payload = readings.map((r) => ({
      servicePointId: r.servicePointId,
      timestamp: typeof r.timestamp === 'string' ? r.timestamp : new Date(r.timestamp).toISOString(),
      value: Number(r.value),
      unit: r.unit || 'kWh',
      qualityFlag: r.qualityFlag || 'actual',
    }))
    try {
      const res = await http.post('/api/v1/admin/usage-readings', { readings: payload })
      setResult(res.data)
      setJson('')
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Ingest failed')
    }
  }

  const example = JSON.stringify([
    {
      servicePointId: '<servicePointId>',
      timestamp: new Date().toISOString(),
      value: 100,
      unit: 'kWh',
      qualityFlag: 'actual',
    },
  ], null, 2)

  return (
    <section className="panel fade-in">
      <h2>Usage ingest</h2>
      <p className="muted">Bulk upload usage readings (e.g. from IoT gateways).</p>
      {error && <div className="error">{error}</div>}
      {result && <div className="success">Ingested {result.count} readings.</div>}
      <form onSubmit={submit} className="form">
        <label>
          Readings JSON (array of {`{ servicePointId, timestamp, value, unit, qualityFlag? }`})
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder={example}
            rows={12}
            className="mono"
          />
        </label>
        <button type="submit">Ingest</button>
      </form>
    </section>
  )
}
