'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { requestOtp, verifyOtp } from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await requestOtp(email)
      setStep('otp')
    } catch {
      setError('Failed to send code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await verifyOtp(email, otp)
      setToken(data.access_token)
      router.push('/dashboard')
    } catch {
      setError('Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#fafafa', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, background: '#111',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>A</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 20, color: '#111' }}>AgentDB</span>
          </a>
          <p style={{ fontSize: 14, color: '#888', marginTop: 8 }}>
            The operational database for AI agents
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '36px 32px',
          border: '1px solid #e5e5e5', boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
        }}>
          {step === 'email' ? (
            <>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Sign in</h1>
              <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
                We&apos;ll send a login code to your email.
              </p>
              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoFocus
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 14px', borderRadius: 9, fontSize: 14,
                      border: '1px solid #ddd', outline: 'none', color: '#111',
                      background: '#fafafa',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#111')}
                    onBlur={e => (e.target.style.borderColor = '#ddd')}
                  />
                </div>
                {error && <p style={{ fontSize: 13, color: '#ef4444' }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email}
                  style={{
                    padding: '11px', borderRadius: 9, fontSize: 14, fontWeight: 500,
                    background: '#111', color: '#fff', border: 'none', cursor: 'pointer',
                    opacity: loading || !email ? 0.4 : 1,
                  }}
                >
                  {loading ? 'Sending...' : 'Send login code →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Check your email</h1>
              <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
                We sent a 6-digit code to <strong style={{ color: '#111' }}>{email}</strong>
              </p>
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
                    Login code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    autoFocus
                    maxLength={6}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '12px', borderRadius: 9, fontSize: 24,
                      border: '1px solid #ddd', outline: 'none', color: '#111',
                      background: '#fafafa', textAlign: 'center', letterSpacing: '0.4em',
                      fontFamily: 'monospace',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#111')}
                    onBlur={e => (e.target.style.borderColor = '#ddd')}
                  />
                </div>
                {error && <p style={{ fontSize: 13, color: '#ef4444' }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  style={{
                    padding: '11px', borderRadius: 9, fontSize: 14, fontWeight: 500,
                    background: '#111', color: '#fff', border: 'none', cursor: 'pointer',
                    opacity: loading || otp.length < 6 ? 0.4 : 1,
                  }}
                >
                  {loading ? 'Verifying...' : 'Sign in →'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setError('') }}
                  style={{ fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ← Use a different email
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', marginTop: 20 }}>
          Self-hosting?{' '}
          <a href="/docs" style={{ color: '#555', textDecoration: 'none', fontWeight: 500 }}>
            View setup guide →
          </a>
        </p>
      </div>
    </div>
  )
}
