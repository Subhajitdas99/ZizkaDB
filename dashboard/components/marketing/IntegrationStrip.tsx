import { M } from './marketing-theme'

const INTEGRATIONS = [
  { name: 'Python SDK', sub: 'pip install zizkadb-sdk' },
  { name: 'TypeScript SDK', sub: 'npm i zizkadb-sdk' },
  { name: 'Cursor MCP', sub: 'Native tools' },
  { name: 'REST API', sub: 'Any language' },
  { name: 'Self-host', sub: 'Docker Compose' },
  { name: 'Managed cloud', sub: 'db.zizka.ai' },
]

export function IntegrationStrip({ dark = false }: { dark?: boolean }) {
  return (
    <div>
      <p style={{
        fontSize: 12, fontWeight: 600, textAlign: 'center', marginBottom: 14,
        color: dark ? '#64748b' : M.muted, letterSpacing: 0.3,
      }}>
        Works with your stack
      </p>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
      }}>
        {INTEGRATIONS.map(item => (
          <div
            key={item.name}
            style={{
              padding: '10px 16px', borderRadius: 12,
              background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
              border: dark ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${M.line}`,
              boxShadow: dark ? 'none' : '0 2px 8px rgba(15,23,42,0.04)',
              minWidth: 120, textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: dark ? '#e2e8f0' : M.ink,
            }}>
              {item.name}
            </div>
            <div style={{ fontSize: 10, color: dark ? '#64748b' : M.faint, marginTop: 2 }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
