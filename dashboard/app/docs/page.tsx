import Link from 'next/link'

export default function DocsPage() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111', background: '#fff', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 60, borderBottom: '1px solid #f0f0f0',
        position: 'sticky', top: 0, background: '#fff', zIndex: 100,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>A</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#111' }}>AgentDB</span>
        </Link>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="#quickstart" style={{ fontSize: 14, color: '#555', textDecoration: 'none' }}>Quickstart</Link>
          <Link href="#sdk" style={{ fontSize: 14, color: '#555', textDecoration: 'none' }}>SDK</Link>
          <Link href="#api" style={{ fontSize: 14, color: '#555', textDecoration: 'none' }}>API</Link>
          <Link href="/signup" style={{ fontSize: 14, fontWeight: 500, color: '#fff', textDecoration: 'none', padding: '7px 16px', background: '#111', borderRadius: 8 }}>
            Managed service →
          </Link>
        </div>
      </nav>

      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto' }}>

        {/* Sidebar */}
        <aside style={{ width: 220, shrink: 0, padding: '40px 0', position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflowY: 'auto' } as React.CSSProperties}>
          {[
            { label: 'GETTING STARTED', items: [['Quickstart', '#quickstart'], ['Self-host', '#selfhost'], ['Managed service', '#managed']] },
            { label: 'SDK', items: [['Python', '#python'], ['TypeScript', '#typescript']] },
            { label: 'CORE CONCEPTS', items: [['Events', '#events'], ['Causal lineage', '#lineage'], ['Time travel', '#timetravel'], ['Semantic search', '#search']] },
            { label: 'API REFERENCE', items: [['POST /events', '#api-log'], ['GET /events', '#api-query'], ['GET /events/why', '#api-why'], ['POST /search', '#api-search']] },
          ].map(section => (
            <div key={section.label} style={{ marginBottom: 28, paddingLeft: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: 0.8, marginBottom: 8 }}>
                {section.label}
              </div>
              {section.items.map(([label, href]) => (
                <a key={label} href={href} style={{ display: 'block', fontSize: 13.5, color: '#444', textDecoration: 'none', padding: '4px 0', lineHeight: 1.6 }}>
                  {label}
                </a>
              ))}
            </div>
          ))}
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: '40px 60px', maxWidth: 800, borderLeft: '1px solid #f0f0f0' }}>

          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, letterSpacing: -0.5 }}>Documentation</h1>
          <p style={{ fontSize: 16, color: '#666', marginBottom: 48 }}>
            AgentDB is the operational database for AI agents. Self-host it free or use the managed service.
          </p>

          {/* Quickstart */}
          <section id="quickstart">
            <H2>Quickstart — Managed Service</H2>
            <p style={P}>Sign up at <a href="https://agentdb.zizka.ai/login" style={A}>agentdb.zizka.ai</a>, get your API key, and log your first event in 2 minutes.</p>
            <Code>{`pip install agentdb`}</Code>
            <Code>{`from agentdb import AgentDB

db = AgentDB("agdb_live_xxxx")   # your API key

# Log an event
result = await db.log(
    agent="my-bot",
    event="tool_call",
    data={"tool": "search", "query": "competitor pricing"}
)
print(result.event_id)  # ✓ logged`}</Code>
          </section>

          <Divider />

          {/* Self-host */}
          <section id="selfhost">
            <H2>Self-Host in 60 Seconds</H2>
            <p style={P}>Run the full AgentDB stack on your own infrastructure with one Docker command. No account, no API key, no credit card.</p>

            <H3>Requirements</H3>
            <ul style={{ ...P, paddingLeft: 20 }}>
              <li>Docker Desktop (Mac/Windows) or Docker Engine (Linux)</li>
              <li>4GB RAM minimum (Qdrant needs ~2GB)</li>
              <li>OpenAI API key (for auto-embeddings)</li>
            </ul>

            <H3>Step 1 — Clone and configure</H3>
            <Code>{`git clone https://github.com/Zizka-ai/agentdb
cd agentdb
cp .env.example .env`}</Code>
            <p style={P}>Open <code style={IC}>.env</code> and set at minimum:</p>
            <Code>{`OPENAI_API_KEY=sk-...          # for auto-embeddings
JWT_SECRET=your-random-32-char-secret

# Optional — email for OTP login (Gmail app password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=you@gmail.com
EMAIL_PASS=your-app-password`}</Code>

            <H3>Step 2 — Start the stack</H3>
            <Code>{`docker-compose -f infra/docker-compose.yml up --build`}</Code>
            <p style={P}>This starts Postgres (with pgvector), Qdrant, Redis, and the API together. API available at <code style={IC}>http://localhost:8000</code></p>

            <H3>Step 3 — Verify it is running</H3>
            <Code>{`curl http://localhost:8000/health
# {"status":"ok","version":"0.1.0"}`}</Code>

            <H3>Connect your SDK to self-hosted</H3>
            <Code>{`from agentdb import AgentDB

# Point to your local instance — no API key needed
db = AgentDB(host="http://localhost:8000")

await db.log(agent="my-bot", event="started", data={"v": "1.0"})`}</Code>
          </section>

          <Divider />

          {/* SDK — Python */}
          <section id="python">
            <H2>Python SDK</H2>
            <Code>{`pip install agentdb`}</Code>

            <H3>db.log() — Log an event</H3>
            <Code>{`result = await db.log(
    agent="my-bot",          # agent identifier
    event="tool_call",       # event type (any string)
    data={"tool": "search"}, # any dict
    parent_id=prev_event_id, # optional — enables causal lineage
    session_id="sess_abc",   # optional — groups related events
)
# result.event_id, result.timestamp, result.checksum`}</Code>

            <H3>db.why() — Causal chain</H3>
            <Code>{`chain = await db.why(event_id, depth=10)
chain.print()
# user_message: "why is my bill high?"    [14:32:01]
#   └── tool_call: get_billing(456)        [14:32:02]
#       └── agent_response: "anomaly"      [14:32:03]`}</Code>

            <H3>db.search() — Semantic search</H3>
            <Code>{`results = await db.search(
    query="customer frustrated about billing",
    agent="support-bot",  # optional filter
    limit=10
)
for event in results:
    print(event.event, event.data, event.score)`}</Code>

            <H3>db.at() — Time travel</H3>
            <Code>{`from datetime import datetime

state = await db.at(
    agent="my-bot",
    timestamp=datetime(2026, 5, 1, 15, 0)
)
print(state.state)   # exact agent state at that moment`}</Code>

            <H3>db.query() — Query events</H3>
            <Code>{`events = await db.query(
    agent="my-bot",
    limit=50,
    event_type="tool_call",     # optional filter
    after=datetime(2026, 5, 1), # optional time filter
)`}</Code>

            <H3>db.context_for() — Inject memory into a prompt</H3>
            <p style={P}>Drop-in replacement for LLM-provided memory. Returns a formatted block ready to paste into your system prompt.</p>
            <Code>{`context = await db.context_for(
    agent="support-bot",
    task="user asking about their invoice",
    max_tokens=2000,        # token budget
    session_id=current_sid, # exclude current session
)

# Paste directly into your system prompt
messages = [
    {"role": "system", "content": f"You are a support agent.\\n\\n{context}"},
    {"role": "user",   "content": user_message},
]`}</Code>

            <H3>db.memory_diff() — What changed after a session</H3>
            <Code>{`diff = await db.memory_diff("sess_abc123")
print(diff["summary"])
# "Session with agent 'support-bot': 12 events over 45s."
print(diff["event_types"])   # {"tool_call": 3, "user_message": 2, ...}
print(diff["has_errors"])    # True / False
print(diff["new_event_types"])  # event types not seen in prior sessions`}</Code>

            <H3>db.forget() — GDPR right to erasure</H3>
            <Code>{`# Delete all events for a specific user
result = await db.forget("user_id", "user_123")
print(result["deleted_events"])  # e.g. 47

# Also works by email, session, or any field in event data
await db.forget("email", "user@company.com")
await db.forget("session_id", "sess_xyz")`}</Code>
          </section>

          <Divider />

          {/* SDK — TypeScript */}
          <section id="typescript">
            <H2>TypeScript SDK</H2>
            <Code>{`npm install agentdb`}</Code>
            <Code>{`import { AgentDB } from 'agentdb'

const db = new AgentDB({ apiKey: 'agdb_live_xxxx' })
// or self-hosted:
const db = new AgentDB({ host: 'http://localhost:8000' })

// Log
const result = await db.log({
  agent: 'my-bot', event: 'tool_call',
  data: { tool: 'search', query: '...' },
  parentId: prevEventId,
})

// Why
const chain = await db.why(result.eventId)
chain.print()

// Search
const results = await db.search({ query: 'billing issue', limit: 10 })

// Time travel
const state = await db.at({ agent: 'my-bot', timestamp: new Date('2026-05-01') })

// Context injection — drop-in for LLM memory
const context = await db.contextFor({
  agent: 'my-bot',
  task: 'user asking about invoice',
  maxTokens: 2000,
})
// → paste into system prompt

// Memory diff after session
const diff = await db.memoryDiff('sess_abc')
console.log(diff.summary)
console.log(diff.hasErrors)

// GDPR forget
const r = await db.forget({ filterKey: 'userId', filterValue: 'user_123' })
console.log(r.deletedEvents)`}</Code>
          </section>

          <Divider />

          {/* API Reference */}
          <section id="api">
            <H2>API Reference</H2>
            <p style={P}>All endpoints are available at <code style={IC}>https://agentdb.zizka.ai</code> (managed) or your self-hosted URL.</p>
            <p style={P}>Authentication: pass your API key as <code style={IC}>Authorization: Bearer agdb_live_xxxx</code></p>

            <H3 id="api-log">POST /v1/events — Log event</H3>
            <Code>{`curl https://agentdb.zizka.ai/v1/events \\
  -H "Authorization: Bearer agdb_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "my-bot",
    "event": "tool_call",
    "data": {"tool": "search"},
    "parent_id": "evt_abc123"
  }'`}</Code>

            <H3 id="api-why">GET /v1/events/{'{id}'}/why — Causal chain</H3>
            <Code>{`curl "https://agentdb.zizka.ai/v1/events/evt_abc123/why?depth=10" \\
  -H "Authorization: Bearer agdb_live_xxxx"`}</Code>

            <H3 id="api-search">POST /v1/search — Semantic search</H3>
            <Code>{`curl https://agentdb.zizka.ai/v1/search \\
  -H "Authorization: Bearer agdb_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "billing frustration", "limit": 10}'`}</Code>
          </section>

          <div style={{ height: 80 }} />
        </main>
      </div>
    </div>
  )
}

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h2 id={id} style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, letterSpacing: -0.3 }}>{children}</h2>
}

function H3({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h3 id={id} style={{ fontSize: 15, fontWeight: 600, marginTop: 28, marginBottom: 10, color: '#333' }}>{children}</h3>
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '48px 0' }} />
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre style={{
      background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: 10,
      padding: '16px 20px', fontSize: 13, lineHeight: 1.7, overflowX: 'auto',
      fontFamily: 'JetBrains Mono, Fira Code, monospace', margin: '12px 0 20px',
      color: '#333',
    }}>
      {children}
    </pre>
  )
}

const P: React.CSSProperties = { fontSize: 15, color: '#555', lineHeight: 1.7, margin: '0 0 16px' }
const A: React.CSSProperties = { color: '#111', fontWeight: 500 }
const IC: React.CSSProperties = {
  fontFamily: 'monospace', fontSize: 13, background: '#f0f0f0',
  padding: '2px 6px', borderRadius: 4, color: '#333',
}
