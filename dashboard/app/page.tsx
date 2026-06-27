'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SiteNav } from '@/components/SiteNav'
import { ProductPreview } from '@/components/marketing/ProductPreview'
import { BRAND, BRAND_DARK, BRAND_LIGHT, brandLogoStyle } from '@/components/brand'
import { M, container, h2, lead, primaryBtn, blueBtn, ghostBtn, outlineBtn } from '@/components/marketing/marketing-theme'

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
          .zdb-hero-h1 { font-size: 32px !important; }
          .zdb-hero-top { grid-template-columns: 1fr !important; }
          .zdb-grid-3 { grid-template-columns: 1fr !important; }
          .zdb-grid-2 { grid-template-columns: 1fr !important; }
          .zdb-price-grid { grid-template-columns: 1fr !important; }
          .zdb-pillar-grid { grid-template-columns: 1fr !important; }
          .zdb-hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .zdb-hero-btns a, .zdb-hero-btns button { justify-content: center !important; }
          .zdb-footer { flex-direction: column !important; gap: 16px !important; align-items: flex-start !important; }
          .zdb-footer-links { flex-wrap: wrap !important; gap: 16px !important; }
          .zdb-tech-row { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>

      <SiteNav />

      {/* Hero */}
      <section className="zdb-section" style={{
        padding: '48px 40px 56px',
        background: M.heroBg,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: M.heroGlowOrange, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: M.heroGlowBlue, pointerEvents: 'none' }} />

        <div style={{ ...container(1100), position: 'relative', zIndex: 1 }}>
          <div className="zdb-hero-top" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
            alignItems: 'center',
            marginBottom: 36,
          }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 100, marginBottom: 18,
                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: M.blueLight }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#93c5fd' }}>
                  Operational database for AI agents
                </span>
              </div>

              <h1 className="zdb-hero-h1" style={{
                fontSize: 46, fontWeight: 800, lineHeight: 1.08, margin: '0 0 16px',
                letterSpacing: -1.3, color: '#fff',
              }}>
                Agent behavior monitoring for teams running AI in production
              </h1>

              <p style={{ fontSize: 18, color: '#cbd5e1', lineHeight: 1.65, margin: '0 0 24px', maxWidth: 500 }}>
                ZizkaDB records what your agents do, alerts you when behavior shifts,
                and lets you replay any conversation to see exactly what happened.
              </p>

              <div className="zdb-hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/signup" style={primaryBtn}>Start free</Link>
                <Link href="#how" style={ghostBtn}>See how it works</Link>
              </div>
            </div>

            <ProductPreview />
          </div>
        </div>
      </section>

      {/* What / Does / Outcome — 30-second scan */}
      <section style={{
        padding: '0 40px', marginTop: -28, position: 'relative', zIndex: 2,
      }}>
        <div className="zdb-pillar-grid" style={{
          ...container(1000),
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {[
            {
              label: 'What it is',
              title: 'Operational database',
              body: 'A dedicated store for agent decisions: every message, tool call, and output your bots produce in production.',
              bg: M.bluePale,
              border: '#93c5fd',
              accent: M.blue,
            },
            {
              label: 'What it does',
              title: 'Behavior monitoring',
              body: 'Compares live agent behavior to its baseline and flags drift before customers notice quality slipping.',
              bg: '#fff7ed',
              border: BRAND,
              accent: BRAND_DARK,
            },
            {
              label: 'What you get',
              title: 'Clear answers fast',
              body: 'When something goes wrong, replay the full session and trace the bad answer back to the root cause.',
              bg: M.tealPale,
              border: '#5eead4',
              accent: M.teal,
            },
          ].map(p => (
            <div key={p.label} style={{
              background: p.bg, borderRadius: 14, padding: '22px 20px',
              border: `2px solid ${p.border}`,
              boxShadow: '0 8px 32px rgba(15,23,42,0.08)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: p.accent, letterSpacing: 0.6, marginBottom: 8, textTransform: 'uppercase' }}>
                {p.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: M.ink, marginBottom: 8 }}>{p.title}</div>
              <div style={{ fontSize: 14, color: M.inkSoft, lineHeight: 1.6 }}>{p.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Business use cases */}
      <section className="zdb-section" style={{ padding: '80px 40px 72px', background: '#fff' }}>
        <div style={container(980)}>
          <h2 style={h2}>Built for real business problems</h2>
          <p style={lead}>
            Support, sales, and internal teams use ZizkaDB when agent quality directly affects revenue and trust.
          </p>

          <div className="zdb-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                team: 'Customer support',
                scenario: 'Your support bot starts giving wrong refund answers after a prompt update.',
                outcome: 'Drift alert fires the same day. You see exactly which answers changed and roll back before ticket volume spikes.',
                color: M.blue,
                bg: M.bluePale,
              },
              {
                team: 'Sales & success',
                scenario: 'A prospect says your demo agent misquoted pricing last week.',
                outcome: 'Replay that session. Show what the agent said, what data it used, and fix the gap in minutes.',
                color: BRAND_DARK,
                bg: '#fff7ed',
              },
              {
                team: 'Internal ops',
                scenario: 'Your internal copilot quietly starts skipping policy checks.',
                outcome: 'Behavior monitoring catches the pattern. Compliance reviews the decision trail without digging through logs.',
                color: M.teal,
                bg: M.tealPale,
              },
            ].map(c => (
              <div key={c.team} style={{
                borderRadius: 14, padding: '26px 22px', background: c.bg,
                border: `1px solid ${c.color}33`,
              }}>
                <div style={{
                  fontSize: 12, fontWeight: 800, color: c.color,
                  marginBottom: 14, padding: '4px 10px', borderRadius: 100,
                  background: '#fff', display: 'inline-block',
                }}>
                  {c.team}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: M.ink, marginBottom: 12, lineHeight: 1.45 }}>
                  {c.scenario}
                </div>
                <div style={{ fontSize: 14, color: M.inkSoft, lineHeight: 1.65, paddingLeft: 14, borderLeft: `3px solid ${c.color}` }}>
                  {c.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="zdb-section" style={{
        padding: '72px 40px',
        background: `linear-gradient(180deg, ${M.wash} 0%, #fff 100%)`,
        borderTop: `1px solid ${M.line}`,
        borderBottom: `1px solid ${M.line}`,
      }}>
        <div style={container(900)}>
          <h2 style={h2}>How it works</h2>
          <p style={lead}>Three steps. No infrastructure project. Your engineering team connects in an afternoon.</p>

          <div className="zdb-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                step: '1',
                title: 'Connect your agents',
                body: 'Create a project on db.zizka.ai or self-host. Add one API key per agent.',
                color: M.blue,
                bg: M.bluePale,
              },
              {
                step: '2',
                title: 'Record production activity',
                body: 'Every customer conversation, tool call, and response is stored automatically.',
                color: BRAND_DARK,
                bg: '#fff7ed',
              },
              {
                step: '3',
                title: 'Monitor and investigate',
                body: 'Dashboard shows drift scores, agent health, and full session replays when you need answers.',
                color: M.teal,
                bg: M.tealPale,
              },
            ].map(item => (
              <div key={item.step} style={{
                textAlign: 'center', padding: '28px 20px', borderRadius: 14,
                background: item.bg, border: `1px solid ${item.color}22`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, margin: '0 auto 16px',
                  background: item.color, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800,
                  boxShadow: `0 4px 16px ${item.color}44`,
                }}>
                  {item.step}
                </div>
                <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 10, color: M.ink }}>{item.title}</div>
                <div style={{ fontSize: 14, color: M.inkSoft, lineHeight: 1.65 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="zdb-section" style={{ padding: '64px 40px', background: '#fff' }}>
        <div style={container(820)}>
          <div className="zdb-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{
              background: M.wash, borderRadius: 14, padding: '28px 24px',
              border: `1px solid ${M.line}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: M.muted, letterSpacing: 0.6, marginBottom: 16 }}>
                WITHOUT A SYSTEM OF RECORD
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Quality drops silently after every prompt change',
                  'Customer complaints are your first signal something broke',
                  'No one can explain why the agent said what it said',
                ].map(t => (
                  <li key={t} style={{ fontSize: 14, color: M.inkSoft, lineHeight: 1.55, paddingLeft: 16, borderLeft: `3px solid ${M.line}` }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #fff7ed 100%)',
              borderRadius: 14, padding: '28px 24px',
              border: `2px solid ${M.blue}`,
              boxShadow: '0 8px 32px rgba(37,99,235,0.1)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: M.blue, letterSpacing: 0.6, marginBottom: 16 }}>
                WITH ZIZKADB
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Drift alerts when agent behavior changes',
                  'Full decision history for every production session',
                  'Replay and root-cause any bad answer in minutes',
                ].map(t => (
                  <li key={t} style={{ fontSize: 14, color: M.ink, lineHeight: 1.55, paddingLeft: 16, borderLeft: `3px solid ${BRAND}` }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technical — for engineers */}
      <section id="developers" className="zdb-section" style={{
        padding: '56px 40px',
        background: `linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)`,
      }}>
        <div style={{ ...container(820), textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: 0.8,
            color: '#93c5fd', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
            padding: '5px 12px', borderRadius: 100, marginBottom: 16,
          }}>
            FOR ENGINEERING TEAMS
          </div>
          <h2 style={{ ...h2, color: '#fff', fontSize: 26 }}>Technical docs and integrations</h2>
          <p style={{ ...lead, color: '#94a3b8', marginBottom: 28 }}>
            Python SDK, TypeScript SDK, REST API, and Cursor MCP. Self-host free or use managed cloud.
          </p>
          <div className="zdb-tech-row" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/docs" style={{ ...blueBtn, textDecoration: 'none' }}>Documentation</Link>
            <Link href="/trust" style={{ ...ghostBtn, background: 'rgba(255,255,255,0.06)' }}>Architecture &amp; trust</Link>
            <button
              type="button"
              onClick={() => copy(MCP_CONFIG, 'mcp')}
              style={{ ...ghostBtn, cursor: 'pointer', border: '1px solid rgba(249,115,22,0.4)', color: BRAND_LIGHT }}
            >
              {copied === 'mcp' ? 'Copied MCP config' : 'Copy Cursor MCP config'}
            </button>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" style={ghostBtn}>
              GitHub · self-host
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="zdb-section" style={{ padding: '72px 40px', background: M.wash }}>
        <div style={container(900)}>
          <h2 style={h2}>Pricing</h2>
          <p style={lead}>Behavior monitoring and full decision history on every plan.</p>
          <div className="zdb-price-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {([
              {
                name: 'Self-Hosted', price: 'Free', sub: 'forever',
                features: ['Full feature set', 'Your infrastructure', 'Docker Compose', 'Community support'],
                cta: 'Setup guide', href: '/docs', highlight: false, accent: M.teal,
              },
              {
                name: 'Pro', price: '€39', sub: '/ month',
                features: ['100M events', '90-day retention', '3 projects', 'Platform embeddings', 'Email support'],
                cta: 'Start free trial', href: '/signup', highlight: true, accent: BRAND,
                note: 'No credit card needed',
              },
              {
                name: 'Team', price: '€99', sub: '/ month',
                features: ['Up to 1B events/mo', '1-year retention', '10 seats', 'Platform embeddings', 'Priority support'],
                cta: 'Start free trial', href: '/signup', highlight: false, accent: M.blue,
                note: 'No credit card needed',
              },
            ] as { name: string; price: string; sub: string; features: string[]; cta: string; href: string; highlight: boolean; accent: string; note?: string }[]).map(plan => (
              <div key={plan.name} style={{
                background: '#fff', borderRadius: 14, padding: '28px 24px',
                border: plan.highlight ? `2px solid ${BRAND}` : `1px solid ${M.line}`,
                position: 'relative',
                boxShadow: plan.highlight ? '0 12px 40px rgba(249,115,22,0.12)' : 'none',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    background: BRAND, color: '#fff', fontSize: 10, fontWeight: 800,
                    padding: '3px 12px', borderRadius: 100,
                  }}>
                    POPULAR
                  </div>
                )}
                <div style={{ fontSize: 11, fontWeight: 800, color: plan.accent, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                  <span style={{ fontSize: 34, fontWeight: 800 }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: M.muted }}>{plan.sub}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: 13.5, color: M.inkSoft, display: 'flex', gap: 8 }}>
                      <span style={{ color: plan.accent, fontWeight: 800 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  display: 'block', textAlign: 'center', padding: '11px', borderRadius: 10,
                  textDecoration: 'none', fontWeight: 700, fontSize: 14,
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

      {/* Final CTA */}
      <section className="zdb-section" style={{
        padding: '72px 40px',
        background: M.heroBg,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: M.heroGlowOrange, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: M.heroGlowBlue, pointerEvents: 'none' }} />
        <div style={{ ...container(640), textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: -0.8, lineHeight: 1.15 }}>
            Run AI agents with confidence
          </h2>
          <p style={{ fontSize: 17, color: '#94a3b8', margin: '0 0 28px', lineHeight: 1.65 }}>
            Start free on db.zizka.ai. Self-host anytime. No credit card for trial.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={primaryBtn}>Start free</Link>
            <Link href="/docs" style={ghostBtn}>Read technical docs</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="zdb-footer" style={{
        borderTop: `1px solid ${M.line}`, padding: '28px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 13, color: M.muted, background: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...brandLogoStyle, width: 22, height: 22, borderRadius: 5 }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>Z</span>
          </div>
          <span style={{ fontWeight: 700, color: M.ink }}>ZizkaDB</span>
          <span style={{ color: '#cbd5e1' }}>·</span>
          <span>Operational database for AI agents</span>
        </div>
        <div className="zdb-footer-links" style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          {([
            ['Docs', '/docs'],
            ['Pricing', '#pricing'],
            ['Trust & security', '/trust'],
            ['GitHub', GITHUB_URL],
            ['Community', '/community'],
            ['Sign in', '/login'],
          ] as const).map(([label, href]) =>
            href.startsWith('http') ? (
              <a key={label} href={href} target="_blank" rel="noreferrer" style={{ color: M.muted, textDecoration: 'none' }}>{label}</a>
            ) : (
              <Link key={label} href={href} style={{ color: M.muted, textDecoration: 'none' }}>{label}</Link>
            )
          )}
          <Link href="/signup" style={{ color: BRAND_DARK, fontWeight: 700, textDecoration: 'none' }}>Start free</Link>
        </div>
      </footer>
    </div>
  )
}
