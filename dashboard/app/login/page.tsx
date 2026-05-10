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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-sm px-6">

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: '#22c55e' }}>
              <span className="text-black font-bold text-sm">A</span>
            </div>
            <span className="text-white font-semibold text-xl">AgentDB</span>
          </div>
          <p className="text-sm" style={{ color: '#737373' }}>
            The operational database for AI agents
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl p-8" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
          {step === 'email' ? (
            <>
              <h1 className="text-white font-semibold text-lg mb-1">Sign in</h1>
              <p className="text-sm mb-6" style={{ color: '#737373' }}>
                We'll send a login code to your email.
              </p>
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#a3a3a3' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoFocus
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition"
                    style={{
                      background: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#22c55e')}
                    onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
                  />
                </div>
                {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-lg py-2.5 text-sm font-medium text-black transition disabled:opacity-40"
                  style={{ background: '#22c55e' }}
                >
                  {loading ? 'Sending...' : 'Send login code →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-white font-semibold text-lg mb-1">Check your email</h1>
              <p className="text-sm mb-6" style={{ color: '#737373' }}>
                We sent a 6-digit code to <span style={{ color: '#e5e5e5' }}>{email}</span>
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#a3a3a3' }}>
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
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none font-mono tracking-widest text-center transition"
                    style={{
                      background: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      fontSize: '22px',
                      letterSpacing: '0.3em',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#22c55e')}
                    onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
                  />
                </div>
                {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full rounded-lg py-2.5 text-sm font-medium text-black transition disabled:opacity-40"
                  style={{ background: '#22c55e' }}
                >
                  {loading ? 'Verifying...' : 'Sign in →'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setError('') }}
                  className="w-full text-sm text-center"
                  style={{ color: '#737373' }}
                >
                  ← Use a different email
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#525252' }}>
          Self-hosting?{' '}
          <a
            href="https://github.com/Zizka-ai/agentdb"
            className="underline"
            style={{ color: '#737373' }}
          >
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  )
}
