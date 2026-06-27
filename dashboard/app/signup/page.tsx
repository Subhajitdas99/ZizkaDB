'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { requestOtp, verifyOtp, validatePromo } from '@/lib/api'
import { setToken } from '@/lib/auth'
import { BRAND, BRAND_DARK } from '@/components/brand'
import { M } from '@/components/marketing/marketing-theme'
import { STATION_F_CODE, stationFPlans } from '@/components/marketing/StationFOffer'

type PlanId = 'pro' | 'team'

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  )
}

function SignupFallback() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: M.wash, fontFamily: 'Inter, system-ui, sans-serif', color: M.muted,
    }}>
      Loading…
    </div>
  )
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialPlan = (searchParams.get('plan') === 'team' ? 'team' : 'pro') as PlanId
  const initialPromo = searchParams.get('promo')?.toUpperCase() || ''

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [plan, setPlan] = useState<PlanId>(initialPlan)
  const [promoCode, setPromoCode] = useState(initialPromo)
  const [promoOk, setPromoOk] = useState<boolean | null>(null)
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const hasStationOffer = promoCode.toUpperCase() === STATION_F_CODE

  useEffect(() => {
    if (!promoCode.trim()) {
      setPromoOk(null)
      return
    }
    const t = setTimeout(async () => {
      try {
        await validatePromo(promoCode, plan)
        setPromoOk(true)
        setError('')
      } catch {
        setPromoOk(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [promoCode, plan])

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault()
    if (promoCode.trim() && promoOk === false) {
      setError('Promo code is not valid for the selected plan.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await requestOtp(email)
      setStep('otp')
    } catch {
      setError('Could not send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await verifyOtp(email, otp, {
        promoCode: promoCode.trim() || undefined,
        plan,
      })
      setToken(data.access_token)
      router.replace('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px', borderRadius: 10, fontSize: 14,
    border: `1px solid ${M.line}`, outline: 'none', color: M.ink,
    background: '#fff',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: M.inkSoft, marginBottom: 6,
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(180deg, ${M.wash} 0%, #fff 100%)`,
      fontFamily: 'Inter, system-ui, sans-serif', padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: `linear-gradient(135deg, ${BRAND} 0%, ${M.blue} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Z</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: M.ink }}>ZizkaDB</span>
          </Link>
          <p style={{ fontSize: 14, color: M.muted, marginTop: 8 }}>
            Operational database for AI agents
          </p>
        </div>

        {hasStationOffer && (
          <div style={{
            marginBottom: 16, padding: '14px 16px', borderRadius: 12,
            background: M.bluePale, border: `1px solid ${M.blue}44`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: M.blue, marginBottom: 4 }}>
              STATION F OFFER APPLIED
            </div>
            <div style={{ fontSize: 14, color: M.inkSoft, lineHeight: 1.5 }}>
              6 months free on {plan === 'team' ? 'Team' : 'Pro (Solo)'} with code {STATION_F_CODE}.
            </div>
          </div>
        )}

        <div style={{
          background: '#fff', borderRadius: 16, padding: '32px 28px',
          border: `1px solid ${M.line}`, boxShadow: '0 8px 32px rgba(15,23,42,0.06)',
        }}>
          {step === 'email' ? (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: M.ink, marginBottom: 6 }}>
                Create your account
              </h1>
              <p style={{ fontSize: 14, color: M.muted, marginBottom: 22, lineHeight: 1.6 }}>
                Pick a plan, add a promo code if you have one, then verify your email. No password needed.
              </p>

              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Plan</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {stationFPlans.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlan(p.id)}
                        style={{
                          padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                          border: plan === p.id ? `2px solid ${p.accent}` : `1px solid ${M.line}`,
                          background: plan === p.id ? p.bg : '#fff',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 14, color: M.ink }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: M.muted, marginTop: 2 }}>{p.subtitle}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Promo code (optional)</label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SF180"
                    style={{
                      ...inputStyle,
                      fontFamily: 'JetBrains Mono, monospace',
                      letterSpacing: 1,
                      borderColor: promoOk === true ? M.teal : promoOk === false ? '#ef4444' : M.line,
                    }}
                  />
                  {promoOk === true && (
                    <p style={{ fontSize: 12, color: M.teal, margin: '6px 0 0', fontWeight: 600 }}>
                      Code valid. 6 months free on {plan === 'team' ? 'Team' : 'Pro'}.
                    </p>
                  )}
                  {promoOk === false && promoCode.trim() && (
                    <p style={{ fontSize: 12, color: '#ef4444', margin: '6px 0 0' }}>
                      Code not valid for this plan.
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: M.faint, margin: '6px 0 0' }}>
                    Station F startups: use code{' '}
                    <Link href="/offers/station-f" style={{ color: M.blue, fontWeight: 600, textDecoration: 'none' }}>
                      {STATION_F_CODE}
                    </Link>
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>Work email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@startup.com"
                    required
                    autoFocus
                    style={inputStyle}
                  />
                </div>

                {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !email || (promoCode.trim() !== '' && promoOk === false)}
                  style={{
                    padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                    background: `linear-gradient(135deg, ${BRAND} 0%, ${M.blue} 100%)`,
                    color: '#fff', border: 'none', cursor: 'pointer',
                    opacity: loading || !email ? 0.5 : 1,
                  }}
                >
                  {loading ? 'Sending…' : 'Send verification code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: M.ink, marginBottom: 6 }}>
                Verify your email
              </h1>
              <p style={{ fontSize: 14, color: M.muted, marginBottom: 22, lineHeight: 1.6 }}>
                We sent a 6-digit code to <strong style={{ color: M.ink }}>{email}</strong>
              </p>

              <div style={{
                marginBottom: 18, padding: '12px 14px', borderRadius: 10,
                background: M.wash, border: `1px solid ${M.line}`, fontSize: 13, color: M.inkSoft,
              }}>
                Plan: <strong>{plan === 'team' ? 'Team' : 'Pro (Solo)'}</strong>
                {promoCode.trim() && (
                  <> · Code: <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>{promoCode.toUpperCase()}</strong></>
                )}
              </div>

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Verification code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    autoFocus
                    maxLength={6}
                    style={{
                      ...inputStyle,
                      fontSize: 28, textAlign: 'center', letterSpacing: '0.35em',
                      fontFamily: 'JetBrains Mono, monospace', padding: '14px',
                    }}
                  />
                </div>

                {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  style={{
                    padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                    background: BRAND_DARK, color: '#fff', border: 'none', cursor: 'pointer',
                    opacity: loading || otp.length < 6 ? 0.5 : 1,
                  }}
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setError('') }}
                  style={{ fontSize: 13, color: M.muted, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Back to edit plan or promo code
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: M.faint, marginTop: 20 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: M.inkSoft, textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
