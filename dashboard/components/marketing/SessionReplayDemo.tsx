'use client'

import { useEffect, useState } from 'react'
import { BRAND } from '@/components/brand'
import {
  Activity, AlertCircle, BarChart2, ChevronLeft, Clock, GitBranch,
  Layers, RefreshCw, Rewind, Search,
} from 'lucide-react'

type Scene = 'events' | 'behavior' | 'sessions'

const SCENES: { id: Scene; label: string }[] = [
  { id: 'events', label: 'Events' },
  { id: 'behavior', label: 'Drift alert' },
  { id: 'sessions', label: 'Session replay' },
]

const D = {
  bg: '#0a0a0a',
  surface: '#111',
  surfaceDeep: '#0d0d0d',
  border: '#1f1f1f',
  borderLight: '#2a2a2a',
  text: '#fff',
  green: '#22c55e',
  greenBg: '#0f1f0f',
  greenBorder: '#22c55e40',
  orange: BRAND,
  red: '#ef4444',
  blue: '#3b82f6',
  code: '#22c55e',
} as const

const EVENT_COLORS: Record<string, string> = {
  user_message: '#8b5cf6',
  tool_call: '#3b82f6',
  agent_response: '#22c55e',
  error: '#ef4444',
  connection_test: '#3b82f6',
}

export function SessionReplayDemo() {
  const [scene, setScene] = useState<Scene>('events')
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    const order: Scene[] = ['events', 'behavior', 'sessions']
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
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: '-12px -6px -6px',
        background: `radial-gradient(ellipse at 70% 30%, rgba(34,197,94,0.08) 0%, transparent 55%),
                     radial-gradient(ellipse at 20% 80%, rgba(249,115,22,0.07) 0%, transparent 50%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10, gap: 8, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {SCENES.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => pick(s.id)}
                style={{
                  fontSize: 10, fontWeight: 600, padding: '5px 11px', borderRadius: 100,
                  border: scene === s.id ? `1px solid ${D.green}` : '1px solid rgba(255,255,255,0.12)',
                  background: scene === s.id ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                  color: scene === s.id ? D.green : '#fff',
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          borderRadius: 14,
          overflow: 'hidden',
          background: D.bg,
          border: `1px solid ${D.border}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          {/* API connected bar — matches ConnectionStatus */}
          <div style={{
            margin: '10px 10px 0',
            padding: '8px 12px',
            borderRadius: 10,
            background: D.surface,
            border: `1px solid ${D.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 10,
            color: '#fff',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: D.green, flexShrink: 0 }} />
            API connected
            <code style={{ fontFamily: 'ui-monospace, monospace', color: D.green }}>https://db.zizka.ai</code>
          </div>

          <div style={{ padding: '12px 12px 14px' }}>
            {/* Header — matches agent page Shell */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10, color: '#fff', fontSize: 11 }}>
              <ChevronLeft size={12} />
              <span>Agents</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', fontFamily: 'ui-monospace, monospace' }}>
                support-bot
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: D.green, fontWeight: 600 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: D.green,
                  boxShadow: '0 0 6px rgba(34,197,94,0.6)',
                }} />
                Live · less than a minute ago
              </div>
            </div>

            {/* Stats row — matches StatsRow */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 12 }}>
              {[
                { label: 'Total events', value: '847', icon: BarChart2 },
                { label: 'Event types', value: '12', icon: GitBranch },
                { label: 'Sessions', value: '42', icon: Layers },
                { label: 'Last event', value: '2m ago', icon: Clock },
                { label: 'Errors', value: '3', icon: AlertCircle, color: D.red },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={{
                  padding: '8px 8px', borderRadius: 10,
                  background: D.surface, border: `1px solid ${D.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Icon size={10} style={{ color: '#fff' }} />
                    <span style={{ fontSize: 9, color: '#fff', fontWeight: 600 }}>{label}</span>
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 600, fontFamily: 'ui-monospace, monospace',
                    color: color ?? D.text,
                  }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Tab bar — matches agent page tabs */}
            <div style={{
              display: 'flex', gap: 3, padding: 3, marginBottom: 12,
              background: D.surfaceDeep, border: `1px solid ${D.border}`, borderRadius: 10,
            }}>
              {[
                { key: 'Behavior', icon: Activity, badge: 'NEW' as const },
                { key: 'Events', icon: BarChart2 },
                { key: 'Sessions', icon: Layers },
                { key: 'Time Travel', icon: Rewind },
              ].map(({ key, icon: Icon, badge }) => {
                const isBehavior = key === 'Behavior'
                const isEvents = key === 'Events'
                const isSessions = key === 'Sessions'
                const highlighted =
                  (scene === 'behavior' && isBehavior) ||
                  (scene === 'events' && isEvents) ||
                  (scene === 'sessions' && isSessions)
                return (
                  <div
                    key={key}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 4, padding: '6px 4px', borderRadius: 7, fontSize: 9,
                      background: highlighted ? '#1a1a1a' : 'transparent',
                      color: '#fff',
                      fontWeight: highlighted ? 700 : 500,
                      border: highlighted ? `1px solid ${D.borderLight}` : '1px solid transparent',
                    }}
                  >
                    <Icon size={10} />
                    <span>{key}</span>
                    {badge && (
                      <span style={{
                        fontSize: 7, fontWeight: 800, padding: '1px 4px', borderRadius: 3,
                        background: D.orange, color: '#fff', letterSpacing: 0.4,
                      }}>
                        {badge}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ minHeight: 200 }}>
              {scene === 'events' && <EventsScene />}
              {scene === 'behavior' && <BehaviorScene />}
              {scene === 'sessions' && <SessionsScene />}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#fff', marginTop: 10, marginBottom: 0 }}>
          The same dashboard you get after signup.
        </p>
      </div>
    </div>
  )
}

function EventsScene() {
  const events = [
    { type: 'user_message', data: '{"text":"Why was I charged twice this month?"}', time: '15:42:01', seq: 1 },
    { type: 'tool_call', data: '{"fn":"get_billing","user":8821}', time: '15:42:02', seq: 2, causal: true },
    { type: 'tool_call', data: '{"duplicate_charge":true}', time: '15:42:02', seq: 3, causal: true },
    { type: 'agent_response', data: '{"text":"I don\'t see a duplicate charge."}', time: '15:42:03', seq: 4, warn: true },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 10px', borderRadius: 8, background: D.surface, border: `1px solid ${D.border}`,
        }}>
          <Search size={11} style={{ color: '#fff' }} />
          <span style={{ fontSize: 10, color: '#fff', padding: '7px 0', fontWeight: 500 }}>Semantic search across events…</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px',
          borderRadius: 8, background: D.surface, border: `1px solid ${D.border}`,
          color: '#fff', fontSize: 10, fontWeight: 600,
        }}>
          <RefreshCw size={10} />
          Refresh
        </div>
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
        <FilterPill label="All" active />
        <FilterPill label="user_message (1)" color={EVENT_COLORS.user_message} />
        <FilterPill label="tool_call (2)" color={EVENT_COLORS.tool_call} />
        <FilterPill label="agent_response (1)" color={EVENT_COLORS.agent_response} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {events.map(ev => (
          <DashboardEventRow key={ev.seq} {...ev} />
        ))}
      </div>
    </div>
  )
}

function BehaviorScene() {
  return (
    <div style={{
      padding: '14px 14px', borderRadius: 10,
      background: '#1a0f00', border: `1px solid ${D.orange}40`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Activity size={12} style={{ color: D.orange }} />
        <span style={{ fontSize: 9, fontWeight: 800, color: D.orange, letterSpacing: 0.6 }}>
          NOTICEABLE DRIFT
        </span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
        Drift score: <span style={{ fontFamily: 'ui-monospace, monospace' }}>0.31</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: D.orange, marginLeft: 6 }}>(31 / 100)</span>
      </div>
      <div style={{ fontSize: 11, color: '#fff', lineHeight: 1.55, marginBottom: 10, fontWeight: 500 }}>
        Billing responses changed after prompt v2. Policy links dropped 40%.
      </div>
      <div style={{ height: 5, borderRadius: 100, background: '#0a0a0a', overflow: 'hidden' }}>
        <div style={{ width: '31%', height: '100%', borderRadius: 100, background: D.orange }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
        {[
          { label: 'Sessions affected', value: '23 today', color: D.orange },
          { label: 'Error rate change', value: '+2.4pp', color: D.red },
        ].map(item => (
          <div key={item.label} style={{
            padding: '8px 10px', borderRadius: 8, background: '#0a0a0a', border: `1px solid ${D.border}`,
          }}>
            <div style={{ fontSize: 9, color: '#fff', marginBottom: 2, fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'ui-monospace, monospace', color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SessionsScene() {
  const chain = [
    { type: 'user_message', label: 'user_message', data: '{"text":"Why was I charged twice?"}', root: true },
    { type: 'tool_call', label: 'tool_call', data: '{"fn":"get_billing","user":8821}' },
    { type: 'tool_call', label: 'tool_call', data: '{"duplicate_charge":true}', bad: true },
    { type: 'agent_response', label: 'agent_response', data: '{"text":"No duplicate found"}', bad: true, selected: true },
  ]

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
        Session sess_8821… · {chain.length} events in causal chain
      </div>
      {chain.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < chain.length - 1 ? 0 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <EventDot type={e.type} />
            {i < chain.length - 1 && (
              <div style={{ width: 1, flex: 1, minHeight: 12, background: D.borderLight, margin: '3px 0' }} />
            )}
          </div>
          <div style={{ paddingBottom: 10, flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: D.text }}>{e.label}</span>
              {e.root && <Badge label="root" color={D.green} bg="#1a2a1a" />}
              {e.selected && <Badge label="selected" color={D.red} bg="#2a1a1a" />}
              {e.bad && !e.selected && <Badge label="ignored" color={D.red} bg="rgba(239,68,68,0.12)" />}
            </div>
            <div style={{
              fontSize: 10, fontFamily: 'ui-monospace, monospace', marginTop: 3,
              color: e.bad ? D.red : D.code, lineHeight: 1.4,
            }}>
              {e.data}
            </div>
          </div>
        </div>
      ))}
      <div style={{
        marginTop: 4, padding: '8px 10px', borderRadius: 8,
        background: D.greenBg, border: `1px solid ${D.greenBorder}`,
        fontSize: 10, color: D.green, fontWeight: 700,
      }}>
        Root cause found. Roll back prompt v2.
      </div>
    </div>
  )
}

function DashboardEventRow({
  type,
  data,
  time,
  seq,
  causal,
  warn,
}: {
  type: string
  data: string
  time: string
  seq: number
  causal?: boolean
  warn?: boolean
}) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 8,
      background: warn ? '#1a0f00' : D.surface,
      border: `1px solid ${warn ? `${D.orange}40` : D.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <EventDot type={type} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: D.text }}>{type}</span>
              {causal && <Badge label="causal" color={D.green} bg="#1a2a1a" />}
              {warn && <AlertCircle size={11} style={{ color: D.orange }} />}
            </div>
            <div style={{
              fontSize: 10, fontFamily: 'ui-monospace, monospace', marginTop: 3,
              color: D.code, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {data}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: D.blue, fontWeight: 600 }}>#{seq}</span>
          <span style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: '#fff', fontWeight: 600 }}>{time}</span>
        </div>
      </div>
    </div>
  )
}

function FilterPill({ label, active, color }: { label: string; active?: boolean; color?: string }) {
  const c = color ?? D.green
  return (
    <span style={{
      fontSize: 9, padding: '3px 8px', borderRadius: 100,
      background: active ? `${c}20` : D.surface,
      color: active ? c : '#fff',
      border: `1px solid ${active ? `${c}40` : D.border}`,
    }}>
      {label}
    </span>
  )
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
      background: bg, color,
    }}>
      {label}
    </span>
  )
}

function EventDot({ type }: { type: string }) {
  return (
    <div style={{
      width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 3,
      background: EVENT_COLORS[type] ?? D.blue,
    }} />
  )
}
