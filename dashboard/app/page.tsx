'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { SiteNav } from '@/components/SiteNav'
import { BRAND, BRAND_DARK, BRAND_LIGHT, BRAND_MUTED, BRAND_PALE, brandLogoStyle } from '@/components/brand'

// ── Live user counters ─────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://db.zizka.ai'

interface Stats { managed: number; python_sdk: number; npm_sdk: number; mcp: number }

function useAnimatedCount(target: number, duration = 800) {
  const [display, setDisplay] = useState(target)
  const prev = useRef(target)

  useEffect(() => {
    if (prev.current === target) return
    const start = prev.current
    const diff = target - start
    const startTime = performance.now()
    function step(now: number) {
      const t = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(start + diff * ease))
      if (t < 1) requestAnimationFrame(step)
      else prev.current = target
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return display
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: string }) {
  const count = useAnimatedCount(value)
  return (
    <div style={{
      flex: '1 1 160px', minWidth: 140, padding: '20px 16px', borderRadius: 14,
      border: '1px solid #e8e8e8', background: '#fff', textAlign: 'center',
      boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#111', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
        {count.toLocaleString()}+
      </div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function LiveStats() {
  const [stats, setStats] = useState<Stats>({ managed: 50, python_sdk: 50, npm_sdk: 50, mcp: 50 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${API_URL}/v1/stats`)
        if (res.ok) {
          const data = await res.json() as Stats
          setStats(data)
          setLoaded(true)
        }
      } catch { /* silently fail — floors stay */ }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="zdb-section" style={{ padding: '0 40px 72px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#bbb', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>
          Developers using ZizkaDB
        </p>
        <div className="zdb-stat-grid" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <StatBox label="Managed service" value={stats.managed}    icon="☁️" />
          <StatBox label="Python SDK"       value={stats.python_sdk} icon="🐍" />
          <StatBox label="npm SDK"          value={stats.npm_sdk}    icon="📦" />
          <StatBox label="MCP server"       value={stats.mcp}        icon="🔌" />
        </div>
        {loaded && (
          <p style={{ fontSize: 11, color: '#ccc', marginTop: 16 }}>
            Live · updates every 30s
          </p>
        )}
      </div>
    </section>
  )
}

// ── SDK snippets by language ───────────────────────────────────────────────

const SDK_TABS = ['Python', 'TypeScript', 'MCP', 'REST API'] as const
type SdkTab = typeof SDK_TABS[number]

const INSTALL: Record<SdkTab, string> = {
  Python:      'pip install zizkadb-sdk',
  TypeScript:  'npm install zizkadb-sdk',
  MCP:         'uvx zizkadb-mcp   # no install needed',
  'REST API':  'curl (no install)',
}

const SDK_SNIPPETS: Record<SdkTab, string> = {
  Python: `# pip install zizkadb-sdk
from zizkadb import ZizkaDB

async with ZizkaDB("agdb_live_xxxx") as db:  # your API key
    result = await db.log(
        agent="my-bot",
        event="tool_call",
        data={"tool": "search", "query": "pricing"},
    )

    # Why did this happen?
    chain = await db.why(result.event_id)
    chain.print()`,

  TypeScript: `import { ZizkaDB } from 'zizkadb-sdk'

const db = new ZizkaDB({ apiKey: 'agdb_live_xxxx' })

const result = await db.log({
  agent: 'my-bot',
  event: 'tool_call',
  data: { tool: 'search', query: 'pricing' },
})

// Why did this happen?
const chain = await db.why(result.eventId)
chain.print()`,

  MCP: `# uvx zizkadb-mcp  (PyPI package: zizkadb-mcp)
# Add to claude_desktop_config.json or ~/.cursor/mcp.json
{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": {
        "ZIZKADB_API_KEY": "agdb_live_xxxx"
      }
    }
  }
}

# Self-host: use "ZIZKADB_HOST": "http://localhost:8000" instead of API key
# Tools: log_event · search_memory · get_context · why · time_travel · memory_diff · forget`,

  'REST API': `# Works in Python, Go, Ruby, Rust, Java, or anything with HTTP

curl -X POST https://db.zizka.ai/v1/events \\
  -H "Authorization: Bearer agdb_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "my-bot",
    "event": "tool_call",
    "data": { "tool": "search", "query": "pricing" }
  }'

# → {"event_id":"...","timestamp":"...","checksum":"..."}`,
}

const GITHUB_URL = 'https://github.com/Zizka-ai/ZizkaDB'

const MCP_HERO_CONFIG = `{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": { "ZIZKADB_API_KEY": "agdb_live_xxxx" }
    }
  }
}`

const INSTALL_CMD = 'pip install zizkadb-sdk'

const QUICKSTART = `# pip install zizkadb-sdk
from zizkadb import ZizkaDB

async with ZizkaDB("agdb_live_xxxx") as db:  # your API key
    # 1. Log what your agent does
    msg = await db.log(agent="support-bot", event="user_message",
        data={"text": "why is my bill $200?"})

    # 2. Link every action to its cause
    tool = await db.log(agent="support-bot", event="tool_call",
        data={"tool": "get_billing", "user": 123},
        parent_id=msg.event_id)          # ← causal link

    # 3. Ask why, at any time, for any event
    chain = await db.why(tool.event_id)
    chain.print()
# user_message: "why is my bill $200?"     [14:32:01]
#   └── tool_call: get_billing(user=123)    [14:32:02]
#       └── response: "Found anomaly"       [14:32:03]`

const CLAUDE_CODE = `# pip install zizkadb-sdk anthropic
import anthropic
from zizkadb import ZizkaDB

async def run(user_input: str):
    async with ZizkaDB("agdb_live_xxxx") as db:
        client = anthropic.AsyncAnthropic()

        # Log the user turn
        turn = await db.log(
            agent="claude-3-5-sonnet",
            event="user_message",
            data={"text": user_input},
        )

        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[{"role": "user", "content": user_input}],
        )

        # Log Claude's reply, causally linked to the input
        await db.log(
            agent="claude-3-5-sonnet",
            event="assistant_response",
            data={"text": response.content[0].text},
            parent_id=turn.event_id,     # ← one line. full lineage.
        )
    return response`

const OPENAI_CODE = `# pip install zizkadb-sdk openai
from openai import AsyncOpenAI
from zizkadb import ZizkaDB
import json

async def run(user_input: str):
    async with ZizkaDB("agdb_live_xxxx") as db:
        client = AsyncOpenAI()

        turn = await db.log(
            agent="gpt-4o",
            event="user_message",
            data={"text": user_input},
        )

        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": user_input}],
            tools=my_tools,
        )

        # Log every tool call with its causal parent
        for tc in response.choices[0].message.tool_calls or []:
            await db.log(
                agent="gpt-4o",
                event="tool_call",
                data={
                    "tool": tc.function.name,
                    "args": json.loads(tc.function.arguments),
                },
                parent_id=turn.event_id,  # ← causal chain preserved
            )
    return response`

export default function LandingPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'claude' | 'openai'>('claude')
  const [activeSdk, setActiveSdk] = useState<SdkTab>('MCP')

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111', background: '#fff' }}>
      <style>{`
        @media (max-width: 640px) {
          .zdb-section { padding-left: 20px !important; padding-right: 20px !important; }
          .zdb-hero-h1 { font-size: 32px !important; letter-spacing: -0.5px !important; }
          .zdb-hero-p { font-size: 15px !important; }
          .zdb-hero-dark { padding: 48px 20px 56px !important; }
          .zdb-hero-grid { grid-template-columns: 1fr !important; }
          .zdb-path-grid { grid-template-columns: 1fr !important; }
          .zdb-grid-3 { grid-template-columns: 1fr !important; }
          .zdb-grid-2 { grid-template-columns: 1fr !important; }
          .zdb-price-grid { grid-template-columns: 1fr !important; }
          .zdb-sdk-tabs { flex-wrap: wrap !important; }
          .zdb-sdk-info { flex-direction: column !important; }
          .zdb-table-wrap { overflow-x: auto !important; }
          .zdb-footer { flex-direction: column !important; gap: 16px !important; align-items: flex-start !important; }
          .zdb-footer-links { flex-wrap: wrap !important; gap: 16px !important; }
          .zdb-self-host { padding: 36px 24px !important; }
          .zdb-install-box { max-width: 100% !important; width: 100% !important; }
          .zdb-stat-grid { gap: 10px !important; }
          .zdb-hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .zdb-hero-btns a, .zdb-hero-btns button { text-align: center !important; justify-content: center !important; }
        }
      `}</style>

      <SiteNav />

      {/* Hero — MCP + open source first */}
      <section className="zdb-hero-dark" style={{
        padding: '64px 40px 72px',
        background: 'linear-gradient(165deg, #0a0a0a 0%, #111827 45%, #0f172a 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="zdb-hero-grid" style={{
          maxWidth: 1080, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center',
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {[
                { label: 'Managed cloud', style: { bg: 'rgba(249,115,22,0.2)', border: 'rgba(249,115,22,0.45)', color: BRAND_PALE } },
                { label: 'MCP server', style: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(96,165,250,0.3)', color: '#93c5fd' } },
                { label: 'Open source', style: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', color: '#d1d5db' } },
              ].map(b => (
                <span key={b.label} style={{
                  fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                  padding: '5px 12px', borderRadius: 100,
                  background: b.style.bg, border: `1px solid ${b.style.border}`, color: b.style.color,
                }}>
                  {b.label}
                </span>
              ))}
            </div>

            <h1 className="zdb-hero-h1" style={{
              fontSize: 48, fontWeight: 800, lineHeight: 1.06, margin: '0 0 20px',
              letterSpacing: -1.5, color: '#fff',
            }}>
              Your agent stops behaving<br />
              <span style={{
                background: `linear-gradient(90deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                like itself. You know first.
              </span>
            </h1>

            <p className="zdb-hero-p" style={{
              fontSize: 17, color: '#9ca3af', lineHeight: 1.65, margin: '0 0 28px', maxWidth: 480, fontWeight: 400,
            }}>
              Start on <strong style={{ color: '#e5e7eb', fontWeight: 600 }}>db.zizka.ai</strong> in minutes — or connect via MCP in Cursor, or self-host free on Docker.
            </p>

            <div className="zdb-hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              <Link href="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 24px', background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                color: '#fff', borderRadius: 12, textDecoration: 'none',
                fontWeight: 600, fontSize: 15,
                boxShadow: '0 4px 24px rgba(249,115,22,0.4)',
              }}>
                Start managed free →
              </Link>
              <button
                type="button"
                onClick={() => copy(MCP_HERO_CONFIG, 'hero-mcp')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 24px', background: 'rgba(255,255,255,0.08)',
                  color: '#fff', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                  fontWeight: 600, fontSize: 15,
                }}
              >
                {copied === 'hero-mcp' ? '✓ Copied MCP config' : 'Copy MCP config'}
              </button>
              <Link href="#pricing" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 20px', color: '#9ca3af', textDecoration: 'none',
                fontWeight: 500, fontSize: 14,
              }}>
                See pricing →
              </Link>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#6b7280' }}>
              {['Cursor', 'Claude Desktop', 'Windsurf', 'Python SDK', 'npm SDK'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: BRAND, fontSize: 10 }}>●</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* MCP config preview */}
          <div id="mcp" style={{
            background: '#0d1117', borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(249,115,22,0.25)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
                <span style={{ marginLeft: 8, fontSize: 12, color: '#8b949e', fontFamily: 'monospace' }}>
                  ~/.cursor/mcp.json
                </span>
              </div>
              <button
                type="button"
                onClick={() => copy(MCP_HERO_CONFIG, 'hero-mcp-side')}
                style={{
                  background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
                  borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: BRAND_LIGHT,
                }}
              >
                {copied === 'hero-mcp-side' ? '✓' : 'Copy'}
              </button>
            </div>
            <pre style={{
              margin: 0, padding: '20px 22px', fontSize: 12.5, lineHeight: 1.7,
              fontFamily: 'JetBrains Mono, Fira Code, monospace', color: '#e6edf3',
              overflowX: 'auto',
            }}>
              {MCP_HERO_CONFIG}
            </pre>
            <div style={{
              padding: '14px 18px', background: 'rgba(249,115,22,0.08)',
              borderTop: '1px solid rgba(249,115,22,0.15)',
              fontSize: 12.5, color: BRAND_PALE, lineHeight: 1.5,
            }}>
              Reload MCP in Cursor → ask &quot;log that we chose Postgres&quot; → it calls{' '}
              <code style={{ color: BRAND_LIGHT }}>log_event</code> natively
            </div>
          </div>
        </div>
      </section>

      {/* Three paths — managed, MCP, self-host */}
      <section className="zdb-section" style={{ padding: '56px 40px 48px', background: '#fafafa', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>
            Pick your entry point
          </p>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 36, letterSpacing: -0.5 }}>
            Three ways in. Same product.
          </h2>
          <div className="zdb-path-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {/* Managed — main service */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: '32px 28px',
              border: `2px solid ${BRAND}`, position: 'relative',
              boxShadow: '0 8px 32px rgba(249,115,22,0.12)',
            }}>
              <div style={{
                position: 'absolute', top: -11, left: 20,
                background: BRAND, color: '#fff', fontSize: 10, fontWeight: 700,
                padding: '3px 10px', borderRadius: 100, letterSpacing: 0.5,
              }}>
                RECOMMENDED — MANAGED
              </div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>☁️</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Managed at db.zizka.ai</h3>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 20 }}>
                We run Postgres, Qdrant, embeddings, and the dashboard. Sign up, get an API key, ship in under 5 minutes.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Email OTP signup — no password', 'API key from Settings', 'Pro trial — no credit card'].map(item => (
                  <li key={item} style={{ fontSize: 13.5, color: '#444', display: 'flex', gap: 8 }}>
                    <span style={{ color: BRAND, fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/signup" style={{
                  flex: 1, minWidth: 140, padding: '12px 18px', background: BRAND, color: '#fff',
                  borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14, textAlign: 'center',
                }}>
                  Start free →
                </Link>
                <Link href="#pricing" style={{
                  flex: 1, minWidth: 120, padding: '12px 18px', background: '#fff', color: '#111',
                  borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 14,
                  border: '1px solid #ddd', textAlign: 'center',
                }}>
                  Pricing →
                </Link>
              </div>
            </div>

            <div style={{
              background: '#fff', borderRadius: 16, padding: '32px 28px',
              border: '1px solid #e5e5e5',
            }}>
              <div style={{
                display: 'inline-block', marginBottom: 12,
                background: '#eff6ff', color: '#1d4ed8', fontSize: 10, fontWeight: 700,
                padding: '3px 10px', borderRadius: 100, letterSpacing: 0.5,
              }}>
                MCP — CURSOR / CLAUDE
              </div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🔌</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Connect your IDE</h3>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 20 }}>
                Paste config into Cursor or Claude Desktop. Zero app code changes.
                <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#fff7ed', padding: '2px 6px', borderRadius: 4, color: BRAND_MUTED }}> uvx zizkadb-mcp</code> runs on demand.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['30-second setup', '8 MCP tools: log, search, why, time_travel', 'Managed cloud or self-host'].map(item => (
                  <li key={item} style={{ fontSize: 13.5, color: '#444', display: 'flex', gap: 8 }}>
                    <span style={{ color: BRAND, fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => copy(MCP_HERO_CONFIG, 'path-mcp')}
                  style={{
                    flex: 1, minWidth: 140, padding: '12px 18px', background: '#111', color: '#fff',
                    border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                  }}
                >
                  {copied === 'path-mcp' ? '✓ Copied' : 'Copy MCP config'}
                </button>
                <Link href="/docs" style={{
                  flex: 1, minWidth: 120, padding: '12px 18px', background: '#fff', color: '#111',
                  borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 14,
                  border: '1px solid #ddd', textAlign: 'center',
                }}>
                  MCP guide →
                </Link>
              </div>
            </div>

            <div id="opensource" style={{
              background: '#fff', borderRadius: 16, padding: '32px 28px',
              border: '1px solid #e5e5e5',
            }}>
              <div style={{
                display: 'inline-block', marginBottom: 12,
                background: '#f3f4f6', color: '#374151', fontSize: 10, fontWeight: 700,
                padding: '3px 10px', borderRadius: 100, letterSpacing: 0.5,
              }}>
                OPEN SOURCE — AGPL
              </div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🐳</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Self-host on your server</h3>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 20 }}>
                Full stack: Postgres, Qdrant, Redis, API, dashboard. Clone from GitHub, one command, free forever.
              </p>
              <div style={{
                background: '#111', borderRadius: 10, padding: '14px 16px', marginBottom: 20,
                fontFamily: 'monospace', fontSize: 12, color: BRAND_LIGHT, lineHeight: 1.8,
              }}>
                <div><span style={{ color: '#666' }}>$ </span>git clone github.com/Zizka-ai/ZizkaDB</div>
                <div><span style={{ color: '#666' }}>$ </span>bash scripts/setup-local.sh</div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Python + TypeScript SDKs included', 'Dashboard + API key from Settings', 'MCP works against your own host'].map(item => (
                  <li key={item} style={{ fontSize: 13.5, color: '#444', display: 'flex', gap: 8 }}>
                    <span style={{ color: BRAND, fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1, minWidth: 140, padding: '12px 18px', background: '#111', color: '#fff',
                    borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14, textAlign: 'center',
                  }}
                >
                  View on GitHub ↗
                </a>
                <Link href="/docs" style={{
                  flex: 1, minWidth: 120, padding: '12px 18px', background: '#fff', color: '#111',
                  borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 14,
                  border: '1px solid #ddd', textAlign: 'center',
                }}>
                  Self-host guide →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Managed cloud — main service */}
      <section id="managed" className="zdb-section" style={{ padding: '64px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>
            Managed cloud — fastest way to start
          </h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 48, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
            Skip running Postgres, Qdrant, and Redis yourself. Sign up at db.zizka.ai, get an API key, and ship in minutes.
          </p>
          <div className="zdb-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 32 }}>
            {[
              { icon: '⚡', title: 'Live in under 5 minutes', desc: 'Email sign-up, one-time code, API key from Settings. Paste into SDK or MCP — no infra checklist.' },
              { icon: '☁️', title: 'We run the stack', desc: 'Events, search index, dashboard, and TLS at db.zizka.ai. You focus on agent logic, not ops.' },
              { icon: '📊', title: 'Dashboard included', desc: 'See agents, replay sessions, search history, and drift — same data your code logs, no extra setup.' },
              { icon: '🔑', title: 'Free trial, no card', desc: 'Pro and Team include a 1-month trial. Start logging production traffic before you commit.' },
            ].map(item => (
              <div key={item.title} style={{ background: '#fafafa', borderRadius: 12, padding: '24px 22px', border: '1px solid #e5e5e5' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13.5, color: '#444', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-block', background: '#111', borderRadius: 12, padding: '20px 28px',
              fontFamily: 'monospace', fontSize: 13, color: BRAND_LIGHT, lineHeight: 1.8, textAlign: 'left',
            }}>
              <div><span style={{ color: '#666' }}>1.</span> Sign up at db.zizka.ai/signup</div>
              <div><span style={{ color: '#666' }}>2.</span> Settings → Create API key</div>
              <div><span style={{ color: '#666' }}>3.</span> ZizkaDB(&quot;agdb_live_…&quot;) — done</div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" style={{ padding: '12px 28px', background: BRAND, color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                Start managed free →
              </Link>
              <Link href="/docs" style={{ padding: '12px 28px', background: '#fff', color: '#111', borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 15, border: '1px solid #ddd' }}>
                Setup guide
              </Link>
            </div>
            <p style={{ fontSize: 13, color: '#888', marginTop: 16 }}>
              Also available: self-host with Docker (free forever) or connect via MCP in Cursor.{' '}
              <Link href="#opensource" style={{ color: BRAND_DARK, fontWeight: 500 }}>See open source →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="zdb-section" style={{ padding: '64px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>Pricing</h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 48 }}>
            Managed plans at db.zizka.ai — or self-host free forever on your own infra.
          </p>
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
                cta: 'Start 1-month free trial →', href: '/signup', highlight: true,
                note: 'No credit card needed',
              },
              {
                name: 'Team', price: '€99', sub: 'per month',
                features: ['Up to 1B events/mo (plan limit)', '1-year retention', '10 seats', 'Platform embeddings', 'Priority support'],
                cta: 'Start 1-month free trial →', href: '/signup', highlight: false,
                note: 'No credit card needed',
              },
            ] as { name: string; price: string; sub: string; features: string[]; cta: string; href: string; highlight: boolean; note?: string }[]).map(plan => (
              <div key={plan.name} style={{
                background: '#fff', borderRadius: 14, padding: '32px 28px',
                border: plan.highlight ? `2px solid ${BRAND}` : '1px solid #e5e5e5',
                position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: BRAND, color: '#fff', fontSize: 11, fontWeight: 600,
                    padding: '3px 12px', borderRadius: 100,
                  }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 34, fontWeight: 700 }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: '#888' }}>{plan.sub}</span>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', margin: '18px 0' }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: 13.5, color: '#444', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: BRAND_DARK, fontWeight: 600 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  display: 'block', textAlign: 'center', padding: '10px',
                  borderRadius: 8, textDecoration: 'none', fontWeight: 500, fontSize: 14,
                  background: plan.highlight ? BRAND : '#fff',
                  color: plan.highlight ? '#fff' : '#111',
                  border: plan.highlight ? 'none' : '1px solid #ddd',
                }}>
                  {plan.cta}
                </Link>
                {plan.note && (
                  <div style={{ textAlign: 'center', fontSize: 11.5, color: '#888', marginTop: 8 }}>
                    {plan.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Embeddings — managed feature */}
      <section className="zdb-section" style={{ padding: '56px 40px', background: '#fff', borderTop: '1px solid #eee' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>
            Embeddings built in
          </h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 32, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            On managed ZizkaDB you choose the embedding model in Settings — no separate vector pipeline.
          </p>
          <div className="zdb-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: '🎛️', title: 'Pick your model', desc: 'text-embedding-3-small, large, or ada-002 — switch anytime.' },
              { icon: '☁️', title: 'Platform-hosted', desc: 'Included on Pro and Team — no OpenAI account required to start.' },
              { icon: '🔐', title: 'Or bring your key', desc: 'Optional: your own OpenAI key for direct billing control.' },
            ].map(item => (
              <div key={item.title} style={{ borderRadius: 12, padding: '20px 18px', border: '1px solid #e5e5e5', background: '#fafafa' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.55 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick install strip */}
      <section className="zdb-section" style={{ padding: '40px 40px 48px', maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <div className="zdb-install-box" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0, maxWidth: '100%' }}>
          <div className="zdb-sdk-tabs" style={{ display: 'flex', gap: 2, background: '#f0f0f0', borderRadius: 9, padding: 3, marginBottom: 10 }}>
            {SDK_TABS.map(t => (
              <button key={t} onClick={() => setActiveSdk(t)} style={{
                padding: '5px 12px', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                borderRadius: 7, background: activeSdk === t ? '#fff' : 'transparent',
                color: activeSdk === t ? '#111' : '#888',
                boxShadow: activeSdk === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>
                {t}
                {t === 'MCP' && (
                  <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 700, background: BRAND, color: '#fff', borderRadius: 4, padding: '1px 4px' }}>★</span>
                )}
              </button>
            ))}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, maxWidth: '100%', overflow: 'hidden',
            background: '#111', borderRadius: 10, padding: '10px 16px',
            fontFamily: 'monospace', fontSize: 13, color: BRAND_LIGHT,
          }}>
            <span style={{ color: '#666', flexShrink: 0 }}>$</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{INSTALL[activeSdk]}</span>
            <button onClick={() => copy(INSTALL[activeSdk], 'install')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', fontSize: 11, color: '#aaa', padding: '4px 10px', borderRadius: 6, flexShrink: 0 }}>
              {copied === 'install' ? '✓' : 'copy'}
            </button>
          </div>
        </div>
      </section>

      {/* Live social proof counters */}
      <LiveStats />

      {/* Works with */}
      <section className="zdb-section" style={{ padding: '0 40px 72px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#bbb', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
          Works with anything
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 760, margin: '0 auto' }}>
          {[
            { label: 'MCP Server', sub: 'uvx · Cursor' },
            { label: 'Cursor', sub: 'via MCP' },
            { label: 'Claude Desktop', sub: 'via MCP' },
            { label: 'Python SDK', sub: 'pip' },
            { label: 'TypeScript SDK', sub: 'npm' },
            { label: 'REST API', sub: 'any language' },
            { label: 'Windsurf', sub: 'via MCP' },
            { label: 'LangChain', sub: 'Python / JS' },
            { label: 'CrewAI', sub: 'Python' },
            { label: 'OpenAI Agents', sub: 'Python / JS' },
            { label: 'Self-host', sub: 'Docker · AGPL' },
            { label: 'Custom', sub: 'any stack' },
          ].map(f => (
            <div key={f.label} style={{
              padding: '6px 14px', border: '1px solid #e5e5e5', borderRadius: 8,
              fontSize: 12.5, color: '#555', background: '#fafafa',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            }}>
              <span style={{ fontWeight: 500 }}>{f.label}</span>
              <span style={{ fontSize: 10.5, color: '#bbb' }}>{f.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3 moments */}
      <section className="zdb-section" style={{ padding: '72px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>
            Three moments other tools miss
          </h2>
          <p style={{ textAlign: 'center', color: '#444', fontSize: 15, marginBottom: 56, maxWidth: 600, margin: '0 auto 56px' }}>
            LangSmith and Langfuse show you traces after you go looking. ZizkaDB watches while you sleep.
          </p>

          <div className="zdb-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                num: '01',
                title: 'v2 quietly regressed',
                pain: 'Subtle drops in quality. No errors. Eventually a user complains.',
                fix: 'ZizkaDB compares each session against the baseline. See exactly where v2 diverged.',
              },
              {
                num: '02',
                title: 'Something broke this session',
                pain: 'Wrong answer. No idea what the agent saw or why.',
                fix: 'db.why(event_id). Full causal chain back to the user message. One line.',
              },
              {
                num: '03',
                title: 'Complaint about Tuesday',
                pain: "Customer says you told them something wrong three days ago.",
                fix: 'db.at(timestamp). Reconstruct logged state at that moment. Each event checksummed.',
              },
            ].map((s, i) => (
              <div key={s.num} style={{
                background: '#fff', borderRadius: 14, padding: '28px 24px',
                border: i === 0 ? '2px solid #f97316' : '1px solid #e5e5e5',
                position: 'relative',
              }}>
                {i === 0 && (
                  <div style={{
                    position: 'absolute', top: -10, left: 18,
                    background: '#f97316', color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '2px 9px', borderRadius: 100, letterSpacing: 0.5,
                  }}>WHAT NOBODY ELSE CATCHES</div>
                )}
                <div style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? '#f97316' : '#bbb', letterSpacing: 1, marginBottom: 12 }}>{s.num}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, lineHeight: 1.4 }}>{s.title}</div>
                <div style={{ fontSize: 13.5, color: '#444', lineHeight: 1.6, marginBottom: 16 }}>{s.pain}</div>
                <div style={{ fontSize: 13.5, color: BRAND_DARK, lineHeight: 1.6, fontWeight: 500 }}>✓ {s.fix}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect your way */}
      <section className="zdb-section" style={{ padding: '72px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
            Pick a stack
          </h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 40 }}>
            Python · TypeScript · MCP · HTTP. All four are the same product.
          </p>

          {/* SDK tabs */}
          <div className="zdb-sdk-tabs" style={{ display: 'flex', gap: 2, borderBottom: '1px solid #e5e5e5', marginBottom: 0, overflowX: 'auto' }}>
            {SDK_TABS.map(t => (
              <button key={t} onClick={() => setActiveSdk(t)} style={{
                padding: '10px 22px', fontSize: 13, fontWeight: 500, border: 'none',
                background: 'none', cursor: 'pointer',
                borderBottom: activeSdk === t ? '2px solid #111' : '2px solid transparent',
                color: activeSdk === t ? '#111' : '#999', marginBottom: -1,
              }}>
                {t}
                {t === 'MCP' && (
                  <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, background: BRAND, color: '#fff', borderRadius: 4, padding: '1px 5px' }}>★ START HERE</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ border: '1px solid #e5e5e5', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
            {/* Tab header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: 12, color: '#999', fontFamily: 'monospace' }}>
                {activeSdk === 'Python' && 'quickstart.py'}
                {activeSdk === 'TypeScript' && 'quickstart.ts'}
                {activeSdk === 'MCP' && 'claude_desktop_config.json  /  ~/.cursor/mcp.json'}
                {activeSdk === 'REST API' && 'terminal'}
              </span>
              <button onClick={() => copy(SDK_SNIPPETS[activeSdk], 'sdk')} style={{
                marginLeft: 'auto', background: '#f0f0f0', border: 'none', borderRadius: 6,
                padding: '3px 10px', fontSize: 11, cursor: 'pointer', color: '#555',
              }}>
                {copied === 'sdk' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{
              margin: 0, padding: '24px', fontSize: 13, lineHeight: 1.75,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              background: '#fafafa', color: '#333', overflowX: 'auto',
            }}>
              {SDK_SNIPPETS[activeSdk]}
            </pre>
          </div>

          {/* Per-tab callouts */}
          {activeSdk === 'Python' && (
            <div className="zdb-sdk-info" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {[
                { label: 'Install', value: 'pip install zizkadb-sdk' },
                { label: 'Requires', value: 'Python 3.10+' },
                { label: 'Only dependency', value: 'httpx' },
              ].map(i => (
                <div key={i.label} style={{ flex: 1, background: '#f8f8f8', borderRadius: 10, padding: '14px 16px', border: '1px solid #ebebeb' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{i.label}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#333' }}>{i.value}</div>
                </div>
              ))}
            </div>
          )}
          {activeSdk === 'TypeScript' && (
            <div className="zdb-sdk-info" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {[
                { label: 'Install', value: 'npm install zizkadb-sdk' },
                { label: 'Works with', value: 'Node.js, Deno, Bun, Edge' },
                { label: 'Only dependency', value: 'node-fetch / fetch' },
              ].map(i => (
                <div key={i.label} style={{ flex: 1, background: '#f8f8f8', borderRadius: 10, padding: '14px 16px', border: '1px solid #ebebeb' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{i.label}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#333' }}>{i.value}</div>
                </div>
              ))}
            </div>
          )}
          {activeSdk === 'MCP' && (
            <div className="zdb-sdk-info" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {[
                { label: 'Claude Desktop', value: '~/Library/Application Support/Claude/claude_desktop_config.json' },
                { label: 'Cursor', value: '~/.cursor/mcp.json' },
                { label: 'No install needed', value: 'uvx runs it on-demand' },
              ].map(i => (
                <div key={i.label} style={{ flex: 1, background: '#f8f8f8', borderRadius: 10, padding: '14px 16px', border: '1px solid #ebebeb' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{i.label}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#333' }}>{i.value}</div>
                </div>
              ))}
            </div>
          )}
          {activeSdk === 'REST API' && (
            <div className="zdb-sdk-info" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {[
                { label: 'Base URL', value: 'https://db.zizka.ai/v1/' },
                { label: 'Auth header', value: 'Authorization: Bearer agdb_live_...' },
                { label: 'Works with', value: 'Go, Rust, Ruby, Java, PHP, any HTTP client' },
              ].map(i => (
                <div key={i.label} style={{ flex: 1, background: '#f8f8f8', borderRadius: 10, padding: '14px 16px', border: '1px solid #ebebeb' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{i.label}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#333' }}>{i.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick demo */}
      <section className="zdb-section" style={{ padding: '72px 40px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8, letterSpacing: -0.5, textAlign: 'center' }}>
            Three lines. That&apos;s it.
          </h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 36 }}>
            Log. Link with parent_id. Ask why.
          </p>
          <div style={{ border: '1px solid #e5e5e5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
              {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
              ))}
              <span style={{ marginLeft: 8, fontSize: 12, color: '#999', fontFamily: 'monospace' }}>quickstart.py</span>
              <button onClick={() => copy(QUICKSTART, 'qs')} style={{
                marginLeft: 'auto', background: '#f0f0f0', border: 'none', borderRadius: 6,
                padding: '3px 10px', fontSize: 11, cursor: 'pointer', color: '#555',
              }}>
                {copied === 'qs' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{
              margin: 0, padding: '24px', fontSize: 13, lineHeight: 1.75,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              background: '#fafafa', color: '#333', overflowX: 'auto',
            }}>
              {QUICKSTART}
            </pre>
          </div>
        </div>
      </section>

      {/* Claude + OpenAI section */}
      <section className="zdb-section" style={{ padding: '72px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8, letterSpacing: -0.5, textAlign: 'center' }}>
            Already using Claude or OpenAI?
          </h2>
          <p style={{ textAlign: 'center', color: '#333', fontSize: 15, marginBottom: 8, maxWidth: 580, margin: '0 auto 8px' }}>
            Their memory is for the chat. ZizkaDB is for your code: every decision, every cause, every trigger.
          </p>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#666', marginBottom: 40 }}>
            No wrappers. No monkey-patching. Just parent_id. Install{' '}
            <code style={{ fontFamily: 'monospace', fontSize: 12 }}>zizkadb-sdk</code> on PyPI (import{' '}
            <code style={{ fontFamily: 'monospace', fontSize: 12 }}>zizkadb</code>).
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 0, borderBottom: '1px solid #e5e5e5' }}>
            {(['claude', 'openai'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: '10px 20px', fontSize: 13, fontWeight: 500, border: 'none',
                background: 'none', cursor: 'pointer', borderBottom: activeTab === t ? '2px solid #111' : '2px solid transparent',
                color: activeTab === t ? '#111' : '#999', marginBottom: -1,
              }}>
                {t === 'claude' ? 'Claude (Anthropic)' : 'OpenAI Agents SDK'}
              </button>
            ))}
          </div>

          <div style={{ border: '1px solid #e5e5e5', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: 12, color: '#999', fontFamily: 'monospace' }}>
                {activeTab === 'claude' ? 'claude_agent.py' : 'openai_agent.py'}
              </span>
              <button onClick={() => copy(activeTab === 'claude' ? CLAUDE_CODE : OPENAI_CODE, activeTab)} style={{
                marginLeft: 'auto', background: '#f0f0f0', border: 'none', borderRadius: 6,
                padding: '3px 10px', fontSize: 11, cursor: 'pointer', color: '#555',
              }}>
                {copied === activeTab ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{
              margin: 0, padding: '24px', fontSize: 12.5, lineHeight: 1.75,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              background: '#fafafa', color: '#333', overflowX: 'auto',
            }}>
              {activeTab === 'claude' ? CLAUDE_CODE : OPENAI_CODE}
            </pre>
          </div>

          {/* What you get callouts */}
          <div className="zdb-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
            {[
              { label: 'Session 1',     value: 'Causal chain on every decision.' },
              { label: 'Session 10',    value: 'Semantic search. Time travel.' },
              { label: 'Session 50',    value: 'Behavioral baseline live. Alerts coming.' },
            ].map(item => (
              <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '16px 18px', border: '1px solid #e5e5e5' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: '#333', lineHeight: 1.5 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="zdb-section" style={{ padding: '72px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>
            What vector DBs can&apos;t do
          </h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 56 }}>
            Vector DBs store embeddings. ZizkaDB stores what happened, why, and what came next.
          </p>
          <div className="zdb-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: '🔍', title: 'Causal Lineage',   desc: 'Every event links to its cause. Trace any output to the input that triggered it.' },
              { icon: '⏪', title: 'Time Travel',      desc: "Reconstruct your agent's logged state at any past timestamp." },
              { icon: '🧠', title: 'Semantic Search',  desc: 'Search history in plain English. No schema. No keywords.' },
              { icon: '🚨', title: 'Behavioral Baseline', desc: 'See when an agent stops looking like itself. Investigate before users notice.' },
              { icon: '🤝', title: 'Agent Handoff',    desc: 'Pass only the causally relevant context. Stops full-history-in-prompt.' },
              { icon: '📋', title: 'Audit Log',        desc: 'SHA-256 checksum per event. Append-only by default. GDPR forget supported.' },
            ].map(f => (
              <div key={f.title} style={{ borderRadius: 12, padding: '24px 22px', border: '1px solid #e5e5e5' }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13.5, color: '#444', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="zdb-section" style={{ padding: '72px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
            How it compares
          </h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 8 }}>
            Facts only. Verify every row in their docs.
          </p>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginBottom: 40 }}>
            LangSmith · Mem0 · Pinecone · ZizkaDB · May 2026
          </p>

          <div className="zdb-table-wrap" style={{ border: '1px solid #e5e5e5', borderRadius: 12, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 540 }}>
              <thead>
                <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ padding: '13px 18px', textAlign: 'left', fontWeight: 600, color: '#333', width: '36%' }}>Capability</th>
                  {['LangSmith', 'Mem0', 'Pinecone', 'ZizkaDB'].map(h => (
                    <th key={h} style={{
                      padding: '13px 14px', textAlign: 'center', fontWeight: 600,
                      color: h === 'ZizkaDB' ? '#111' : '#999',
                      background: h === 'ZizkaDB' ? '#f5fffe' : 'transparent',
                      fontSize: 13,
                    }}>
                      {h}{h === 'ZizkaDB' && <span style={{ display: 'block', fontSize: 10, color: BRAND, fontWeight: 500 }}>← us</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Agent event logging',                    '✓', '✗', '✗', '✓'],
                  ['Causal lineage (parent → child)',        '~', '✗', '✗', '✓'],
                  ['Time travel: state at timestamp',        '✗', '✗', '✗', '✓'],
                  ['Semantic search over history',           '✗', '✓', '✓', '✓'],
                  ['Works with any framework/model',         '~', '✓', '✓', '✓'],
                  ['Behavioral baseline per agent',          '✗', '✗', '✗', '✓'],
                  ['Cross-agent fleet queries',              '✗', '✗', '✗', '✓'],
                  ['Per-event checksum on export',           '✗', '✗', '✗', '✓'],
                  ['Self-hostable for free',                 '✓', '✓', '✗', '✓'],
                ].map(([cap, ...vals], i) => (
                  <tr key={cap} style={{ borderBottom: i < 8 ? '1px solid #f0f0f0' : 'none' }}>
                    <td style={{ padding: '12px 18px', color: '#444', fontSize: 13.5 }}>{cap}</td>
                    {vals.map((v, j) => (
                      <td key={j} style={{
                        padding: '12px 14px', textAlign: 'center', fontSize: 15,
                        color: v === '✓' ? (j === 3 ? BRAND_DARK : '#bbb')
                             : v === '~' ? '#f59e0b' : '#e0e0e0',
                        fontWeight: j === 3 && v === '✓' ? 700 : 400,
                        background: j === 3 ? '#f5fffe' : 'transparent',
                      }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 10 }}>
            ~ = partial support &nbsp;·&nbsp; LangSmith works mainly within the LangChain ecosystem
            &nbsp;·&nbsp; <Link href="/trust" style={{ color: '#888' }}>Technical reference</Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="zdb-section" style={{ padding: '80px 40px', background: 'linear-gradient(165deg, #0a0a0a 0%, #111827 100%)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: BRAND, marginBottom: 16 }}>
            Ready to start?
          </p>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: -0.8, lineHeight: 1.15 }}>
            Managed cloud, MCP,<br />or self-host — your choice.
          </h2>
          <p style={{ fontSize: 16, color: '#9ca3af', marginBottom: 36, lineHeight: 1.6 }}>
            Most teams start on db.zizka.ai — free trial, no credit card. Developers also connect Cursor via MCP or clone the open-source stack.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            <Link href="/signup" style={{
              padding: '16px 32px', background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
              color: '#fff', borderRadius: 12, textDecoration: 'none',
              fontWeight: 700, fontSize: 16, boxShadow: '0 4px 24px rgba(249,115,22,0.45)',
            }}>
              Start managed free →
            </Link>
            <button
              type="button"
              onClick={() => copy(MCP_HERO_CONFIG, 'final-mcp')}
              style={{
                padding: '16px 32px', background: 'rgba(255,255,255,0.1)', color: '#fff',
                borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                fontWeight: 600, fontSize: 16,
              }}
            >
              {copied === 'final-mcp' ? '✓ Copied MCP config' : 'Copy MCP config'}
            </button>
          </div>
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            <Link href="#pricing" style={{ color: BRAND_PALE, fontWeight: 500, textDecoration: 'none' }}>
              View pricing
            </Link>
            {' '}·{' '}
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" style={{ color: BRAND_PALE, fontWeight: 500, textDecoration: 'none' }}>
              GitHub ↗
            </a>
            {' '}·{' '}
            <Link href="/docs" style={{ color: BRAND_PALE, fontWeight: 500, textDecoration: 'none' }}>
              Docs
            </Link>
          </p>
        </div>
      </section>

      {/* Self-host CTA */}
      <section className="zdb-section" style={{ padding: '56px 40px', background: '#fafafa' }}>
        <div className="zdb-self-host" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', background: '#111', borderRadius: 20, padding: '48px 40px' }}>
          <div style={{
            display: 'inline-block', marginBottom: 16,
            background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
            color: BRAND_PALE, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100,
          }}>
            AGPL · DOCKER · FULL FEATURE SET
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 12, letterSpacing: -0.5 }}>
            One command. Your infra.
          </h2>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>
            API, dashboard, Postgres, Qdrant — everything in the repo. MCP and SDKs point at your host.
          </p>
          <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 13, color: BRAND_LIGHT, textAlign: 'left', marginBottom: 24, lineHeight: 1.9, overflowX: 'auto' }}>
            <div><span style={{ color: '#555' }}>$ </span>git clone https://github.com/Zizka-ai/ZizkaDB &amp;&amp; cd ZizkaDB</div>
            <div><span style={{ color: '#555' }}>$ </span>bash scripts/setup-local.sh</div>
            <div><span style={{ color: '#555' }}>→ </span>localhost:3001/login → Open my dashboard →</div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              style={{ padding: '12px 28px', background: BRAND, color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 15 }}
            >
              Clone on GitHub ↗
            </a>
            <Link href="/docs" style={{ padding: '12px 28px', background: 'transparent', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 15, border: '1px solid rgba(255,255,255,0.2)' }}>
              Self-host guide →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="zdb-footer" style={{ borderTop: '1px solid #f0f0f0', padding: '28px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#999' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...brandLogoStyle, width: 22, height: 22, borderRadius: 5 }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>Z</span>
          </div>
          <span style={{ fontWeight: 500, color: '#333' }}>ZizkaDB</span>
          <span style={{ color: '#ddd' }}>·</span>
          <span>by Zizka AI</span>
        </div>
        <div className="zdb-footer-links" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[['Docs', '/docs'], ['Managed', '#managed'], ['Pricing', '#pricing'], ['GitHub', GITHUB_URL], ['Technical', '/trust'], ['Community', '/community'], ['Sign in', '/login']].map(([l, h]) => (
            h.startsWith('http') ? (
              <a key={l} href={h} target="_blank" rel="noreferrer" style={{ color: '#999', textDecoration: 'none' }}>{l}</a>
            ) : (
              <Link key={l} href={h} style={{ color: '#999', textDecoration: 'none' }}>{l}</Link>
            )
          ))}
          <Link href="/signup" style={{ color: '#111', fontWeight: 600, textDecoration: 'none' }}>Start free →</Link>
        </div>
      </footer>
    </div>
  )
}
