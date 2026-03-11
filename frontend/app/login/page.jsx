'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/useAuth'

export default function LoginPage() {
  const { login, verifyMfa } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [mfaToken, setMfaToken] = useState('')
  const [otp, setOtp] = useState('')

  const isMfaStep = useMemo(() => Boolean(mfaToken), [mfaToken])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (!isMfaStep) {
        const result = await login({ email, password })
        if (result.mfaRequired) {
          setMfaToken(result.mfaToken)
          return
        }
        router.replace('/')
        return
      }

      await verifyMfa({ mfaToken, code: otp })
      router.replace('/')
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="card fade-in" style={{ maxWidth: 420, width: '100%' }}>
        <div className="center" style={{ marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span className="brand__dot" style={{ width: 14, height: 14 }} />
            <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
              {process.env.NEXT_PUBLIC_SITE_NAME || 'Energy B2B'}
            </span>
          </div>
          <h1>Sign in</h1>
          <p className="muted">
            Portal access for Clients, Admins, and Personnel.
          </p>
        </div>

        <form onSubmit={onSubmit} className="form">
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              disabled={busy || isMfaStep}
              required
            />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              disabled={busy || isMfaStep}
              required
            />
          </label>

          {isMfaStep && (
            <label>
              One-time code (OTP)
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                placeholder="6 digits"
                disabled={busy}
                required
              />
              <span className="help">
                Admin/Personnel accounts require email OTP. If SMTP is not
                configured, the backend will log the code.
              </span>
            </label>
          )}

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={busy}>
            {busy ? 'Please wait...' : isMfaStep ? 'Verify code' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
