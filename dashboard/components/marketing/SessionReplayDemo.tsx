'use client'

import { useEffect, useState } from 'react'
import { BRAND, BRAND_DARK } from '@/components/brand'
import { M } from './marketing-theme'

type Scene = 'chat' | 'alert' | 'replay'

const SCENES: { id: Scene; label: string }[] = [
  { id: 'chat', label: 'Customer chat' },
  { id: 'alert', label: 'Alert fires' },
  { id: 'replay', label: 'Replay & fix' },
]

export function SessionReplayDemo() {
  const [scene, setScene] = useState<Scene>('chat')
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    const order: Scene[] = ['chat', 'alert', 'replay']
    const t = setInterval(() => {
      setScene(prev => order[(order.indexOf(prev) + 1) % order.length])
    }, 4500)
    return () => clearInterval(t)
  }, [auto])

  function pick(s: Scene) {
    setAuto(false)
    setScene(s)
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12, gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {SCENES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => pick(s.id)}
              style={{
                fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 100,
                border: scene === s.id ? `1px solid ${M.blueLight}` : '1px solid rgba(255,255,255,0.12)',
                background: scene === s.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)',
                color: scene === s.id ? '#93c5fd' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600, color: '#4ade80',
          background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)',
          padding: '4px 10px', borderRadius: 100,
        }}>
          Live demo
        </span>
      </div>

      <div style={{
        borderRadius: 20,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
      }}>
        {/* App chrome */}
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${M.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: M.wash,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, background: M.bluePale,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>
              🤖
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: M.ink }}>support-bot</div>
              <div style={{ fontSize: 11, color: M.muted }}>Production · 847 sessions today</div>
            </div>
          </div>
          {scene !== 'chat' && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: BRAND_DARK,
              background: '#fff7ed', border: `1px solid ${BRAND}55`,
              padding: '5px 12px', borderRadius: 100,
            }}>
              Behavior change detected
            </span>
          )}
        </div>

        <div style={{ padding: '20px 18px', minHeight: 320, background: '#fff' }}>
          {scene === 'chat' && <ChatScene />}
          {scene === 'alert' && <AlertScene />}
          {scene === 'replay' && <ReplayScene />}
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 12, marginBottom: 0 }}>
        Tap the tabs to walk through what happens when an agent goes wrong.
      </p>
    </div>
  )
}

function ChatScene() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Bubble who="customer" text="Why was I charged twice this month?" />
      <Bubble who="agent" text="I checked your billing history. I don't see a duplicate charge on your account." />
      <div style={{
        padding: '12px 14px', borderRadius: 12, background: '#fef2f2',
        border: '1px solid #fecaca', fontSize: 13, color: '#991b1b', lineHeight: 1.5,
      }}>
        The agent missed a duplicate flag in the billing tool. The customer opens a ticket. Your team has no visibility into why.
      </div>
    </div>
  )
}

function AlertScene() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        padding: '16px 18px', borderRadius: 14,
        background: 'linear-gradient(135deg, #fff7ed 0%, #eff6ff 100%)',
        border: `1px solid ${BRAND}44`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: BRAND_DARK, marginBottom: 6 }}>
          ZizkaDB detected a shift in refund answers
        </div>
        <div style={{ fontSize: 14, color: M.inkSoft, lineHeight: 1.55 }}>
          After Tuesday&apos;s prompt update, billing responses changed tone and policy links dropped 40%.
          You are notified before complaint volume spikes.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'Sessions affected', value: '23 today' },
          { label: 'Drift score', value: '0.31 · review' },
        ].map(item => (
          <div key={item.label} style={{
            padding: '14px', borderRadius: 12, background: M.wash, border: `1px solid ${M.line}`,
          }}>
            <div style={{ fontSize: 11, color: M.muted, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: M.ink }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReplayScene() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: M.blue, marginBottom: 4 }}>
        Session replay · Tue 3:42 PM
      </div>
      {[
        { step: '1', label: 'Customer asked', text: '"Why was I charged twice?"', ok: true },
        { step: '2', label: 'Agent called', text: 'get_billing(user=8821)', ok: true },
        { step: '3', label: 'Tool returned', text: 'duplicate_charge: true (ignored by model)', ok: false },
        { step: '4', label: 'Agent replied', text: '"No duplicate found"', ok: false },
      ].map(row => (
        <div key={row.step} style={{
          display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12,
          background: row.ok ? M.wash : '#fff7ed',
          border: `1px solid ${row.ok ? M.line : `${BRAND}44`}`,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: row.ok ? M.bluePale : '#ffedd5',
            color: row.ok ? M.blue : BRAND_DARK,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800,
          }}>
            {row.ok ? row.step : '!'}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: row.ok ? M.muted : BRAND_DARK, marginBottom: 2 }}>
              {row.label}
            </div>
            <div style={{ fontSize: 13, color: M.ink, lineHeight: 1.45 }}>{row.text}</div>
          </div>
        </div>
      ))}
      <div style={{
        marginTop: 4, padding: '12px 14px', borderRadius: 12,
        background: '#ecfdf5', border: '1px solid #a7f3d0',
        fontSize: 13, color: '#065f46', fontWeight: 600,
      }}>
        Root cause found in 2 minutes. Roll back prompt v2. No log archaeology.
      </div>
    </div>
  )
}

function Bubble({ who, text }: { who: 'customer' | 'agent'; text: string }) {
  const isCustomer = who === 'customer'
  return (
    <div style={{ display: 'flex', justifyContent: isCustomer ? 'flex-start' : 'flex-end' }}>
      <div style={{
        maxWidth: '85%', padding: '12px 16px', borderRadius: isCustomer ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
        background: isCustomer ? M.wash : M.bluePale,
        border: `1px solid ${isCustomer ? M.line : '#93c5fd'}`,
        fontSize: 14, color: M.ink, lineHeight: 1.5,
      }}>
        {!isCustomer && (
          <div style={{ fontSize: 10, fontWeight: 700, color: M.blue, marginBottom: 4 }}>support-bot</div>
        )}
        {text}
      </div>
    </div>
  )
}
