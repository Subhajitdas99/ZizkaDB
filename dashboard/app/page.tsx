'use client'

import Link from 'next/link'
import { useState } from 'react'

const CODE_DEMO = `from agentdb import AgentDB

db = AgentDB("agdb_live_xxxx")

# Log what your agent does
msg = await db.log(agent="support-bot",
    event="user_message",
    data={"text": "why is my bill $200?"})

tool = await db.log(agent="support-bot",
    event="tool_call",
    data={"tool": "get_billing", "user": 123},
    parent_id=msg.event_id)   # ← causal link

await db.log(agent="support-bot",
    event="agent_response",
    data={"text": "Found an anomaly in your account"},
    parent_id=tool.event_id)

# Now ask WHY the agent responded that way
chain = await db.why(tool.event_id)
chain.print()`

const CHAIN_OUTPUT = `user_message: "why is my bill $200?"       [14:32:01]
  └── tool_call: get_billing(user=123)      [14:32:02]
      └── agent_response: "Found anomaly"   [14:32:03]

3 events · 1 causal chain · 0.3ms`

export default function LandingPage() {
  const [copied, setCopied] = useState(false)

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111', background: '#fff' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 60, borderBottom: '1px solid #f0f0f0',
        position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>A</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>AgentDB</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[['Docs', '/docs'], ['Pricing', '#pricing']].map(([label, href]) => (
            <Link key={label} href={href}
              style={{ fontSize: 14, color: '#555', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
          <Link href="/login" style={{
            fontSize: 14, fontWeight: 500, color: '#111',
            textDecoration: 'none', padding: '7px 16px',
            border: '1px solid #ddd', borderRadius: 8,
          }}>
            Sign in
          </Link>
          <Link href="/signup" style={{
            fontSize: 14, fontWeight: 500, color: '#fff',
            textDecoration: 'none', padding: '7px 16px',
            background: '#111', borderRadius: 8,
          }}>
            Get started →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '100px 40px 80px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#f5f5f5', borderRadius: 100, padding: '5px 14px',
          fontSize: 13, color: '#555', marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Now live — agentdb.zizka.ai
        </div>

        <h1 style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, margin: '0 0 24px', letterSpacing: -1.5 }}>
          Why did your agent<br />
          <span style={{ color: '#888' }}>do that?</span>
        </h1>

        <p style={{ fontSize: 18, color: '#555', lineHeight: 1.7, margin: '0 0 40px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          AgentDB is a database built for AI agents. It stores every decision,
          links causes to effects, and lets you search or replay anything your agent did.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            padding: '12px 28px', background: '#111', color: '#fff',
            borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 15,
          }}>
            Get started free →
          </Link>
          <Link href="/docs" style={{
            padding: '12px 28px', background: '#fff', color: '#111',
            borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 15,
            border: '1px solid #ddd',
          }}>
            Self-host in 60 seconds
          </Link>
        </div>

        <p style={{ fontSize: 13, color: '#aaa', marginTop: 16 }}>
          Free tier · No credit card · Self-hostable
        </p>
      </section>

      {/* Code demo */}
      <section style={{ padding: '0 40px 100px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          border: '1px solid #e5e5e5', borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
        }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #e5e5e5',
          }}>
            {['#ff5f57', '#febc2e', '#28c840'].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
            <span style={{ marginLeft: 8, fontSize: 12, color: '#999', fontFamily: 'monospace' }}>
              quickstart.py
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {/* Code */}
            <div style={{ position: 'relative', borderRight: '1px solid #e5e5e5' }}>
              <button
                onClick={() => copy(CODE_DEMO)}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: '#f0f0f0', border: 'none', borderRadius: 6,
                  padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#555',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <pre style={{
                margin: 0, padding: '24px', fontSize: 12.5, lineHeight: 1.7,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                background: '#fafafa', color: '#333', overflow: 'auto',
                minHeight: 320,
              }}>
                {CODE_DEMO}
              </pre>
            </div>

            {/* Output */}
            <div style={{ background: '#111', padding: 24 }}>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 12, fontFamily: 'monospace' }}>
                OUTPUT
              </div>
              <pre style={{
                margin: 0, fontSize: 12.5, lineHeight: 1.8,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                color: '#22c55e', whiteSpace: 'pre-wrap',
              }}>
                {CHAIN_OUTPUT}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>
            What vector databases cannot do
          </h2>
          <p style={{ textAlign: 'center', color: '#777', fontSize: 16, marginBottom: 60 }}>
            Vector databases store embeddings. AgentDB stores what your agent did, why it did it, and what happened next.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                icon: '🔍',
                title: 'Causal Lineage',
                desc: 'See the full chain of events behind any agent decision. Trace back from any output to the exact input that triggered it.',
              },
              {
                icon: '⏪',
                title: 'Time Travel',
                desc: "Reconstruct your agent's exact state at any past moment. Useful for debugging what went wrong at a specific time.",
              },
              {
                icon: '🧠',
                title: 'Semantic Search',
                desc: 'Search agent history with plain text. Query across thousands of events without knowing the exact keywords.',
              },
              {
                icon: '🚨',
                title: 'Drift Detection',
                desc: 'Get notified when an agent starts behaving differently from how it used to. Catch regressions early.',
              },
              {
                icon: '🤝',
                title: 'Agent Handoff',
                desc: 'When one agent hands off to another, pass only the relevant context. No more stuffing the full history into a prompt.',
              },
              {
                icon: '📋',
                title: 'Audit Log',
                desc: 'Every event is checksummed and append-only. Export a signed audit trail at any time for compliance reviews.',
              },
            ].map(f => (
              <div key={f.title} style={{
                background: '#fff', borderRadius: 12, padding: '28px 24px',
                border: '1px solid #e5e5e5',
              }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
            How it compares
          </h2>
          <p style={{ textAlign: 'center', color: '#777', fontSize: 15, marginBottom: 12 }}>
            Facts only. Each row is verifiable in the official docs of each product.
          </p>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginBottom: 40 }}>
            Supabase (pgvector) · Pinecone · Mem0 · AgentDB — as of May 2026
          </p>

          <div style={{ border: '1px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ padding: '13px 18px', textAlign: 'left', fontWeight: 600, color: '#333', width: '36%' }}>Capability</th>
                  {['Supabase', 'Pinecone', 'Mem0', 'AgentDB'].map(h => (
                    <th key={h} style={{
                      padding: '13px 14px', textAlign: 'center', fontWeight: 600,
                      color: h === 'AgentDB' ? '#111' : '#999',
                      background: h === 'AgentDB' ? '#f8fffe' : 'transparent',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  // [capability, supabase, pinecone, mem0, agentdb]
                  ['Vector / semantic search',         '✓', '✓', '✓', '✓'],
                  ['Structured event storage (SQL)',    '✓', '✗', '✗', '✓'],
                  ['Causal lineage — ask why',          '✗', '✗', '✗', '✓'],
                  ['Time travel — state at timestamp',  '✗', '✗', '✗', '✓'],
                  ['Cross-agent shared memory',         '✗', '✗', '~', '✓'],
                  ['Behavioral drift detection',        '✗', '✗', '✗', '✓'],
                  ['Tamper-evident audit log',          '✗', '✗', '✗', '✓'],
                  ['Self-hostable (free)',               '✓', '✗', '✓', '✓'],
                  ['Built specifically for AI agents',  '✗', '✗', '~', '✓'],
                ].map(([cap, ...vals], i) => (
                  <tr key={cap} style={{ borderBottom: i < 8 ? '1px solid #f0f0f0' : 'none' }}>
                    <td style={{ padding: '12px 18px', color: '#444', fontSize: 13.5 }}>{cap}</td>
                    {vals.map((v, j) => (
                      <td key={j} style={{
                        padding: '12px 14px', textAlign: 'center',
                        color: v === '✓' ? (j === 3 ? '#16a34a' : '#aaa')
                             : v === '~' ? '#f59e0b'
                             : '#ddd',
                        fontWeight: j === 3 && v === '✓' ? 700 : 400,
                        background: j === 3 ? '#f8fffe' : 'transparent',
                        fontSize: 15,
                      }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#ccc', marginTop: 12 }}>
            ~ = partial support &nbsp;·&nbsp; ✓ = full support &nbsp;·&nbsp; ✗ = not supported
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>
            Pricing
          </h2>
          <p style={{ textAlign: 'center', color: '#777', fontSize: 16, marginBottom: 48 }}>
            Self-host for free forever. Pay for managed hosting when you need it.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                name: 'Self-Hosted',
                price: 'Free',
                sub: 'forever',
                features: ['Full feature set', 'Run on your infra', 'Docker in 60 seconds', 'Community support'],
                cta: 'View docs →',
                href: '/docs',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$49',
                sub: 'per month',
                features: ['100M events stored', '90-day retention', '3 projects', 'Email support'],
                cta: 'Get started →',
                href: '/signup',
                highlight: true,
              },
              {
                name: 'Team',
                price: '$149',
                sub: 'per month',
                features: ['1B events stored', '1-year retention', '10 seats', 'Priority support'],
                cta: 'Get started →',
                href: '/signup',
                highlight: false,
              },
            ].map(plan => (
              <div key={plan.name} style={{
                background: '#fff', borderRadius: 14, padding: '32px 28px',
                border: plan.highlight ? '2px solid #111' : '1px solid #e5e5e5',
                position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#111', color: '#fff', fontSize: 11, fontWeight: 600,
                    padding: '3px 12px', borderRadius: 100,
                  }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 700 }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: '#888' }}>{plan.sub}</span>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', margin: '20px 0' }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: 14, color: '#444', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  display: 'block', textAlign: 'center', padding: '11px',
                  borderRadius: 9, textDecoration: 'none', fontWeight: 500, fontSize: 14,
                  background: plan.highlight ? '#111' : '#fff',
                  color: plan.highlight ? '#fff' : '#111',
                  border: plan.highlight ? 'none' : '1px solid #ddd',
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Self-host CTA */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto', textAlign: 'center',
          background: '#111', borderRadius: 20, padding: '60px 40px',
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 16, letterSpacing: -0.5 }}>
            Run it on your own server
          </h2>
          <p style={{ color: '#888', fontSize: 16, marginBottom: 32 }}>
            Full feature set. No account needed. No usage limits. Free forever.
          </p>
          <div style={{
            background: '#1a1a1a', borderRadius: 10, padding: '16px 20px',
            fontFamily: 'monospace', fontSize: 13, color: '#22c55e',
            textAlign: 'left', marginBottom: 28, lineHeight: 1.8,
          }}>
            <div><span style={{ color: '#555' }}>$ </span>git clone https://github.com/Zizka-ai/agentdb</div>
            <div><span style={{ color: '#555' }}>$ </span>cp .env.example .env &amp;&amp; nano .env</div>
            <div><span style={{ color: '#555' }}>$ </span>docker-compose -f infra/docker-compose.yml up</div>
          </div>
          <Link href="/docs" style={{
            padding: '12px 28px', background: '#fff', color: '#111',
            borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 15,
          }}>
            View self-host guide →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #f0f0f0', padding: '32px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 13, color: '#999',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 5, background: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>A</span>
          </div>
          <span style={{ fontWeight: 500, color: '#333' }}>AgentDB</span>
          <span style={{ color: '#ddd' }}>·</span>
          <span>by Zizka AI</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Docs', '/docs'], ['Pricing', '#pricing'], ['Login', '/login']].map(([l, h]) => (
            <Link key={l} href={h} style={{ color: '#999', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
