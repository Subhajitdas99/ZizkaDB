'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SiteNav } from '@/components/SiteNav'
import { BRAND, BRAND_DARK, brandLogoStyle } from '@/components/brand'
import { M, container, primaryBtn, ghostBtn } from '@/components/marketing/marketing-theme'
import { STATION_F_CODE, stationFPlans } from '@/components/marketing/StationFOffer'

export default function StationFOfferPage() {
  const [plan, setPlan] = useState<'pro' | 'team'>('pro')

  const signupHref = `/signup?promo=${STATION_F_CODE}&plan=${plan}`

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: M.ink, background: M.wash, minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .sf-hero { padding: 48px 20px 40px !important; }
          .sf-grid { grid-template-columns: 1fr !important; }
          .sf-steps { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <SiteNav suffix="Station F offer" />

      {/* Hero */}
      <section className="sf-hero" style={{
        padding: '64px 40px 48px',
        background: M.heroBg,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: M.heroGlowBlue, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: M.heroGlowOrange, pointerEvents: 'none' }} />

        <div style={{ ...container(820), position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 100, marginBottom: 20,
            background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.4)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#93c5fd', letterSpacing: 0.6 }}>
              STATION F STARTUP OFFER
            </span>
          </div>

          <h1 style={{
            fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1.1,
            letterSpacing: -1, margin: '0 0 16px',
          }}>
            6 months of ZizkaDB API access, free
          </h1>

          <p style={{ fontSize: 18, color: '#cbd5e1', lineHeight: 1.65, maxWidth: 560, margin: '0 auto 28px' }}>
            Monitor agent behavior in production, catch drift early, and replay any session.
            Built for Station F startups shipping AI agents to customers.
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '14px 22px', borderRadius: 14,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)',
            marginBottom: 28,
          }}>
            <span style={{ fontSize: 14, color: '#94a3b8' }}>Your code</span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 800,
              color: '#fff', letterSpacing: 4,
            }}>
              {STATION_F_CODE}
            </span>
          </div>

          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Valid on managed cloud Pro and Team plans. No credit card required.
          </p>
        </div>
      </section>

      {/* Plan picker */}
      <section style={{ padding: '48px 40px 32px' }}>
        <div style={container(880)}>
          <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', margin: '0 0 8px', color: M.ink }}>
            Choose your plan
          </h2>
          <p style={{ textAlign: 'center', color: M.muted, fontSize: 15, margin: '0 0 28px' }}>
            Both plans include full API access, behavior monitoring, and the dashboard for 6 months.
          </p>

          <div className="sf-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {stationFPlans.map(p => {
              const selected = plan === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  style={{
                    textAlign: 'left', cursor: 'pointer',
                    borderRadius: 16, padding: '26px 24px',
                    background: p.bg,
                    border: selected ? `3px solid ${p.accent}` : `1px solid ${M.line}`,
                    boxShadow: selected ? `0 12px 40px ${p.accent}22` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: M.ink }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: M.muted, marginTop: 4 }}>{p.subtitle}</div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: `2px solid ${selected ? p.accent : M.line}`,
                      background: selected ? p.accent : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 12, fontWeight: 800,
                    }}>
                      {selected ? '✓' : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: M.inkSoft, marginBottom: 14 }}>
                    <span style={{ textDecoration: 'line-through', color: M.faint, marginRight: 8 }}>{p.price}/mo</span>
                    <span style={{ fontWeight: 800, color: p.accent }}>€0 for 6 months</span>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {p.features.map(f => (
                      <li key={f} style={{ fontSize: 13, color: M.inkSoft, display: 'flex', gap: 8 }}>
                        <span style={{ color: p.accent, fontWeight: 800 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href={signupHref} style={{ ...primaryBtn, fontSize: 16, padding: '16px 36px' }}>
              Continue to signup with {STATION_F_CODE}
            </Link>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section style={{ padding: '24px 40px 56px', background: '#fff', borderTop: `1px solid ${M.line}` }}>
        <div style={container(760)}>
          <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', margin: '0 0 28px' }}>
            What is included
          </h2>
          <div className="sf-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { n: '1', title: 'Full API access', body: 'Log agent decisions, search history, detect drift, and replay sessions from day one.', color: M.blue },
              { n: '2', title: 'Production dashboard', body: 'See all agents, drift scores, and investigation tools without building your own UI.', color: BRAND_DARK },
              { n: '3', title: '6 months free', body: 'Apply code SF180 at signup. Your selected plan stays active until the trial ends.', color: M.teal },
            ].map(s => (
              <div key={s.n} style={{ padding: '20px 18px', borderRadius: 12, background: M.wash, border: `1px solid ${M.line}` }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: s.color, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14, marginBottom: 12,
                }}>
                  {s.n}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: M.inkSoft, lineHeight: 1.6 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{
        padding: '48px 40px',
        background: `linear-gradient(135deg, ${M.blueDark} 0%, #1e1b4b 55%, ${BRAND_DARK} 100%)`,
        textAlign: 'center',
      }}>
        <div style={container(560)}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
            Ready to monitor your agents?
          </h2>
          <p style={{ fontSize: 15, color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.6 }}>
            Create your account, enter code {STATION_F_CODE}, and start logging within minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={signupHref} style={primaryBtn}>Sign up with {STATION_F_CODE}</Link>
            <Link href="/docs" style={ghostBtn}>Technical documentation</Link>
          </div>
        </div>
      </section>

      <footer style={{
        padding: '24px 20px', borderTop: `1px solid ${M.line}`, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        fontSize: 13, color: M.muted,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...brandLogoStyle, width: 22, height: 22, borderRadius: 5 }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>Z</span>
          </div>
          <span style={{ fontWeight: 700, color: M.ink }}>ZizkaDB</span>
        </div>
        <Link href="/" style={{ color: M.muted, textDecoration: 'none' }}>Back to homepage</Link>
      </footer>
    </div>
  )
}
