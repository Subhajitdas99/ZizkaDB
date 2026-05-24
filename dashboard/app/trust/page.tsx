import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

export const metadata = {
  title: 'Product claims & positioning',
  description: 'What ZizkaDB is, what it is not, and which marketing claims are accurate today.',
}

export default function TrustPage() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111', background: '#fff', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid #f0f0f0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#111' }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Z</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>ZizkaDB</span>
        </Link>
        <nav style={{ display: 'flex', gap: 20, fontSize: 13 }}>
          <Link href="/docs" style={{ color: '#666', textDecoration: 'none' }}>Docs</Link>
          <Link href="/swagger" style={{ color: '#666', textDecoration: 'none' }}>API</Link>
        </nav>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          Transparency
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 12 }}>
          What ZizkaDB is — and is not
        </h1>
        <p style={{ fontSize: 16, color: '#555', lineHeight: 1.7, marginBottom: 40 }}>
          This page is our source of truth for positioning, comparisons, and technical claims.
          Last updated May 2026.
        </p>

        <Section title="One sentence">
          <p style={p}>
            <strong>ZizkaDB is the operational database for AI agents</strong> — it logs what agents do,
            links decisions by cause, searches history by meaning, reconstructs past logged state, and
            flags when behavior drifts from its own baseline.
          </p>
        </Section>

        <Section title="ZizkaDB is">
          <ul style={ul}>
            <li>An <strong>event store + memory layer</strong> for agents (not a vector database)</li>
            <li><strong>Framework-agnostic</strong> — Python, TypeScript, MCP, REST</li>
            <li><strong>Causal</strong> — parent → child links via <code style={code}>why()</code></li>
            <li><strong>Self-hostable</strong> (Docker Compose, AGPL core)</li>
            <li>A complement to Pinecone/Qdrant for <em>retrieval</em>, not a replacement</li>
          </ul>
        </Section>

        <Section title="ZizkaDB is not">
          <ul style={ul}>
            <li>A Pinecone / Weaviate / Qdrant competitor for document RAG</li>
            <li>A guarantee that the <strong>LLM</strong> will produce identical outputs on replay</li>
            <li>A certified compliance product (SOC 2 / ISO) — we provide building blocks only</li>
            <li>A full OpenTelemetry or LangSmith replacement (different scope; can be used alongside)</li>
            <li>Immutable WORM storage — events can be deleted via GDPR <code style={code}>forget()</code></li>
          </ul>
        </Section>

        <Section title="Claims we stand behind today">
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Claim</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Per-event SHA-256 checksum on logged payloads', 'Shipped'],
                ['Causal chain traversal (why)', 'Shipped'],
                ['Semantic search over event history', 'Shipped (OpenAI embeddings)'],
                ['Reconstruct logged state at a timestamp (at)', 'Shipped'],
                ['Behavioral baseline / drift score', 'Shipped (needs session volume)'],
                ['GDPR erasure by metadata filter', 'Shipped'],
                ['Self-host with Docker', 'Shipped'],
              ].map(([claim, status]) => (
                <tr key={claim}>
                  <td style={td}>{claim}</td>
                  <td style={{ ...td, color: '#16a34a', fontWeight: 500 }}>{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Claims we do not make (or not yet)">
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Do not say</th>
                <th style={th}>Say instead</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['100% deterministic LLM outputs', 'Deterministic replay of logged events and causal chains'],
                ['Tamper-proof / legally signed audit export', 'Per-event checksum; export API on roadmap'],
                ['Proven at 1B events/month in production', 'Team plan includes up to 1B events/month (plan limit)'],
                ['Enterprise compliance certified', 'Compliance-friendly logging + GDPR forget'],
                ['Replaces LangSmith or OpenTelemetry', 'Complements tracing tools; works with any stack'],
              ].map(([bad, good]) => (
                <tr key={bad}>
                  <td style={td}>{bad}</td>
                  <td style={td}>{good}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Sensible stack">
          <p style={p}>
            Most production agent systems use several layers:
          </p>
          <pre style={pre}>{`Agent
 ├── Vector DB (Pinecone, Qdrant, …)  →  document / knowledge retrieval
 ├── Postgres / Redis                 →  app state & caches
 ├── ZizkaDB                          →  agent decisions, lineage, drift
 └── LangSmith / OTel (optional)      →  traces & evals`}</pre>
        </Section>

        <Section title="Questions">
          <p style={p}>
            Technical details: <Link href="/docs" style={{ color: '#111' }}>docs</Link>.
            {' '}API: <Link href="/swagger" style={{ color: '#111' }}>/swagger</Link>.
            {' '}Contact: <a href="mailto:hello@zizka.ai" style={{ color: '#111' }}>hello@zizka.ai</a>.
          </p>
        </Section>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>{title}</h2>
      {children}
    </section>
  )
}

const p: CSSProperties = { fontSize: 15, color: '#444', lineHeight: 1.7, margin: '0 0 12px' }
const ul: CSSProperties = { margin: 0, paddingLeft: 22, fontSize: 15, color: '#444', lineHeight: 1.8 }
const code: CSSProperties = { fontFamily: 'monospace', fontSize: 13, background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }
const table: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 14 }
const th: CSSProperties = { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #eee', color: '#333', fontWeight: 600 }
const td: CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #f0f0f0', color: '#444', verticalAlign: 'top' }
const pre: CSSProperties = {
  margin: '12px 0 0', padding: 16, background: '#fafafa', border: '1px solid #eee',
  borderRadius: 10, fontSize: 13, lineHeight: 1.6, overflowX: 'auto',
}
