'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getEvents, getWhyChain, getAgentStats } from '@/lib/api'
import { requireAuth } from '@/lib/auth'
import { formatDistanceToNow, format } from 'date-fns'
import { ChevronLeft, GitBranch, Clock, BarChart2 } from 'lucide-react'

interface Event {
  event_id: string
  agent: string
  timestamp: string
  event: string
  data: Record<string, unknown>
  parent_id: string | null
  session_id: string | null
  sequence_no: number
}

interface WhyChain {
  event_id: string
  chain_length: number
  chain: Event[]
}

export default function AgentPage() {
  const { id } = useParams<{ id: string }>()
  const agentId = decodeURIComponent(id)
  const router = useRouter()

  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [whyChain, setWhyChain] = useState<WhyChain | null>(null)
  const [loadingWhy, setLoadingWhy] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let token: string
    try { token = requireAuth() } catch { return }

    Promise.all([
      getEvents(token, agentId, { limit: '100' }),
      getAgentStats(token, agentId),
    ]).then(([evs, st]) => {
      setEvents(evs)
      setStats(st)
    }).catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [agentId, router])

  async function handleWhy(event: Event) {
    if (selectedEvent?.event_id === event.event_id) {
      setSelectedEvent(null)
      setWhyChain(null)
      return
    }
    setSelectedEvent(event)
    setLoadingWhy(true)
    try {
      const token = requireAuth()
      const chain = await getWhyChain(token, event.event_id)
      setWhyChain(chain)
    } finally {
      setLoadingWhy(false)
    }
  }

  if (loading) return <PageShell agentId={agentId}><Skeleton /></PageShell>

  return (
    <PageShell agentId={agentId}>
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total events', value: (stats.total_events as number).toLocaleString(), icon: BarChart2 },
            { label: 'Event types', value: stats.unique_event_types as number, icon: GitBranch },
            { label: 'Sessions', value: stats.sessions as number, icon: Clock },
            {
              label: 'Last event',
              value: stats.last_event
                ? formatDistanceToNow(new Date(stats.last_event as string), { addSuffix: true })
                : '—',
              icon: Clock,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} style={{ color: '#737373' }} />
                <span className="text-xs" style={{ color: '#737373' }}>{label}</span>
              </div>
              <div className="text-white font-semibold font-mono text-lg">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        {/* Event timeline */}
        <div className="flex-1">
          <h2 className="text-sm font-medium mb-3" style={{ color: '#a3a3a3' }}>
            Event timeline
          </h2>
          <div className="space-y-1">
            {events.map(event => (
              <button
                key={event.event_id}
                onClick={() => handleWhy(event)}
                className="w-full text-left rounded-lg px-4 py-3 transition"
                style={{
                  background: selectedEvent?.event_id === event.event_id ? '#1a2e1a' : '#111',
                  border: `1px solid ${selectedEvent?.event_id === event.event_id ? '#22c55e40' : '#1f1f1f'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <EventDot type={event.event} />
                    <div>
                      <span className="text-sm font-mono" style={{ color: '#e5e5e5' }}>
                        {event.event}
                      </span>
                      {event.parent_id && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded"
                              style={{ background: '#1a2a1a', color: '#22c55e' }}>
                          linked
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-mono" style={{ color: '#525252' }}>
                    {format(new Date(event.timestamp), 'HH:mm:ss')}
                  </span>
                </div>
                <div className="mt-1.5 text-xs font-mono truncate" style={{ color: '#525252' }}>
                  {JSON.stringify(event.data).slice(0, 80)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Why panel */}
        {selectedEvent && (
          <div className="w-80 shrink-0">
            <h2 className="text-sm font-medium mb-3" style={{ color: '#a3a3a3' }}>
              Causal chain
            </h2>
            <div className="rounded-xl p-4 sticky top-0" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
              {loadingWhy ? (
                <div className="text-sm animate-pulse" style={{ color: '#737373' }}>
                  Tracing causality...
                </div>
              ) : whyChain ? (
                <div>
                  <div className="text-xs mb-3" style={{ color: '#737373' }}>
                    {whyChain.chain_length} event{whyChain.chain_length !== 1 ? 's' : ''} in chain
                  </div>
                  <div className="space-y-2">
                    {whyChain.chain.map((e, i) => (
                      <div key={e.event_id} className="relative">
                        {i < whyChain.chain.length - 1 && (
                          <div className="absolute left-3 top-7 bottom-0 w-px"
                               style={{ background: '#2a2a2a' }} />
                        )}
                        <div className="flex gap-3">
                          <EventDot type={e.event} size="sm" />
                          <div className="flex-1 min-w-0 pb-3">
                            <div className="text-xs font-mono font-medium" style={{ color: '#e5e5e5' }}>
                              {e.event}
                            </div>
                            <div className="text-xs mt-0.5 truncate font-mono" style={{ color: '#525252' }}>
                              {JSON.stringify(e.data).slice(0, 50)}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: '#525252' }}>
                              {format(new Date(e.timestamp), 'HH:mm:ss.SSS')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}

function EventDot({ type, size = 'md' }: { type: string; size?: 'sm' | 'md' }) {
  const colors: Record<string, string> = {
    tool_call: '#3b82f6',
    user_message: '#8b5cf6',
    agent_response: '#22c55e',
    error: '#ef4444',
    STATE_SET: '#f59e0b',
    handoff: '#06b6d4',
  }
  const color = colors[type] ?? '#525252'
  const s = size === 'sm' ? 'w-1.5 h-1.5 mt-1.5' : 'w-2 h-2 mt-0.5'

  return (
    <div className={`${s} rounded-full shrink-0`} style={{ background: color }} />
  )
}

function PageShell({ agentId, children }: { agentId: string; children: React.ReactNode }) {
  const router = useRouter()
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 text-sm mb-6 transition"
        style={{ color: '#737373' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#e5e5e5')}
        onMouseLeave={e => (e.currentTarget.style.color = '#737373')}
      >
        <ChevronLeft size={15} />
        Agents
      </button>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-white font-semibold text-xl font-mono">{agentId}</h1>
      </div>
      {children}
    </div>
  )
}

function Skeleton() {
  return <div className="space-y-2">{[1,2,3,4,5].map(i =>
    <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: '#111' }} />
  )}</div>
}
