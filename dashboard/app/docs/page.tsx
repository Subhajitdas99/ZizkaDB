'use client'

import Link from 'next/link'
import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
type Section = 'managed' | 'mcp' | 'selfhost' | 'concepts'
type ManagedTab = 'python' | 'typescript' | 'rest'

const API_EXPLORER_URL =
  `${(process.env.NEXT_PUBLIC_API_URL || 'https://db.zizka.ai').replace(/\/$/, '')}/api-explorer`

// ── Styles ─────────────────────────────────────────────────────────────────
const S = {
  page:    { fontFamily: 'Inter, system-ui, sans-serif', color: '#111', background: '#fff', minHeight: '100vh' } as const,
  layout:  { display: 'flex', maxWidth: 1100, margin: '0 auto' } as const,
  main:    { flex: 1, padding: '32px 20px 80px', maxWidth: 820, minWidth: 0 } as const,
  h1:      { fontSize: 32, fontWeight: 700, margin: '0 0 8px', letterSpacing: -0.5 } as const,
  h2:      { fontSize: 22, fontWeight: 700, margin: '48px 0 6px', letterSpacing: -0.3 } as const,
  h3:      { fontSize: 15, fontWeight: 600, margin: '28px 0 8px', color: '#222' } as const,
  lead:    { fontSize: 16, color: '#444', lineHeight: 1.7, margin: '0 0 32px' } as const,
  p:       { fontSize: 14.5, color: '#444', lineHeight: 1.7, margin: '0 0 14px' } as const,
  label:   { fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: 1, textTransform: 'uppercase' as const, margin: '0 0 6px' },
}

function Code({ children, lang = '' }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ position: 'relative', margin: '10px 0 20px' }}>
      <pre style={{
        background: '#f6f6f6', border: '1px solid #e5e5e5', borderRadius: 10,
        padding: '18px 20px', fontSize: 13, lineHeight: 1.75, overflowX: 'auto',
        fontFamily: 'JetBrains Mono, Fira Code, Menlo, monospace', color: '#222', margin: 0,
      }}>
        {lang && <span style={{ position: 'absolute', top: 10, left: 16, fontSize: 10, color: '#bbb', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{lang}</span>}
        <span style={{ display: lang ? 'block' : undefined, marginTop: lang ? 12 : 0 }}>{children}</span>
      </pre>
      <button onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        style={{ position: 'absolute', top: 10, right: 12, background: copied ? '#22c55e' : '#ebebeb', border: 'none', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', color: copied ? '#fff' : '#666' }}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
      <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: '#111', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

function Callout({ type, children }: { type: 'tip' | 'warning' | 'info'; children: React.ReactNode }) {
  const styles = {
    tip:     { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  }
  const s = styles[type]
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '12px 16px', fontSize: 13.5, color: s.text, margin: '0 0 20px', lineHeight: 1.6 }}>
      {children}
    </div>
  )
}

function NavItem({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left', background: active ? '#f5f5f5' : 'none',
      border: 'none', borderRadius: 7, padding: '7px 12px', fontSize: 13.5,
      color: active ? '#111' : '#555', fontWeight: active ? 600 : 400, cursor: 'pointer', marginBottom: 2,
    }}>
      {children}
    </button>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [section, setSection] = useState<Section>('managed')
  const [tab, setTab] = useState<ManagedTab>('python')

  return (
    <div style={S.page}>
      <style>{`
        @media (max-width: 640px) {
          .docs-nav-links { display: none !important; }
          .docs-sidebar { display: none !important; }
          .docs-mobile-nav { display: flex !important; }
          .docs-main { padding: 20px 16px 60px !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 52, borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: '#fff', zIndex: 100 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Z</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>ZizkaDB</span>
          <span className="docs-nav-links" style={{ fontSize: 12, color: '#bbb' }}>/ Docs</span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/community" className="docs-nav-links" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>Community</Link>
          <a href={API_EXPLORER_URL} className="docs-nav-links" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>API Explorer</a>
          <Link href="/signup" style={{ fontSize: 13, fontWeight: 500, color: '#fff', textDecoration: 'none', padding: '6px 12px', background: '#111', borderRadius: 7 }}>
            Get API key →
          </Link>
        </div>
      </nav>

      {/* Mobile section switcher — hidden on desktop */}
      <div className="docs-mobile-nav" style={{
        display: 'none', overflowX: 'auto', borderBottom: '1px solid #f0f0f0',
        padding: '0 16px', gap: 0, position: 'sticky', top: 52, background: '#fff', zIndex: 99,
      }}>
        {([
          ['managed', 'Managed'],
          ['mcp', 'MCP'],
          ['selfhost', 'Self-host'],
          ['concepts', 'Concepts'],
        ] as [Section, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)} style={{
            padding: '10px 14px', fontSize: 13, fontWeight: 500, border: 'none', background: 'none',
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            borderBottom: section === id ? '2px solid #111' : '2px solid transparent',
            color: section === id ? '#111' : '#888',
          }}>{label}</button>
        ))}
      </div>

      <div style={S.layout}>

        {/* Sidebar — hidden on mobile */}
        <aside className="docs-sidebar" style={{ width: 210, flexShrink: 0, padding: '32px 16px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto', borderRight: '1px solid #f0f0f0' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={S.label}>Getting started</div>
            <NavItem active={section === 'managed'} onClick={() => setSection('managed')}>Managed service</NavItem>
            <NavItem active={section === 'mcp'} onClick={() => setSection('mcp')}>MCP (Claude, Cursor)</NavItem>
            <NavItem active={section === 'selfhost'} onClick={() => setSection('selfhost')}>Self-host</NavItem>
          </div>
          <div>
            <div style={S.label}>Reference</div>
            <NavItem active={section === 'concepts'} onClick={() => setSection('concepts')}>Core concepts</NavItem>
            <a href={API_EXPLORER_URL} style={{ display: 'block', fontSize: 13.5, color: '#666', textDecoration: 'none', padding: '7px 12px', marginBottom: 2 }}>
              API Explorer ↗
            </a>
          </div>
        </aside>

        {/* Content */}
        <main className="docs-main" style={S.main}>

          {/* ── MANAGED SERVICE ── */}
          {section === 'managed' && (
            <div>
              <h1 style={S.h1}>Managed Service</h1>
              <p style={S.lead}>
                The fastest way to get started. Sign up, grab an API key, and start logging.
              </p>
              <Callout type="info">
                <strong>What ZizkaDB does:</strong> as you log events, it builds a behavioral baseline for each agent: which event types it emits, which decision sequences are normal, what the typical session shape looks like. Each new session is compared against that baseline so you can see when an agent has stopped behaving like itself. Causal lineage, time travel, and semantic search are how you investigate what changed.
              </Callout>

              <Step n={1} title="Create your account">
                <p style={S.p}>Go to <a href="/signup" style={{ color: '#111', fontWeight: 500 }}>db.zizka.ai/signup</a> and sign in with your email. No password needed.</p>
              </Step>

              <Step n={2} title="Get your API key">
                <p style={S.p}>After signing in, open <strong>Settings</strong> in the sidebar and click <strong>Create API key</strong>. Your key starts with <code style={{ fontFamily: 'monospace', background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>agdb_live_</code></p>
              </Step>

              <Step n={3} title="Install and connect">
                {/* Language tabs */}
                <div style={{ display: 'flex', gap: 2, marginBottom: 0, borderBottom: '2px solid #f0f0f0' }}>
                  {(['python', 'typescript', 'rest'] as ManagedTab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding: '8px 18px', fontSize: 13, fontWeight: 500, border: 'none', background: 'none',
                      cursor: 'pointer', borderBottom: tab === t ? '2px solid #111' : '2px solid transparent',
                      color: tab === t ? '#111' : '#888', marginBottom: -2, textTransform: 'capitalize',
                    }}>
                      {t === 'rest' ? 'REST API' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {tab === 'python' && (
                  <div style={{ paddingTop: 20 }}>
                    <p style={S.p}>Install the SDK. It has one dependency (<code style={{ fontFamily: 'monospace', background: '#f0f0f0', padding: '1px 5px', borderRadius: 3 }}>httpx</code>) and works with Python 3.10+.</p>
                    <Code lang="bash">pip install zizkadb-sdk</Code>
                    <p style={S.p}>Log your first event. This snippet is fully runnable — paste it into a file, set your key, run it.</p>
                    <Code lang="python">{`import asyncio
from zizkadb import ZizkaDB

db = ZizkaDB("agdb_live_xxxx")   # paste your API key here

async def main():
    # Log any agent action
    result = await db.log(
        agent="my-bot",          # a name for your agent
        event="tool_call",       # what happened
        data={"tool": "search", "query": "pricing"},
    )
    print(result.event_id)       # saved

asyncio.run(main())`}</Code>
                    <Callout type="info">
                      <strong>All Python examples below run inside an <code style={{ fontFamily: 'monospace' }}>async def main()</code> wrapped with <code style={{ fontFamily: 'monospace' }}>asyncio.run(main())</code>.</strong> The SDK is async-first because real agents stream events; trying to run <code style={{ fontFamily: 'monospace' }}>await</code> at module level will raise <code style={{ fontFamily: 'monospace' }}>SyntaxError: 'await' outside async function</code>.
                    </Callout>
                    <p style={S.p}>Link events causally (this is what makes debugging possible):</p>
                    <Code lang="python">{`async def main():
    # Log the user's message
    msg = await db.log(agent="my-bot", event="user_message",
        data={"text": "why is my bill $200?"})

    # Log the tool call that happened because of it
    tool = await db.log(agent="my-bot", event="tool_call",
        data={"tool": "get_billing"},
        parent_id=msg.event_id)  # link to parent

    # Now ask: why did this tool get called?
    chain = await db.why(tool.event_id)
    chain.print()
    # user_message: "why is my bill $200?"   [14:32:01]
    #   tool_call: get_billing               [14:32:02]

asyncio.run(main())`}</Code>
                    <Callout type="tip">
                      <strong>Tip:</strong> Pass <code style={{ fontFamily: 'monospace' }}>session_id</code> to group all events in one conversation. Later you can call <code style={{ fontFamily: 'monospace' }}>db.memory_diff(session_id)</code> to see what changed.
                    </Callout>
                  </div>
                )}

                {tab === 'typescript' && (
                  <div style={{ paddingTop: 20 }}>
                    <p style={S.p}>Install the SDK. Works with Node.js, Deno, Bun, and Edge runtimes.</p>
                    <Code lang="bash">npm install zizkadb-sdk</Code>
                    <p style={S.p}>Log your first event:</p>
                    <Code lang="typescript">{`import { ZizkaDB } from 'zizkadb-sdk'

const db = new ZizkaDB({ apiKey: 'agdb_live_xxxx' })

// Log any agent action
const result = await db.log({
  agent: 'my-bot',
  event: 'tool_call',
  data: { tool: 'search', query: 'pricing' },
})
console.log(result.eventId)`}</Code>
                    <p style={S.p}>Link events and trace causal chains:</p>
                    <Code lang="typescript">{`const msg = await db.log({
  agent: 'my-bot', event: 'user_message',
  data: { text: 'why is my bill $200?' },
})

const tool = await db.log({
  agent: 'my-bot', event: 'tool_call',
  data: { tool: 'get_billing' },
  parentId: msg.eventId,  // causal link
})

// Trace back why this happened
const chain = await db.why(tool.eventId)
chain.print()`}</Code>
                  </div>
                )}

                {tab === 'rest' && (
                  <div style={{ paddingTop: 20 }}>
                    <p style={S.p}>Use from any language with HTTP. Base URL: <code style={{ fontFamily: 'monospace', background: '#f0f0f0', padding: '1px 5px', borderRadius: 3 }}>https://db.zizka.ai/v1/</code></p>
                    <Callout type="warning">
                      All endpoints are at <strong>/v1/</strong> not /api/. This trips people up if they are coming from Next.js apps.
                    </Callout>
                    <p style={S.p}>Log an event:</p>
                    <Code lang="bash">{`curl -X POST https://db.zizka.ai/v1/events \\
  -H "Authorization: Bearer agdb_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "my-bot",
    "event": "tool_call",
    "data": { "tool": "search" }
  }'
# returns: { "event_id": "...", "checksum": "..." }`}</Code>
                    <p style={S.p}>Search past events semantically:</p>
                    <Code lang="bash">{`curl -X POST https://db.zizka.ai/v1/search \\
  -H "Authorization: Bearer agdb_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{ "query": "billing complaint", "limit": 5 }'`}</Code>
                    <p style={S.p}>Check the API is up (no auth needed):</p>
                    <Code lang="bash">{`curl https://db.zizka.ai/health
# { "status": "ok", "version": "0.1.0" }`}</Code>
                  </div>
                )}
              </Step>

              <Step n={4} title="Open the dashboard">
                <p style={S.p}>Go to <a href="/dashboard" style={{ color: '#111', fontWeight: 500 }}>db.zizka.ai/dashboard</a> to see your agents, search their history, and replay any session.</p>
              </Step>

              {/* All methods reference */}
              <div style={{ marginTop: 48, borderTop: '1px solid #f0f0f0', paddingTop: 40 }}>
                <h2 style={{ ...S.h2, marginTop: 0 }}>All SDK methods</h2>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    { method: 'db.log()', desc: 'Log any event. Add parent_id to link it causally to a previous event.' },
                    { method: 'db.baseline(agent)', desc: 'Get the behavioral baseline for an agent: event distribution, decision-tree shapes, error rate, and how recent sessions compare.' },
                    { method: 'db.why(event_id)', desc: 'Trace the full causal chain from any event back to the root cause.' },
                    { method: 'db.search(query)', desc: 'Semantic search across all agent history. Find events by meaning, not keywords.' },
                    { method: 'db.at(agent, timestamp)', desc: 'Replay exact agent state at any past moment. Every event is checksummed.' },
                    { method: 'db.query(agent)', desc: 'List recent events for an agent, optionally filtered by event type.' },
                    { method: 'db.context_for(agent, task)', desc: 'Get a formatted memory block ready to inject into a system prompt.' },
                    { method: 'db.memory_diff(session_id)', desc: 'Summarise what happened in a session: event counts, errors, new behaviors.' },
                    { method: 'db.forget(key, value)', desc: 'GDPR right to erasure. Deletes all events matching a filter from the DB and vector index.' },
                  ].map(item => (
                    <div key={item.method} style={{ display: 'flex', gap: 16, padding: '12px 16px', background: '#fafafa', borderRadius: 10, border: '1px solid #ebebeb' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#111', minWidth: 200, flexShrink: 0 }}>{item.method}</code>
                      <span style={{ fontSize: 13.5, color: '#444', lineHeight: 1.5 }}>{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── MCP ── */}
          {section === 'mcp' && (
            <div>
              <h1 style={S.h1}>MCP Server</h1>
              <p style={S.lead}>
                If you use Claude Desktop or Cursor, you can connect ZizkaDB in 2 minutes with no code at all. The MCP server gives Claude and Cursor direct access to all ZizkaDB tools as native functions.
              </p>

              <Callout type="info">
                <strong>What is MCP?</strong> Model Context Protocol is a standard that lets AI apps (Claude, Cursor, etc.) call external tools. Adding ZizkaDB as an MCP server means the AI can log events, search memory, and replay sessions by itself.
              </Callout>

              <h2 style={{ ...S.h2, marginTop: 32 }}>Claude Desktop</h2>
              <Step n={1} title="Get your API key">
                <p style={S.p}>Sign up at <a href="/signup" style={{ color: '#111', fontWeight: 500 }}>db.zizka.ai/signup</a> and create an API key from Settings.</p>
              </Step>
              <Step n={2} title="Edit your Claude Desktop config">
                <p style={S.p}>Open this file on your Mac:</p>
                <Code>~/Library/Application Support/Claude/claude_desktop_config.json</Code>
                <p style={S.p}>Add the ZizkaDB server:</p>
                <Code lang="json">{`{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": {
        "ZIZKADB_API_KEY": "agdb_live_xxxx"
      }
    }
  }
}`}</Code>
                <Callout type="tip">
                  <strong>uvx</strong> downloads and runs the package automatically. You do not need to install anything first.
                </Callout>
              </Step>
              <Step n={3} title="Restart Claude Desktop">
                <p style={S.p}>Quit and reopen Claude Desktop. You will see ZizkaDB tools appear in the tool list. Claude can now call them automatically during conversations.</p>
              </Step>

              <h2 style={S.h2}>Cursor</h2>
              <Step n={1} title="Edit your Cursor MCP config">
                <p style={S.p}>Create or edit <code style={{ fontFamily: 'monospace', background: '#f0f0f0', padding: '1px 5px', borderRadius: 3 }}>~/.cursor/mcp.json</code>:</p>
                <Code lang="json">{`{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": {
        "ZIZKADB_API_KEY": "agdb_live_xxxx"
      }
    }
  }
}`}</Code>
              </Step>
              <Step n={2} title="Reload Cursor">
                <p style={S.p}>Open the Command Palette and run <strong>MCP: Reload servers</strong>. ZizkaDB tools are now available to Cursor agents.</p>
              </Step>

              <h2 style={S.h2}>Self-hosted ZizkaDB with MCP</h2>
              <p style={S.p}>If you are running ZizkaDB locally, point the MCP server to your instance:</p>
              <Code lang="json">{`{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": {
        "ZIZKADB_HOST": "http://localhost:8000"
      }
    }
  }
}`}</Code>

              <h2 style={S.h2}>Available tools</h2>
              <p style={S.p}>Once connected, Claude and Cursor can call these tools:</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { tool: 'log_event', desc: 'Log any agent action with an optional causal parent link' },
                  { tool: 'search_memory', desc: 'Find past events by meaning using semantic search' },
                  { tool: 'get_context', desc: 'Get a memory block formatted for system prompt injection' },
                  { tool: 'why', desc: 'Trace the causal chain that led to any event' },
                  { tool: 'query_events', desc: 'List recent events for an agent' },
                  { tool: 'time_travel', desc: 'Replay exact agent state at any past timestamp' },
                  { tool: 'memory_diff', desc: 'Summarise what happened in a session' },
                  { tool: 'forget', desc: 'Delete all events matching a filter (GDPR)' },
                ].map(item => (
                  <div key={item.tool} style={{ display: 'flex', gap: 16, padding: '11px 16px', background: '#fafafa', borderRadius: 8, border: '1px solid #ebebeb' }}>
                    <code style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 600, color: '#111', minWidth: 140, flexShrink: 0 }}>{item.tool}</code>
                    <span style={{ fontSize: 13.5, color: '#444' }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SELF-HOST ── */}
          {section === 'selfhost' && (
            <div>
              <h1 style={S.h1}>Self-Host</h1>
              <p style={S.lead}>
                Run the full ZizkaDB stack on your own server. Free forever, no account needed, full feature set. Requires Docker and an OpenAI API key for embeddings.
              </p>

              <Callout type="info">
                The stack includes Postgres with pgvector, Qdrant (vector search), Redis, and the FastAPI backend. It starts in under 60 seconds.
              </Callout>

              <Step n={1} title="Clone the repo">
                <Code lang="bash">{`git clone https://github.com/Zizka-ai/agentdb
cd zizkadb`}</Code>
              </Step>

              <Step n={2} title="Configure environment">
                <Code lang="bash">cp .env.example .env</Code>
                <p style={S.p}>Open <code style={{ fontFamily: 'monospace', background: '#f0f0f0', padding: '1px 5px', borderRadius: 3 }}>.env</code> and set at minimum:</p>
                <Code lang="bash">{`OPENAI_API_KEY=sk-...          # for auto-embeddings
JWT_SECRET=your-random-32-char-secret

# Optional: email for OTP login
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=you@gmail.com
EMAIL_PASS=your-app-password`}</Code>
              </Step>

              <Step n={3} title="Start the stack">
                <Code lang="bash">docker-compose -f infra/docker-compose.yml up --build</Code>
                <p style={S.p}>The API starts on port 8000. Verify it is running:</p>
                <Code lang="bash">{`curl http://localhost:8000/health
# { "status": "ok", "version": "0.1.0" }`}</Code>
              </Step>

              <Step n={4} title="Connect the SDK to your instance">
                <Code lang="python">{`import asyncio
from zizkadb import ZizkaDB

# No API key needed for self-hosted
db = ZizkaDB(host="http://localhost:8000")

async def main():
    await db.log(agent="my-bot", event="started", data={})

asyncio.run(main())`}</Code>
                <p style={S.p}>For TypeScript:</p>
                <Code lang="typescript">{`import { ZizkaDB } from 'zizkadb-sdk'

const db = new ZizkaDB({ host: 'http://localhost:8000' })`}</Code>
              </Step>

              <Step n={5} title="Open the dashboard">
                <p style={S.p}>The Next.js dashboard also runs locally. In a separate terminal:</p>
                <Code lang="bash">{`cd dashboard
npm install && npm run dev
# open http://localhost:3000`}</Code>
              </Step>

              <h2 style={S.h2}>Troubleshooting</h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { q: 'API not starting', a: 'Check docker-compose logs: docker-compose -f infra/docker-compose.yml logs api --tail=30' },
                  { q: 'OPENAI_API_KEY missing', a: 'Embeddings need an OpenAI key. Without it, semantic search will not work but logging will.' },
                  { q: 'Port 8000 already in use', a: 'Change the port in infra/docker-compose.yml and update your SDK host accordingly.' },
                ].map(item => (
                  <div key={item.q} style={{ padding: '14px 18px', background: '#fafafa', borderRadius: 10, border: '1px solid #ebebeb' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.q}</div>
                    <div style={{ fontSize: 13.5, color: '#555' }}>{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CONCEPTS ── */}
          {section === 'concepts' && (
            <div>
              <h1 style={S.h1}>Core Concepts</h1>
              <p style={S.lead}>
                ZizkaDB is built around a few ideas that make debugging agents fundamentally different from debugging normal software.
              </p>
              <Callout type="info">
                Python snippets here are reference-style — wrap them in <code style={{ fontFamily: 'monospace' }}>async def main(): ...</code> with <code style={{ fontFamily: 'monospace' }}>asyncio.run(main())</code> at the bottom to make them runnable. See the <a href="#" onClick={(e) => { e.preventDefault(); setSection('managed'); setTab('python') }} style={{ color: '#111', fontWeight: 500 }}>Managed Service → Python</a> tab for the full template.
              </Callout>

              {[
                {
                  title: 'Events',
                  body: 'Everything in ZizkaDB is an event. A user message, a tool call, a decision, a response. Each event has an agent name, an event type, a data payload, and a timestamp. You log what you care about and skip what you do not.',
                  code: `await db.log(
    agent="support-bot",
    event="tool_call",
    data={"tool": "get_billing", "user_id": 123},
)`,
                },
                {
                  title: 'Causal lineage',
                  body: 'When you pass a parent_id, you are saying "this event happened because of that one." After a few turns, ZizkaDB has a full decision tree. You can call db.why(event_id) at any time and walk back through every choice that led to a result.',
                  code: `msg  = await db.log(agent="bot", event="user_message", data={...})
tool = await db.log(agent="bot", event="tool_call",    data={...}, parent_id=msg.event_id)
resp = await db.log(agent="bot", event="response",     data={...}, parent_id=tool.event_id)

chain = await db.why(resp.event_id)
chain.print()
# user_message → tool_call → response`,
                },
                {
                  title: 'Semantic search',
                  body: 'Every event is embedded automatically using OpenAI text-embedding-3-small. You can search all agent history in plain English and get back the most relevant events by meaning, not by keyword matching.',
                  code: `results = await db.search(
    query="customer frustrated about billing",
    agent="support-bot",
    limit=10,
)`,
                },
                {
                  title: 'Time travel',
                  body: 'Call db.at(agent, timestamp) and ZizkaDB reconstructs the exact state of that agent at that moment, based on all events logged up to that time. Every event is SHA-256 checksummed so the reconstruction is verifiable.',
                  code: `from datetime import datetime

state = await db.at("support-bot", datetime(2026, 5, 1, 15, 0))
print(state.state)   # agent state as it was at 3pm on May 1`,
                },
                {
                  title: 'Context injection',
                  body: 'db.context_for() is the drop-in replacement for LLM-provided memory. It pulls recent events and semantically relevant past events, fits them within a token budget, and returns a formatted block you paste directly into your system prompt.',
                  code: `context = await db.context_for(
    agent="support-bot",
    task="user asking about billing",
    max_tokens=2000,
)

messages = [
    {"role": "system", "content": f"You are a support agent.\\n\\n{context}"},
    {"role": "user",   "content": user_message},
]`,
                },
              ].map(concept => (
                <div key={concept.title} style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #f0f0f0' }}>
                  <h2 style={{ ...S.h2, marginTop: 0 }}>{concept.title}</h2>
                  <p style={S.p}>{concept.body}</p>
                  <Code lang="python">{concept.code}</Code>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
