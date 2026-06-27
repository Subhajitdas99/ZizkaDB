'use client'

import { BRAND, BRAND_LIGHT } from '@/components/brand'
import { M } from './marketing-theme'

/** CSS dashboard mock — real product chrome, no stock terminal screenshot */
export function ProductPreview() {
  return (
    <div
      className="zdb-product-preview"
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        border: `1px solid rgba(249,115,22,0.25)`,
        boxShadow: '0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset',
        background: M.previewBg,
      }}
    >
      {/* Window chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', background: '#161616',
        borderBottom: `1px solid ${M.previewBorder}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ marginLeft: 6, fontSize: 11, color: '#737373' }}>ZizkaDB · Agents</span>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600, color: BRAND_LIGHT,
          background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)',
          padding: '2px 8px', borderRadius: 100,
        }}>
          Live
        </span>
      </div>

      <div style={{ display: 'flex', minHeight: 280 }}>
        {/* Sidebar */}
        <div style={{
          width: 148, flexShrink: 0, borderRight: `1px solid ${M.previewBorder}`,
          padding: '14px 10px', background: '#0a0a0a',
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#525252', letterSpacing: 0.8, marginBottom: 10 }}>
            AGENTS
          </div>
          {[
            { name: 'support-bot', active: true, drift: true },
            { name: 'sales-agent', active: false, drift: false },
            { name: 'internal-copilot', active: false, drift: false },
          ].map(a => (
            <div
              key={a.name}
              style={{
                padding: '8px 10px', borderRadius: 8, marginBottom: 4, fontSize: 12,
                background: a.active ? '#1a1a1a' : 'transparent',
                color: a.active ? '#fff' : '#737373',
                border: a.active ? `1px solid ${M.previewBorder}` : '1px solid transparent',
              }}
            >
              {a.name}
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, padding: '16px 18px', background: M.previewBg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>support-bot</div>
              <div style={{ fontSize: 11, color: '#737373' }}>1,284 events · 42 sessions</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: BRAND_LIGHT,
              background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.35)',
              padding: '4px 10px', borderRadius: 8,
            }}>
              Drift detected
            </div>
          </div>

          {/* Drift bar */}
          <div style={{
            background: M.previewSurface, borderRadius: 10, padding: '12px 14px',
            border: `1px solid ${M.previewBorder}`, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8 }}>
              <span style={{ color: '#a3a3a3' }}>Behavior vs baseline</span>
              <span style={{ color: BRAND, fontWeight: 600 }}>0.24 · noticeable</span>
            </div>
            <div style={{ height: 6, borderRadius: 100, background: '#262626', overflow: 'hidden' }}>
              <div style={{ width: '24%', height: '100%', background: `linear-gradient(90deg, ${BRAND} 0%, #fb923c 100%)`, borderRadius: 100 }} />
            </div>
          </div>

          {/* Event chain */}
          <div style={{
            background: M.previewSurface, borderRadius: 10, padding: '12px 14px',
            border: `1px solid ${M.previewBorder}`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#525252', letterSpacing: 0.6, marginBottom: 10 }}>
              WHY THIS HAPPENED
            </div>
            {[
              { t: 'user_message', d: '"Why was I charged twice?"', indent: 0 },
              { t: 'tool_call', d: 'get_billing(user=8821)', indent: 1 },
              { t: 'response', d: 'Found duplicate charge flag', indent: 2 },
            ].map(row => (
              <div key={row.t} style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: row.indent * 14 }}>
                <span style={{ fontSize: 10, color: BRAND, fontFamily: 'JetBrains Mono, monospace', minWidth: 72 }}>{row.t}</span>
                <span style={{ fontSize: 11, color: '#d4d4d4', fontFamily: 'JetBrains Mono, monospace' }}>{row.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
