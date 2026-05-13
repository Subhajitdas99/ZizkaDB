'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

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
    <section style={{ padding: '0 40px 72px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#bbb', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>
          Developers using ZizkaDB
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
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
  Python: `from zizkadb import ZizkaDB

db = ZizkaDB("agdb_live_xxxx")   # your API key

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

  MCP: `// Add to claude_desktop_config.json or ~/.cursor/mcp.json
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

// Claude and Cursor can now call these tools natively:
// log_event  · search_memory  · get_context
// why        · time_travel    · memory_diff  · forget`,

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

const INSTALL_CMD = 'pip install zizkadb-sdk'

const QUICKSTART = `from zizkadb import ZizkaDB

db = ZizkaDB("agdb_live_xxxx")   # your API key

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

const CLAUDE_CODE = `import anthropic
from zizkadb import ZizkaDB

db     = ZizkaDB("agdb_live_xxxx")
client = anthropic.Anthropic()

async def run(user_input: str):
    # Log the user turn
    turn = await db.log(
        agent="claude-3-5-sonnet",
        event="user_message",
        data={"text": user_input},
    )

    response = client.messages.create(
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

const OPENAI_CODE = `from openai import OpenAI
from zizkadb import ZizkaDB
import json

db     = ZizkaDB("agdb_live_xxxx")
client = OpenAI()

async def run(user_input: str):
    turn = await db.log(
        agent="gpt-4o",
        event="user_message",
        data={"text": user_input},
    )

    response = client.chat.completions.create(
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
  const [activeSdk, setActiveSdk] = useState<SdkTab>('Python')

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
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
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>A</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>ZizkaDB</span>
          <span style={{ fontSize: 12, color: '#aaa', marginLeft: 4 }}>by Zizka AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[['Docs', '/docs'], ['Pricing', '#pricing']].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontSize: 14, color: '#555', textDecoration: 'none' }}>{l}</Link>
          ))}
          <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: '#111', textDecoration: 'none', padding: '7px 16px', border: '1px solid #ddd', borderRadius: 8 }}>
            Sign in
          </Link>
          <Link href="/signup" style={{ fontSize: 14, fontWeight: 500, color: '#fff', textDecoration: 'none', padding: '7px 16px', background: '#111', borderRadius: 8 }}>
            Start free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '96px 40px 72px', maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 100, padding: '5px 14px',
          fontSize: 13, color: '#9a3412', marginBottom: 28, fontWeight: 500,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
          New: behavioral baselines on every agent
        </div>

        <h1 style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.05, margin: '0 0 22px', letterSpacing: -1.5 }}>
          Your agent stops behaving<br />
          <span style={{ color: '#f97316' }}>like itself. You know first.</span>
        </h1>

        <p style={{ fontSize: 18, color: '#222', lineHeight: 1.55, margin: '0 0 36px', maxWidth: 580, marginLeft: 'auto', marginRight: 'auto', fontWeight: 500 }}>
          ZizkaDB watches every session, builds a baseline, and flags the ones that drift. Before your users do.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <Link href="/signup" style={{ padding: '12px 28px', background: '#111', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 15 }}>
            Start free →
          </Link>
          <Link href="/docs" style={{ padding: '12px 28px', background: '#fff', color: '#111', borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 15, border: '1px solid #ddd' }}>
            Read docs
          </Link>
        </div>

        {/* SDK tab switcher */}
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <div style={{ display: 'flex', gap: 2, background: '#f0f0f0', borderRadius: 9, padding: 3, marginBottom: 10 }}>
            {SDK_TABS.map(t => (
              <button key={t} onClick={() => setActiveSdk(t)} style={{
                padding: '5px 14px', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                borderRadius: 7, background: activeSdk === t ? '#fff' : 'transparent',
                color: activeSdk === t ? '#111' : '#888',
                boxShadow: activeSdk === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#f5f5f5', borderRadius: 8, padding: '8px 14px',
            fontFamily: 'monospace', fontSize: 13, color: '#333',
          }}>
            <span style={{ color: '#aaa' }}>$</span>
            <span>{INSTALL[activeSdk]}</span>
            <button onClick={() => copy(INSTALL[activeSdk], 'install')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#aaa', padding: 0 }}>
              {copied === 'install' ? '✓' : 'copy'}
            </button>
          </div>
          {activeSdk === 'MCP' && (
            <p style={{ fontSize: 12, color: '#aaa', margin: '8px 0 0' }}>
              Claude Desktop · Cursor · Windsurf · any MCP framework
            </p>
          )}
        </div>
      </section>

      {/* Live social proof counters */}
      <LiveStats />

      {/* Works with */}
      <section style={{ padding: '0 40px 72px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#bbb', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
          Works with anything
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 760, margin: '0 auto' }}>
          {[
            { label: 'Python SDK', sub: 'pip' },
            { label: 'TypeScript SDK', sub: 'npm' },
            { label: 'MCP Server', sub: 'uvx' },
            { label: 'REST API', sub: 'any language' },
            { label: 'Claude Desktop', sub: 'via MCP' },
            { label: 'Cursor', sub: 'via MCP' },
            { label: 'LangChain', sub: 'Python / JS' },
            { label: 'CrewAI', sub: 'Python' },
            { label: 'AutoGen', sub: 'Python' },
            { label: 'OpenAI Agents', sub: 'Python / JS' },
            { label: 'LlamaIndex', sub: 'Python' },
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
      <section style={{ padding: '72px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>
            Three moments other tools miss
          </h2>
          <p style={{ textAlign: 'center', color: '#444', fontSize: 15, marginBottom: 56, maxWidth: 600, margin: '0 auto 56px' }}>
            LangSmith and Langfuse show you traces after you go looking. ZizkaDB watches while you sleep.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
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
                fix: 'db.at(timestamp). Exact agent state at that moment. Checksummed.',
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
                <div style={{ fontSize: 13.5, color: '#16a34a', lineHeight: 1.6, fontWeight: 500 }}>✓ {s.fix}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect your way */}
      <section style={{ padding: '72px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
            Pick a stack
          </h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 40 }}>
            Python · TypeScript · MCP · HTTP. All four are the same product.
          </p>

          {/* SDK tabs */}
          <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid #e5e5e5', marginBottom: 0 }}>
            {SDK_TABS.map(t => (
              <button key={t} onClick={() => setActiveSdk(t)} style={{
                padding: '10px 22px', fontSize: 13, fontWeight: 500, border: 'none',
                background: 'none', cursor: 'pointer',
                borderBottom: activeSdk === t ? '2px solid #111' : '2px solid transparent',
                color: activeSdk === t ? '#111' : '#999', marginBottom: -1,
              }}>
                {t}
                {t === 'MCP' && (
                  <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, background: '#22c55e', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>NEW</span>
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
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
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
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
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
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
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
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
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
      <section style={{ padding: '72px 40px' }}>
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
      <section style={{ padding: '72px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8, letterSpacing: -0.5, textAlign: 'center' }}>
            Already using Claude or OpenAI?
          </h2>
          <p style={{ textAlign: 'center', color: '#333', fontSize: 15, marginBottom: 8, maxWidth: 580, margin: '0 auto 8px' }}>
            Their memory is for the chat. ZizkaDB is for your code: every decision, every cause, every trigger.
          </p>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#666', marginBottom: 40 }}>
            No wrappers. No monkey-patching. Just parent_id.
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
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
      <section style={{ padding: '72px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>
            What vector DBs can&apos;t do
          </h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 56 }}>
            Vector DBs store embeddings. ZizkaDB stores what happened, why, and what came next.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: '🔍', title: 'Causal Lineage',   desc: 'Every event links to its cause. Trace any output to the input that triggered it.' },
              { icon: '⏪', title: 'Time Travel',      desc: "Replay your agent's exact state at any past moment." },
              { icon: '🧠', title: 'Semantic Search',  desc: 'Search history in plain English. No schema. No keywords.' },
              { icon: '🚨', title: 'Behavioral Baseline', desc: 'See when an agent stops looking like itself. Investigate before users notice.' },
              { icon: '🤝', title: 'Agent Handoff',    desc: 'Pass only the causally relevant context. Stops full-history-in-prompt.' },
              { icon: '📋', title: 'Audit Log',        desc: 'SHA-256 checksummed. Append-only. Export a signed trail anytime.' },
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
      <section style={{ padding: '72px 40px', background: '#fafafa' }}>
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

          <div style={{ border: '1px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
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
                      {h}{h === 'ZizkaDB' && <span style={{ display: 'block', fontSize: 10, color: '#22c55e', fontWeight: 500 }}>← us</span>}
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
                  ['Tamper-evident audit export',            '✗', '✗', '✗', '✓'],
                  ['Self-hostable for free',                 '✓', '✓', '✗', '✓'],
                ].map(([cap, ...vals], i) => (
                  <tr key={cap} style={{ borderBottom: i < 8 ? '1px solid #f0f0f0' : 'none' }}>
                    <td style={{ padding: '12px 18px', color: '#444', fontSize: 13.5 }}>{cap}</td>
                    {vals.map((v, j) => (
                      <td key={j} style={{
                        padding: '12px 14px', textAlign: 'center', fontSize: 15,
                        color: v === '✓' ? (j === 3 ? '#16a34a' : '#bbb')
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
          <p style={{ textAlign: 'center', fontSize: 12, color: '#ccc', marginTop: 10 }}>
            ~ = partial support &nbsp;·&nbsp; LangSmith works mainly within the LangChain ecosystem
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '72px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>Pricing</h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 48 }}>
            Free if you self-host. Paid if you don&apos;t want to.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {([
              {
                name: 'Self-Hosted', price: 'Free', sub: 'forever',
                features: ['Full feature set', 'Your infra', 'Docker Compose', 'Community support'],
                cta: 'Setup guide →', href: '/docs', highlight: false,
              },
              {
                name: 'Pro', price: '€29', sub: 'per month',
                features: ['100M events', '90-day retention', '3 projects', 'Email support'],
                cta: 'Start 14-day free trial →', href: '/signup', highlight: true,
                note: 'No credit card needed',
              },
              {
                name: 'Team', price: '€99', sub: 'per month',
                features: ['1B events', '1-year retention', '10 seats', 'Priority support'],
                cta: 'Start 14-day free trial →', href: '/signup', highlight: false,
                note: 'No credit card needed',
              },
            ] as { name: string; price: string; sub: string; features: string[]; cta: string; href: string; highlight: boolean; note?: string }[]).map(plan => (
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
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  display: 'block', textAlign: 'center', padding: '10px',
                  borderRadius: 8, textDecoration: 'none', fontWeight: 500, fontSize: 14,
                  background: plan.highlight ? '#111' : '#fff',
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

      {/* Self-host CTA */}
      <section style={{ padding: '72px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', background: '#111', borderRadius: 20, padding: '56px 40px' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: '#fff', marginBottom: 14, letterSpacing: -0.5 }}>
            Run it yourself
          </h2>
          <p style={{ color: '#888', fontSize: 15, marginBottom: 28 }}>
            Full feature set. No account. No limits. Forever.
          </p>
          <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '16px 20px', fontFamily: 'monospace', fontSize: 13, color: '#22c55e', textAlign: 'left', marginBottom: 28, lineHeight: 1.9 }}>
            <div><span style={{ color: '#555' }}>$ </span>git clone https://github.com/Zizka-ai/agentdb</div>
            <div><span style={{ color: '#555' }}>$ </span>cp .env.example .env &amp;&amp; nano .env</div>
            <div><span style={{ color: '#555' }}>$ </span>docker-compose -f infra/docker-compose.yml up</div>
          </div>
          <Link href="/docs" style={{ padding: '12px 28px', background: '#fff', color: '#111', borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 15 }}>
            Setup guide →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#999' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>A</span>
          </div>
          <span style={{ fontWeight: 500, color: '#333' }}>ZizkaDB</span>
          <span style={{ color: '#ddd' }}>·</span>
          <span>by Zizka AI</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Docs', '/docs'], ['Pricing', '#pricing'], ['Sign in', '/login'], ['Sign up', '/signup']].map(([l, h]) => (
            <Link key={l} href={h} style={{ color: '#999', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
