'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getEvents, getWhyChain, getAgentStats } from '@/lib/api'
import { requireAuth } from '@/lib/auth'
import { formatDistanceToNow, format } from 'date-fns'
import { ChevronLeft, GitBranch, Clock, BarChart2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'

interface Event {
  event_id:    string
  agent:       string
  timestamp:   string
  event:       string
  data:        Record<string, unknown>
  parent_id:   string | null
  session_id:  string | null
  sequence_no: number
}

interface WhyChain {
  event_id:     string
  chain_length: number
  chain:        Event[]
}

const PAGE_SIZE = 50

export default function AgentPage() {
  const { id } = useParams<{ id: string }>()
  const agentId = decodeURIComponent(id)
  const router   = useRouter()

  const [events,        setEvents]        = useState<Event[]>([])
  const [stats,         setStats]         = useState<Record<string, unknown> | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [whyChain,      setWhyChain]      = useState<WhyChain | null>(null)
  const [loadingWhy,    setLoadingWhy]    = useState(false)
  const [loading,       setLoading]       = useState(true)
  const [refreshing,    setRefreshing]    = useState(false)
  const [page,          setPage]          = useState(1)
  const [hasMore,       setHasMore]       = useState(false)
  const [expandedData,  setExpandedData]  = useState<string | null>(null)
  const [activeTab,     setActiveTab]     = useState<'data' | 'why'>('data')

  const load = useCallback(async (pageNum = 1, append = false) => {
    let token: string
    try { token = requireAuth() } catch { return }

    try {
      const [evs, st] = await Promise.all([
        getEvents(token, agentId, { limit: String(PAGE_SIZE), offset: String((pageNum - 1) * PAGE_SIZE) }),
        pageNum === 1 ? getAgentStats(token, agentId) : Promise.resolve(null),
      ])
      setEvents(prev => append ? [...prev, ...evs] : evs)
      if (st) setStats(st)
      setHasMore(evs.length === PAGE_SIZE)
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [agentId, router])

  useEffect(() => { load(1) }, [load])

  const refresh = async () => {
    setRefreshing(true)
    setPage(1)
    setSelectedEvent(null)
    setWhyChain(null)
    await load(1)
  }

  const loadMore = async () => {
    const next = page + 1
    setPage(next)
    await load(next, true)
  }

  async function handleSelectEvent(event: Event) {
    if (selectedEvent?.event_id === event.event_id) {
      setSelectedEvent(null)
      setWhyChain(null)
      return
    }
    setSelectedEvent(event)
    setActiveTab('data')
    setWhyChain(null)
  }

  async function handleWhy() {
    if (!selectedEvent) return
    setActiveTab('why')
    if (whyChain?.event_id === selectedEvent.event_id) return
    setLoadingWhy(true)
    try {
      const token = requireAuth()
      const chain = await getWhyChain(token, selectedEvent.event_id)
      setWhyChain(chain)
    } finally {
      setLoadingWhy(false)
    }
  }

  // Group events by session
  const grouped = groupBySession(events)

  if (loading) return <PageShell agentId={agentId}><Skeleton /></PageShell>

  return (
    <PageShell agentId={agentId}>
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total events',  value: (stats.total_events as number).toLocaleString(), icon: BarChart2 },
            { label: 'Event types',   value: stats.unique_event_types as number,              icon: GitBranch },
            { label: 'Sessions',      value: stats.sessions as number,                        icon: Clock },
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
        {/* Event log */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium" style={{ color: '#a3a3a3' }}>
              Event log ({events.length}{hasMore ? '+' : ''})
            </h2>
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition"
              style={{ background: '#1a1a1a', color: '#a3a3a3', border: '1px solid #2a2a2a' }}
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {grouped.map(({ sessionId, events: sessionEvents }) => (
              <div key={sessionId ?? 'no-session'}>
                {sessionId && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-xs font-mono px-2 py-0.5 rounded"
                         style={{ background: '#1a1a1a', color: '#525252', border: '1px solid #2a2a2a' }}>
                      session: {sessionId.slice(0, 16)}…
                    </div>
                    <div className="flex-1 h-px" style={{ background: '#1f1f1f' }} />
                  </div>
                )}

                <div className="space-y-1">
                  {sessionEvents.map(event => {
                    const isSelected = selectedEvent?.event_id === event.event_id
                    const isExpanded = expandedData === event.event_id
                    return (
                      <div key={event.event_id}>
                        <button
                          onClick={() => handleSelectEvent(event)}
                          className="w-full text-left rounded-lg px-4 py-3 transition"
                          style={{
                            background: isSelected ? '#0f1f0f' : '#111',
                            border: `1px solid ${isSelected ? '#22c55e40' : '#1f1f1f'}`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <EventDot type={event.event} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono" style={{ color: '#e5e5e5' }}>
                                    {event.event}
                                  </span>
                                  {event.parent_id && (
                                    <span className="text-xs px-1.5 py-0.5 rounded shrink-0"
                                          style={{ background: '#1a2a1a', color: '#22c55e' }}>
                                      causal
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-mono mt-0.5 truncate" style={{ color: '#525252' }}>
                                  {JSON.stringify(event.data).slice(0, 100)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-3">
                              <span className="text-xs font-mono" style={{ color: '#525252' }}>
                                #{event.sequence_no}
                              </span>
                              <span className="text-xs font-mono" style={{ color: '#525252' }}>
                                {format(new Date(event.timestamp), 'HH:mm:ss')}
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Inline expanded data */}
                        {isSelected && (
                          <div className="mx-1 mb-1 rounded-b-lg overflow-hidden"
                               style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderTop: 'none' }}>
                            <button
                              onClick={() => setExpandedData(isExpanded ? null : event.event_id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs transition"
                              style={{ color: '#525252' }}
                            >
                              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              Full payload
                            </button>
                            {isExpanded && (
                              <pre className="px-4 pb-4 text-xs overflow-x-auto" style={{ color: '#86efac' }}>
                                {JSON.stringify(event.data, null, 2)}
                              </pre>
                            )}
                            <div className="px-4 pb-3 flex items-center gap-4 text-xs" style={{ color: '#525252' }}>
                              <span>id: <span className="font-mono" style={{ color: '#404040' }}>{event.event_id}</span></span>
                              {event.session_id && (
                                <span>session: <span className="font-mono" style={{ color: '#404040' }}>{event.session_id.slice(0, 12)}…</span></span>
                              )}
                              <span>{format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full mt-4 py-2.5 rounded-lg text-sm transition"
              style={{ background: '#111', color: '#737373', border: '1px solid #1f1f1f' }}
            >
              Load more
            </button>
          )}

          {events.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: '#525252' }}>
              No events logged yet.
            </div>
          )}
        </div>

        {/* Side panel — data + why */}
        {selectedEvent && (
          <div className="w-80 shrink-0">
            {/* Tab bar */}
            <div className="flex mb-3 rounded-lg overflow-hidden" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
              {(['data', 'why'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => tab === 'why' ? handleWhy() : setActiveTab('data')}
                  className="flex-1 py-2 text-xs font-medium transition"
                  style={{
                    background: activeTab === tab ? '#1a1a1a' : 'transparent',
                    color: activeTab === tab ? '#e5e5e5' : '#525252',
                  }}
                >
                  {tab === 'data' ? 'Event data' : 'Why? (causal chain)'}
                </button>
              ))}
            </div>

            <div className="rounded-xl p-4 sticky top-4" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
              {activeTab === 'data' ? (
                <div>
                  <div className="text-xs mb-1 font-mono font-semibold" style={{ color: '#22c55e' }}>
                    {selectedEvent.event}
                  </div>
                  <div className="text-xs mb-3" style={{ color: '#525252' }}>
                    {format(new Date(selectedEvent.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}
                  </div>
                  <pre className="text-xs overflow-x-auto rounded-lg p-3"
                       style={{ background: '#0a0a0a', color: '#86efac', maxHeight: '400px' }}>
                    {JSON.stringify(selectedEvent.data, null, 2)}
                  </pre>
                  <div className="mt-3 space-y-1.5">
                    <MetaRow label="event_id"    value={selectedEvent.event_id} />
                    <MetaRow label="sequence_no" value={`#${selectedEvent.sequence_no}`} />
                    {selectedEvent.session_id  && <MetaRow label="session_id"  value={selectedEvent.session_id} />}
                    {selectedEvent.parent_id   && <MetaRow label="parent_id"   value={selectedEvent.parent_id} />}
                  </div>
                </div>
              ) : loadingWhy ? (
                <div className="text-sm animate-pulse" style={{ color: '#737373' }}>
                  Tracing causality…
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
                          <div className="absolute left-1.5 top-6 bottom-0 w-px"
                               style={{ background: '#2a2a2a' }} />
                        )}
                        <div className="flex gap-3">
                          <EventDot type={e.event} size="sm" />
                          <div className="flex-1 min-w-0 pb-3">
                            <div className="text-xs font-mono font-medium" style={{ color: '#e5e5e5' }}>
                              {e.event}
                            </div>
                            <div className="text-xs mt-0.5 font-mono truncate" style={{ color: '#525252' }}>
                              {JSON.stringify(e.data).slice(0, 60)}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: '#404040' }}>
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupBySession(events: Event[]): { sessionId: string | null; events: Event[] }[] {
  const map = new Map<string, Event[]>()
  const order: string[] = []

  for (const e of events) {
    const key = e.session_id ?? '__none__'
    if (!map.has(key)) { map.set(key, []); order.push(key) }
    map.get(key)!.push(e)
  }

  return order.map(key => ({
    sessionId: key === '__none__' ? null : key,
    events: map.get(key)!,
  }))
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="shrink-0 font-mono" style={{ color: '#525252', minWidth: 80 }}>{label}</span>
      <span className="font-mono break-all" style={{ color: '#404040' }}>{value}</span>
    </div>
  )
}

function EventDot({ type, size = 'md' }: { type: string; size?: 'sm' | 'md' }) {
  const colors: Record<string, string> = {
    tool_call:      '#3b82f6',
    user_message:   '#8b5cf6',
    assistant:      '#8b5cf6',
    agent_response: '#22c55e',
    error:          '#ef4444',
    knowledge:      '#f59e0b',
    conversation:   '#06b6d4',
    handoff:        '#06b6d4',
    STATE_SET:      '#f59e0b',
  }
  const color = colors[type] ?? '#525252'
  const s = size === 'sm' ? 'w-1.5 h-1.5 mt-1.5' : 'w-2 h-2 mt-1'
  return <div className={`${s} rounded-full shrink-0`} style={{ background: color }} />
}

function PageShell({ agentId, children }: { agentId: string; children: React.ReactNode }) {
  const router = useRouter()
  return (
    <div className="p-8 max-w-6xl mx-auto">
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
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: '#111' }} />
      ))}
    </div>
  )
}
