'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SiteNav } from '@/components/SiteNav'
import { ProductPreview } from '@/components/marketing/ProductPreview'
import { BRAND, BRAND_DARK, BRAND_PALE, brandLogoStyle } from '@/components/brand'
import { M, container, h2, lead, primaryBtn, ghostBtn, outlineBtn } from '@/components/marketing/marketing-theme'

const GITHUB_URL = 'https://github.com/Zizka-ai/ZizkaDB'

const MCP_CONFIG = `{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": { "ZIZKADB_API_KEY": "zizkadb_live_xxxx" }
    }
  }
}`

export default function LandingPage() {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: M.ink, background: '#fff' }}>
      <style>{`
        @media (max-width: 768px) {
          .zdb-section { padding-left: 20px !important; padding-right: 20px !important; }
          .zdb-hero-h1 { font-size: 34px !important; letter-spacing: -0.4px !important; }
          .zdb-hero-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .zdb-grid-3 { grid-template-columns: 1fr !important; }
          .zdb-grid-2 { grid-template-columns: 1fr !important; }
          .zdb-price-grid { grid-template-columns: 1fr !important; }
          .zdb-hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .zdb-hero-btns a, .zdb-hero-btns button { justify-content: center !important; }
          .zdb-footer { flex-direction: column !important; gap: 16px !important; align-items: flex-start !important; }
          .zdb-footer-links { flex-wrap: wrap !important; gap: 16px !important; }
          .zdb-dev-row { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>

      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="zdb-section zdb-hero-dark" style={{
        padding: '56px 40px 64px',
        background: M.heroBg,
        borderBottom: `1px solid ${M.heroBorder}`,
      }}>
        <div className="zdb-hero-grid" style={{
          ...container(1080),
          display: 'grid',
          gridTemplateColumns: '1fr 1.05fr',
          gap: 48,
          alignItems: 'center',
        }}>
          <div>
            <p style={{
              fontSize: 13, fontWeight: 600, color: BRAND_PALE, margin: '0 0 16px',
              letterSpacing: 0.2,
            }}>
              Production monitoring for AI agents
            </p>

            <h1 className="zdb-hero-h1" style={{
              fontSize: 44, fontWeight: 800, lineHeight: 1.08, margin: '0 0 18px',
              letterSpacing: -1.2, color: '#fff',
            }}>
              Know when your agent breaks in production — and why.
            </h1>

            <p style={{
              fontSize: 17, color: M.faint, lineHeight: 1.65, margin: '0 0 28px', maxWidth: 480,
            }}>
              ZizkaDB tracks every agent decision, flags when behavior drifts from normal,
              and shows the full trail when something goes wrong. For support bots, sales agents,
              and internal copilots.
            </p>

            <div className="zdb-hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              <Link href="/signup" style={primaryBtn}>
                Start free →
              </Link>
              <Link href="/docs" style={ghostBtn}>
                See how it works
              </Link>
            </div>

            <p style={{ fontSize: 13, color: '#525252', margin: 0 }}>
              Managed cloud · Self-host free ·{' '}
              <Link href="/docs" style={{ color: BRAND_PALE, textDecoration: 'none', fontWeight: 500 }}>
                MCP &amp; SDK for developers
              </Link>
            </p>
          </div>

          <ProductPreview />
        </div>
      </section>

      {/* ── Scenarios ──────────────────────────────────────────────────── */}
      <section className="zdb-section" style={{ padding: '72px 40px', background: M.wash, borderBottom: `1px solid ${M.line}` }}>
        <div style={container(960)}>
          <h2 style={h2}>When agents fail, this is what you need</h2>
          <p style={lead}>
            Not another trace dump. Three production moments teams actually hit.
          </p>

          <div className="zdb-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                title: 'Quality dropped after v2',
                pain: 'No errors in logs. Answers get worse. A user complains days later.',
                fix: 'Baseline compares new sessions to history — see where v2 diverged.',
                accent: true,
              },
              {
                title: 'Wrong answer this session',
                pain: 'The agent said something incorrect. You cannot see what it relied on.',
                fix: 'Open the decision trail from output back to the original user message.',
              },
              {
                title: 'Complaint from last Tuesday',
                pain: 'A customer says the bot misquoted policy three days ago.',
                fix: 'Replay what the agent logged at that exact time.',
              },
            ].map((s, i) => (
              <div
                key={s.title}
                style={{
                  background: '#fff', borderRadius: 12, padding: '26px 22px',
                  border: s.accent ? `2px solid ${BRAND}` : `1px solid ${M.line}`,
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 700, color: s.accent ? BRAND : M.muted,
                  letterSpacing: 0.8, marginBottom: 12,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, lineHeight: 1.35 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: M.inkSoft, lineHeight: 1.6, marginBottom: 14 }}>{s.pain}</div>
                <div style={{ fontSize: 14, color: BRAND_DARK, lineHeight: 1.55, fontWeight: 500 }}>{s.fix}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="zdb-section" style={{ padding: '72px 40px', background: '#fff' }}>
        <div style={container(880)}>
          <h2 style={h2}>Up and running in minutes</h2>
          <p style={lead}>No infra project. Log decisions, watch the dashboard, investigate when something shifts.</p>

          <div className="zdb-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { step: '1', title: 'Connect', body: 'Sign up at db.zizka.ai or self-host with Docker. Create an agent, copy your API key.' },
              { step: '2', title: 'Log decisions', body: 'Record what your agent does — messages, tool calls, outputs — from your app, SDK, or Cursor MCP.' },
              { step: '3', title: 'Catch drift early', body: 'Dashboard shows agents, session history, drift scores, and the full chain behind any bad answer.' },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center', padding: '0 8px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, margin: '0 auto 16px',
                  background: M.slateBg, border: `1px solid ${M.slateBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: M.ink,
                }}>
                  {item.step}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: M.inkSoft, lineHeight: 1.6 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Without / With ─────────────────────────────────────────────── */}
      <section className="zdb-section" style={{ padding: '56px 40px', background: M.wash, borderTop: `1px solid ${M.line}` }}>
        <div style={container(820)}>
          <div className="zdb-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', border: `1px solid ${M.line}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: M.muted, letterSpacing: 0.6, marginBottom: 16 }}>WITHOUT ZIZKADB</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'User complains before you notice anything wrong',
                  '"Why did it say that?" — no clear answer',
                  'New prompt version regresses silently',
                ].map(t => (
                  <li key={t} style={{ fontSize: 14, color: M.inkSoft, lineHeight: 1.5, paddingLeft: 16, borderLeft: `3px solid ${M.line}` }}>{t}</li>
                ))}
              </ul>
            </div>
            <div style={{
              background: '#fff', borderRadius: 12, padding: '28px 24px',
              border: `2px solid ${BRAND}`, boxShadow: '0 4px 24px rgba(249,115,22,0.08)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BRAND, letterSpacing: 0.6, marginBottom: 16 }}>WITH ZIZKADB</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Drift score flags when behavior changes',
                  'Decision trail from any bad output to root cause',
                  'Replay agent state at any past moment',
                ].map(t => (
                  <li key={t} style={{ fontSize: 14, color: M.ink, lineHeight: 1.5, paddingLeft: 16, borderLeft: `3px solid ${BRAND}` }}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Developers (compact) ─────────────────────────────────────────── */}
      <section id="developers" className="zdb-section" style={{ padding: '56px 40px', background: '#fff', borderTop: `1px solid ${M.line}` }}>
        <div style={{ ...container(820), textAlign: 'center' }}>
          <h2 style={{ ...h2, fontSize: 22 }}>For developers</h2>
          <p style={{ ...lead, marginBottom: 28, fontSize: 15 }}>
            Python, TypeScript, MCP, REST — same product. Full docs and comparison table on{' '}
            <Link href="/trust" style={{ color: BRAND_DARK, fontWeight: 500 }}>/trust</Link>.
          </p>
          <div className="zdb-dev-row" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/docs" style={outlineBtn}>Documentation →</Link>
            <button
              type="button"
              onClick={() => copy(MCP_CONFIG, 'mcp')}
              style={{ ...outlineBtn, cursor: 'pointer', background: M.ink, color: '#fff', border: 'none' }}
            >
              {copied === 'mcp' ? '✓ Copied MCP config' : 'Copy Cursor MCP config'}
            </button>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" style={outlineBtn}>
              GitHub · self-host ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="zdb-section" style={{ padding: '72px 40px', background: M.wash }}>
        <div style={container(900)}>
          <h2 style={h2}>Pricing</h2>
          <p style={lead}>Drift detection and decision history on every plan.</p>
          <div className="zdb-price-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {([
              {
                name: 'Self-Hosted', price: 'Free', sub: 'forever',
                features: ['Full feature set', 'Your infra', 'Docker Compose', 'Community support'],
                cta: 'Setup guide →', href: '/docs', highlight: false,
              },
              {
                name: 'Pro', price: '€39', sub: 'per month',
                features: ['100M events', '90-day retention', '3 projects', 'Platform embeddings', 'Email support'],
                cta: 'Start free trial →', href: '/signup', highlight: true,
                note: 'No credit card needed',
              },
              {
                name: 'Team', price: '€99', sub: 'per month',
                features: ['Up to 1B events/mo', '1-year retention', '10 seats', 'Platform embeddings', 'Priority support'],
                cta: 'Start free trial →', href: '/signup', highlight: false,
                note: 'No credit card needed',
              },
            ] as { name: string; price: string; sub: string; features: string[]; cta: string; href: string; highlight: boolean; note?: string }[]).map(plan => (
              <div key={plan.name} style={{
                background: '#fff', borderRadius: 12, padding: '28px 24px',
                border: plan.highlight ? `2px solid ${BRAND}` : `1px solid ${M.line}`,
                position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    background: BRAND, color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 100,
                  }}>
                    POPULAR
                  </div>
                )}
                <div style={{ fontSize: 11, fontWeight: 700, color: M.muted, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                  <span style={{ fontSize: 32, fontWeight: 800 }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: M.muted }}>{plan.sub}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: 13.5, color: M.inkSoft, display: 'flex', gap: 8 }}>
                      <span style={{ color: BRAND_DARK, fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  display: 'block', textAlign: 'center', padding: '10px', borderRadius: 8,
                  textDecoration: 'none', fontWeight: 600, fontSize: 14,
                  background: plan.highlight ? BRAND : '#fff',
                  color: plan.highlight ? '#fff' : M.ink,
                  border: plan.highlight ? 'none' : `1px solid ${M.line}`,
                }}>
                  {plan.cta}
                </Link>
                {plan.note && (
                  <p style={{ textAlign: 'center', fontSize: 11, color: M.muted, marginTop: 8, marginBottom: 0 }}>{plan.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="zdb-section" style={{
        padding: '72px 40px',
        background: M.heroBg,
        borderTop: `1px solid ${M.heroBorder}`,
      }}>
        <div style={{ ...container(640), textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: -0.6, lineHeight: 1.15 }}>
            Stop guessing why your agent failed.
          </h2>
          <p style={{ fontSize: 16, color: M.faint, margin: '0 0 28px', lineHeight: 1.6 }}>
            Start free on db.zizka.ai — or self-host in one command. No credit card for trial.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={primaryBtn}>Start free →</Link>
            <Link href="/docs" style={ghostBtn}>Read the docs</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="zdb-footer" style={{
        borderTop: `1px solid ${M.line}`, padding: '28px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 13, color: M.muted,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...brandLogoStyle, width: 22, height: 22, borderRadius: 5 }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>Z</span>
          </div>
          <span style={{ fontWeight: 600, color: M.ink }}>ZizkaDB</span>
          <span style={{ color: '#ddd' }}>·</span>
          <span>by Zizka AI</span>
        </div>
        <div className="zdb-footer-links" style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          {[['Docs', '/docs'], ['Pricing', '#pricing'], ['For engineers', '/trust'], ['GitHub', GITHUB_URL], ['Community', '/community'], ['Sign in', '/login']].map(([l, h]) => (
            h.startsWith('http') ? (
              <a key={l} href={h} target="_blank" rel="noreferrer" style={{ color: M.muted, textDecoration: 'none' }}>{l}</a>
            ) : (
              <Link key={l} href={h} style={{ color: M.muted, textDecoration: 'none' }}>{l}</Link>
            )
          ))}
          <Link href="/signup" style={{ color: M.ink, fontWeight: 600, textDecoration: 'none' }}>Start free →</Link>
        </div>
      </footer>
    </div>
  )
}
