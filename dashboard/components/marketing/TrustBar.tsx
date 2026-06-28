import { M } from './marketing-theme'

const TRUST_ITEMS = [
  { icon: '🏠', title: 'Self-host free', body: 'Your data stays on your infra. AGPL.' },
  { icon: '🇪🇺', title: 'EU cloud option', body: 'Managed at db.zizka.ai when you want zero ops.' },
  { icon: '🔒', title: 'Checksum-backed events', body: 'Tamper-evident decision history.' },
  { icon: '🏢', title: 'Zizka AI S.L.', body: 'Same company behind zizka.ai · Málaga, Spain' },
]

export function TrustBar() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
    }}
    className="zdb-trust-grid"
    >
      {TRUST_ITEMS.map(item => (
        <div key={item.title} style={{
          padding: '20px 18px', borderRadius: 16, background: '#fff',
          border: `1px solid ${M.line}`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: M.ink, marginBottom: 6 }}>{item.title}</div>
          <div style={{ fontSize: 12, color: M.muted, lineHeight: 1.5 }}>{item.body}</div>
        </div>
      ))}
    </div>
  )
}
