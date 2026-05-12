'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getEvents, getWhyChain, getAgentStats,
  getAgentSessions, getMemoryDiff, timeTravel, searchEvents,
} from '@/lib/api'
import { requireAuth } from '@/lib/auth'
import { formatDistanceToNow, format, formatDuration, intervalToDuration } from 'date-fns'
import {
  ChevronLeft, RefreshCw, Search, Clock, GitBranch,
  BarChart2, Layers, Rewind, ChevronDown, ChevronRight,
  AlertCircle, Zap, ArrowRight,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

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

interface Session {
  session_id:       string
  event_count:      number
  event_types:      number
  started_at:       string
  ended_at:         string
  duration_seconds: number
  types:            string[]
}

interface Stats {
  total_events:       number
  unique_event_types: number
  sessions:           number
  first_event:        string | null
  last_event:         string | null
  top_events:         { event: string; count: number }[]
}

interface WhyChain { event_id: string; chain_length: number; chain: Event[] }

type Tab = 'events' | 'sessions' | 'timetravel'
type PanelTab = 'data' | 'why'

const PAGE = 50

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AgentPage() {
  const { id }    = useParams<{ id: string }>()
  const agentId   = decodeURIComponent(id)
  const router    = useRouter()

  const [tab,        setTab]        = useState<Tab>('events')
  const [stats,      setStats]      = useState<Stats | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // ── events tab state ──────────────────────────────────────────────────────
  const [events,        setEvents]        = useState<Event[]>([])
  const [evPage,        setEvPage]        = useState(1)
  const [hasMore,       setHasMore]       = useState(false)
  const [filterType,    setFilterType]    = useState<string | null>(null)
  const [filterSession, setFilterSession] = useState<string | null>(null)
  const [searchQ,       setSearchQ]       = useState('')
  const [searching,     setSearching]     = useState(false)
  const [searchResults, setSearchResults] = useState<Event[] | null>(null)
  const [selected,      setSelected]      = useState<Event | null>(null)
  const [panelTab,      setPanelTab]      = useState<PanelTab>('data')
  const [whyChain,      setWhyChain]      = useState<WhyChain | null>(null)
  const [whyLoading,    setWhyLoading]    = useState(false)
  const [expanded,      setExpanded]      = useState<string | null>(null)

  // ── sessions tab state ────────────────────────────────────────────────────
  const [sessions,      setSessions]      = useState<Session[]>([])
  const [sessLoading,   setSessLoading]   = useState(false)
  const [selSession,    setSelSession]    = useState<Session | null>(null)
  const [sessEvents,    setSessEvents]    = useState<Event[]>([])
  const [sessDiff,      setSessDiff]      = useState<Record<string, unknown> | null>(null)
  const [sessEvLoading, setSessEvLoading] = useState(false)

  // ── time travel state ─────────────────────────────────────────────────────
  const [ttTimestamp,  setTtTimestamp]  = useState('')
  const [ttLoading,    setTtLoading]    = useState(false)
  const [ttResult,     setTtResult]     = useState<Record<string, unknown> | null>(null)
  const [ttError,      setTtError]      = useState('')

  // ── initial load ──────────────────────────────────────────────────────────
  const loadEvents = useCallback(async (pageNum = 1, append = false, session: string | null = null, type: string | null = null) => {
    let token: string
    try { token = requireAuth() } catch { return }
    const params: Record<string, string> = { limit: String(PAGE), offset: String((pageNum - 1) * PAGE) }
    if (session)  params.session_id = session
    if (type)     params.event_type = type
    try {
      const evs = await getEvents(token, agentId, params)
      setEvents(prev => append ? [...prev, ...evs] : evs)
      setHasMore(evs.length === PAGE)
    } catch { router.push('/login') }
  }, [agentId, router])

  const loadStats = useCallback(async () => {
    let token: string
    try { token = requireAuth() } catch { return }
    try {
      const st = await getAgentStats(token, agentId)
      setStats(st)
    } catch {}
  }, [agentId])

  useEffect(() => {
    Promise.all([loadStats(), loadEvents(1)]).finally(() => setLoading(false))
  }, [loadStats, loadEvents])

  // ── refresh ───────────────────────────────────────────────────────────────
  const refresh = async () => {
    setRefreshing(true)
    setEvPage(1)
    setSelected(null)
    setWhyChain(null)
    setSearchResults(null)
    setSearchQ('')
    await Promise.all([loadStats(), loadEvents(1, false, filterSession, filterType)])
    setRefreshing(false)
  }

  // ── load more ─────────────────────────────────────────────────────────────
  const loadMore = async () => {
    const next = evPage + 1
    setEvPage(next)
    await loadEvents(next, true, filterSession, filterType)
  }

  // ── filter by event type ──────────────────────────────────────────────────
  const applyFilter = async (type: string | null) => {
    setFilterType(type)
    setEvPage(1)
    setSelected(null)
    setSearchResults(null)
    await loadEvents(1, false, filterSession, type)
  }

  // ── semantic search ───────────────────────────────────────────────────────
  const doSearch = async () => {
    if (!searchQ.trim()) { setSearchResults(null); return }
    setSearching(true)
    let token: string
    try { token = requireAuth() } catch { return }
    try {
      const res = await searchEvents(token, searchQ.trim(), agentId)
      setSearchResults(res.results ?? res)
    } finally { setSearching(false) }
  }

  // ── select event + causal chain ───────────────────────────────────────────
  const selectEvent = async (ev: Event) => {
    if (selected?.event_id === ev.event_id) { setSelected(null); setWhyChain(null); return }
    setSelected(ev)
    setPanelTab('data')
    setWhyChain(null)
  }

  const loadWhy = async () => {
    if (!selected) return
    if (whyChain?.event_id === selected.event_id) { setPanelTab('why'); return }
    setPanelTab('why')
    setWhyLoading(true)
    let token: string
    try { token = requireAuth() } catch { return }
    try {
      const chain = await getWhyChain(token, selected.event_id)
      setWhyChain(chain)
    } finally { setWhyLoading(false) }
  }

  // ── sessions tab ──────────────────────────────────────────────────────────
  const loadSessions = async () => {
    if (sessions.length > 0) return
    setSessLoading(true)
    let token: string
    try { token = requireAuth() } catch { return }
    try {
      const s = await getAgentSessions(token, agentId)
      setSessions(s)
    } finally { setSessLoading(false) }
  }

  const openSession = async (sess: Session) => {
    setSelSession(sess)
    setSessEvLoading(true)
    setSessDiff(null)
    let token: string
    try { token = requireAuth() } catch { return }
    try {
      const [evs, diff] = await Promise.all([
        getEvents(token, agentId, { session_id: sess.session_id, limit: '200' }),
        getMemoryDiff(token, sess.session_id).catch(() => null),
      ])
      setSessEvents(evs)
      setSessDiff(diff)
    } finally { setSessEvLoading(false) }
  }

  // ── time travel ───────────────────────────────────────────────────────────
  const doTimeTravel = async () => {
    if (!ttTimestamp) { setTtError('Pick a date and time first.'); return }
    setTtError('')
    setTtLoading(true)
    setTtResult(null)
    let token: string
    try { token = requireAuth() } catch { return }
    try {
      const iso = new Date(ttTimestamp).toISOString()
      const result = await timeTravel(token, agentId, iso)
      setTtResult(result)
    } catch (e: unknown) {
      setTtError(e instanceof Error ? e.message : 'Failed to reconstruct state.')
    } finally { setTtLoading(false) }
  }

  if (loading) return <Shell agentId={agentId}><Skeleton /></Shell>

  const displayEvents = searchResults ?? events

  return (
    <Shell agentId={agentId}>
      {/* ── Stats ── */}
      {stats && <StatsRow stats={stats} />}

      {/* ── Tab bar ── */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}>
        {([
          { key: 'events',     label: 'Events',      icon: BarChart2 },
          { key: 'sessions',   label: 'Sessions',    icon: Layers },
          { key: 'timetravel', label: 'Time Travel', icon: Rewind },
        ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); if (key === 'sessions') loadSessions() }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition"
            style={{
              background: tab === key ? '#1a1a1a' : 'transparent',
              color:      tab === key ? '#e5e5e5' : '#525252',
              border:     tab === key ? '1px solid #2a2a2a' : '1px solid transparent',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════ EVENTS TAB ══════════════════ */}
      {tab === 'events' && (
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">

            {/* Search + refresh */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 flex items-center gap-2 rounded-lg px-3"
                   style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                <Search size={13} style={{ color: '#525252' }} />
                <input
                  className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                  style={{ color: '#e5e5e5' }}
                  placeholder="Semantic search across events…"
                  value={searchQ}
                  onChange={e => { setSearchQ(e.target.value); if (!e.target.value) setSearchResults(null) }}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                />
                {searchQ && (
                  <button onClick={doSearch} className="text-xs px-2 py-1 rounded"
                          style={{ background: '#22c55e20', color: '#22c55e' }}>
                    {searching ? '…' : 'Search'}
                  </button>
                )}
              </div>
              <button onClick={refresh}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition"
                      style={{ background: '#111', color: '#737373', border: '1px solid #1f1f1f' }}>
                <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Event type filter pills */}
            {stats && stats.top_events.length > 0 && !searchResults && (
              <div className="flex gap-1.5 flex-wrap mb-4">
                <FilterPill label="All" active={!filterType} onClick={() => applyFilter(null)} />
                {stats.top_events.map(e => (
                  <FilterPill
                    key={e.event}
                    label={`${e.event} (${e.count})`}
                    active={filterType === e.event}
                    onClick={() => applyFilter(filterType === e.event ? null : e.event)}
                    color={eventColor(e.event)}
                  />
                ))}
              </div>
            )}

            {searchResults && (
              <div className="flex items-center justify-between mb-3 text-xs" style={{ color: '#737373' }}>
                <span>{searchResults.length} semantic results for "{searchQ}"</span>
                <button onClick={() => { setSearchResults(null); setSearchQ('') }}
                        style={{ color: '#525252' }}>Clear</button>
              </div>
            )}

            {/* Event list */}
            <EventList
              events={displayEvents}
              selected={selected}
              expanded={expanded}
              onSelect={selectEvent}
              onToggleExpand={id => setExpanded(expanded === id ? null : id)}
            />

            {!searchResults && hasMore && (
              <button onClick={loadMore}
                      className="w-full mt-4 py-2.5 rounded-lg text-sm transition"
                      style={{ background: '#111', color: '#737373', border: '1px solid #1f1f1f' }}>
                Load more
              </button>
            )}

            {displayEvents.length === 0 && (
              <div className="text-center py-12 text-sm" style={{ color: '#525252' }}>
                No events found.
              </div>
            )}
          </div>

          {/* Side panel */}
          {selected && (
            <div className="w-80 shrink-0">
              <div className="flex mb-2 rounded-xl overflow-hidden"
                   style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                <PanelTabBtn label="Data"         active={panelTab === 'data'} onClick={() => setPanelTab('data')} />
                <PanelTabBtn label="Why? (causal)" active={panelTab === 'why'}  onClick={loadWhy} />
              </div>

              <div className="rounded-xl p-4 sticky top-4 overflow-auto max-h-[80vh]"
                   style={{ background: '#111', border: '1px solid #1f1f1f' }}>

                {panelTab === 'data' && (
                  <DataPanel event={selected} />
                )}

                {panelTab === 'why' && (
                  whyLoading ? (
                    <div className="text-sm animate-pulse py-4 text-center" style={{ color: '#737373' }}>
                      Tracing causal chain…
                    </div>
                  ) : whyChain ? (
                    <WhyPanel chain={whyChain} />
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ SESSIONS TAB ══════════════════ */}
      {tab === 'sessions' && (
        <div className="flex gap-4">
          {/* Session list */}
          <div className="w-72 shrink-0">
            <h2 className="text-xs font-medium mb-3" style={{ color: '#737373' }}>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </h2>
            {sessLoading ? (
              <Skeleton rows={5} />
            ) : sessions.length === 0 ? (
              <div className="text-sm py-8 text-center" style={{ color: '#525252' }}>
                No sessions recorded yet.<br />
                <span className="text-xs">Pass a <code className="text-green-400">session_id</code> when logging events.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sessions.map(s => (
                  <button key={s.session_id}
                          onClick={() => openSession(s)}
                          className="w-full text-left rounded-xl p-3.5 transition"
                          style={{
                            background: selSession?.session_id === s.session_id ? '#0f1f0f' : '#111',
                            border: `1px solid ${selSession?.session_id === s.session_id ? '#22c55e40' : '#1f1f1f'}`,
                          }}>
                    <div className="text-xs font-mono mb-1 truncate" style={{ color: '#a3a3a3' }}>
                      {s.session_id.slice(0, 20)}…
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#525252' }}>
                        {s.event_count} events · {s.event_types} types
                      </span>
                      <span className="text-xs" style={{ color: '#525252' }}>
                        {s.duration_seconds > 0
                          ? formatDuration(intervalToDuration({ start: 0, end: s.duration_seconds * 1000 }), { format: ['hours', 'minutes', 'seconds'] }).replace(' seconds', 's').replace(' minutes', 'm').replace(' hours', 'h') || '<1s'
                          : '<1s'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.types.slice(0, 4).map(t => (
                        <span key={t} className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: `${eventColor(t)}20`, color: eventColor(t) }}>
                          {t}
                        </span>
                      ))}
                      {s.types.length > 4 && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#525252' }}>
                          +{s.types.length - 4}
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-1.5" style={{ color: '#404040' }}>
                      {format(new Date(s.started_at), 'MMM d, HH:mm:ss')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Session detail */}
          <div className="flex-1 min-w-0">
            {!selSession ? (
              <div className="flex flex-col items-center justify-center h-64" style={{ color: '#525252' }}>
                <Layers size={32} className="mb-3 opacity-30" />
                <p className="text-sm">Select a session to inspect its events</p>
              </div>
            ) : sessEvLoading ? (
              <Skeleton rows={6} />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-medium text-white font-mono">{selSession.session_id}</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#525252' }}>
                      {format(new Date(selSession.started_at), 'MMM d yyyy, HH:mm:ss')}
                      {' → '}
                      {format(new Date(selSession.ended_at), 'HH:mm:ss')}
                    </p>
                  </div>
                  {sessDiff && (
                    <div className="text-xs px-3 py-1.5 rounded-lg" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      {(sessDiff as { new_event_types?: string[] }).new_event_types?.length
                        ? <span style={{ color: '#22c55e' }}>{(sessDiff as { new_event_types: string[] }).new_event_types.length} new event type{(sessDiff as { new_event_types: string[] }).new_event_types.length !== 1 ? 's' : ''}</span>
                        : <span style={{ color: '#525252' }}>No new event types</span>}
                    </div>
                  )}
                </div>

                {sessDiff && (sessDiff as { summary?: string }).summary && (
                  <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#0f1a0f', border: '1px solid #22c55e20', color: '#86efac' }}>
                    {(sessDiff as { summary: string }).summary}
                  </div>
                )}

                <EventList
                  events={sessEvents}
                  selected={null}
                  expanded={expanded}
                  onSelect={() => {}}
                  onToggleExpand={id => setExpanded(expanded === id ? null : id)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ TIME TRAVEL TAB ══════════════════ */}
      {tab === 'timetravel' && (
        <div className="max-w-2xl">
          <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: '#0d0d0d', border: '1px solid #1f1f1f', color: '#737373' }}>
            <div className="flex items-center gap-2 mb-1">
              <Rewind size={14} style={{ color: '#22c55e' }} />
              <span className="text-white font-medium">Time Travel</span>
            </div>
            Reconstruct the exact state of <span className="font-mono text-white">{agentId}</span> at any point in time.
            See every event that had happened up to that moment.
          </div>

          <div className="flex gap-3 mb-6">
            <input
              type="datetime-local"
              value={ttTimestamp}
              onChange={e => setTtTimestamp(e.target.value)}
              className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: '#111', border: '1px solid #2a2a2a', color: '#e5e5e5', colorScheme: 'dark' }}
            />
            <button
              onClick={doTimeTravel}
              disabled={ttLoading || !ttTimestamp}
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#166534,#15803d)', color: '#dcfce7' }}
            >
              {ttLoading ? 'Reconstructing…' : 'Reconstruct state'}
            </button>
          </div>

          {ttError && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
                 style={{ background: '#1a0000', border: '1px solid #ef444440', color: '#f87171' }}>
              <AlertCircle size={14} />
              {ttError}
            </div>
          )}

          {ttResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                  <div className="text-xs mb-1" style={{ color: '#737373' }}>Events at this time</div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {(ttResult as { event_count: number }).event_count}
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                  <div className="text-xs mb-1" style={{ color: '#737373' }}>Reconstructed at</div>
                  <div className="text-sm font-mono text-white">
                    {format(new Date(ttTimestamp), 'MMM d yyyy, HH:mm:ss')}
                  </div>
                </div>
              </div>

              {/* State */}
              <div className="rounded-xl" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#1f1f1f' }}>
                  <Zap size={13} style={{ color: '#22c55e' }} />
                  <span className="text-sm font-medium text-white">Reconstructed state</span>
                  <span className="text-xs ml-auto" style={{ color: '#525252' }}>
                    Based on all STATE_SET events up to this point
                  </span>
                </div>
                <pre className="p-4 text-xs overflow-x-auto" style={{ color: '#86efac', maxHeight: 300 }}>
                  {JSON.stringify((ttResult as { state: unknown }).state, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Quick picks */}
          {stats?.last_event && !ttResult && (
            <div>
              <div className="text-xs mb-2" style={{ color: '#525252' }}>Quick picks</div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: '1 hour ago',  ms: 60 * 60 * 1000 },
                  { label: '6 hours ago', ms: 6 * 60 * 60 * 1000 },
                  { label: '1 day ago',   ms: 24 * 60 * 60 * 1000 },
                  { label: '1 week ago',  ms: 7 * 24 * 60 * 60 * 1000 },
                ].map(({ label, ms }) => {
                  const dt = new Date(Date.now() - ms)
                  const val = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}T${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
                  return (
                    <button key={label} onClick={() => setTtTimestamp(val)}
                            className="text-xs px-3 py-1.5 rounded-lg transition"
                            style={{ background: '#111', color: '#737373', border: '1px solid #1f1f1f' }}>
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Shell>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatsRow({ stats }: { stats: Stats }) {
  const errorCount = stats.top_events.find(e => e.event === 'error')?.count ?? 0
  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {[
        { label: 'Total events',  value: stats.total_events.toLocaleString(),          icon: BarChart2,   color: '#e5e5e5' },
        { label: 'Event types',   value: stats.unique_event_types,                     icon: GitBranch,   color: '#e5e5e5' },
        { label: 'Sessions',      value: stats.sessions,                               icon: Layers,      color: '#e5e5e5' },
        { label: 'Last event',    value: stats.last_event ? formatDistanceToNow(new Date(stats.last_event), { addSuffix: true }) : '—', icon: Clock, color: '#e5e5e5' },
        { label: 'Errors',        value: errorCount,                                   icon: AlertCircle, color: errorCount > 0 ? '#ef4444' : '#525252' },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Icon size={12} style={{ color: '#737373' }} />
            <span className="text-xs" style={{ color: '#737373' }}>{label}</span>
          </div>
          <div className="font-semibold font-mono text-lg" style={{ color }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

function EventList({ events, selected, expanded, onSelect, onToggleExpand }: {
  events: Event[]
  selected: Event | null
  expanded: string | null
  onSelect: (e: Event) => void
  onToggleExpand: (id: string) => void
}) {
  const grouped = groupBySession(events)
  return (
    <div className="space-y-4">
      {grouped.map(({ sessionId, events: evs }) => (
        <div key={sessionId ?? '__none__'}>
          {sessionId && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded shrink-0"
                    style={{ background: '#1a1a1a', color: '#404040', border: '1px solid #2a2a2a' }}>
                session {sessionId.slice(0, 14)}…
              </span>
              <div className="flex-1 h-px" style={{ background: '#1a1a1a' }} />
              <span className="text-xs shrink-0" style={{ color: '#404040' }}>{evs.length} events</span>
            </div>
          )}
          <div className="space-y-1">
            {evs.map(ev => {
              const isSelected = selected?.event_id === ev.event_id
              const isExpanded = expanded === ev.event_id
              return (
                <div key={ev.event_id}>
                  <button
                    onClick={() => onSelect(ev)}
                    className="w-full text-left rounded-lg px-4 py-3 transition group"
                    style={{
                      background: isSelected ? '#0f1f0f' : '#111',
                      border: `1px solid ${isSelected ? '#22c55e40' : '#1f1f1f'}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <EventDot type={ev.event} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono" style={{ color: '#e5e5e5' }}>{ev.event}</span>
                            {ev.parent_id && (
                              <span className="text-xs px-1.5 py-0.5 rounded"
                                    style={{ background: '#1a2a1a', color: '#22c55e' }}>
                                causal
                              </span>
                            )}
                            {ev.event === 'error' && (
                              <AlertCircle size={12} style={{ color: '#ef4444' }} />
                            )}
                          </div>
                          <div className="text-xs font-mono mt-0.5 truncate" style={{ color: '#404040' }}>
                            {JSON.stringify(ev.data).slice(0, 90)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-xs font-mono" style={{ color: '#404040' }}>#{ev.sequence_no}</span>
                        <span className="text-xs font-mono" style={{ color: '#525252' }}>{format(new Date(ev.timestamp), 'HH:mm:ss')}</span>
                      </div>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="mx-0.5 rounded-b-lg" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderTop: 'none' }}>
                      <button
                        onClick={() => onToggleExpand(ev.event_id)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs"
                        style={{ color: '#525252' }}
                      >
                        {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        Full payload
                      </button>
                      {isExpanded && (
                        <pre className="px-4 pb-3 text-xs overflow-x-auto" style={{ color: '#86efac', maxHeight: 240 }}>
                          {JSON.stringify(ev.data, null, 2)}
                        </pre>
                      )}
                      <div className="px-4 pb-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: '#404040' }}>
                        <span>id: <span className="font-mono">{ev.event_id.slice(0, 18)}…</span></span>
                        {ev.session_id && <span>session: <span className="font-mono">{ev.session_id.slice(0, 12)}…</span></span>}
                        <span>{format(new Date(ev.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}</span>
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
  )
}

function DataPanel({ event }: { event: Event }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <EventDot type={event.event} />
        <span className="font-mono font-semibold text-sm" style={{ color: '#e5e5e5' }}>{event.event}</span>
      </div>
      <pre className="text-xs overflow-x-auto rounded-lg p-3 mb-3"
           style={{ background: '#0a0a0a', color: '#86efac', maxHeight: 280 }}>
        {JSON.stringify(event.data, null, 2)}
      </pre>
      <div className="space-y-2">
        <MetaRow label="event_id"    value={event.event_id} />
        <MetaRow label="sequence"    value={`#${event.sequence_no}`} />
        <MetaRow label="timestamp"   value={format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')} />
        {event.session_id && <MetaRow label="session_id" value={event.session_id} />}
        {event.parent_id  && <MetaRow label="parent_id"  value={event.parent_id} />}
      </div>
    </div>
  )
}

function WhyPanel({ chain }: { chain: WhyChain }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={13} style={{ color: '#22c55e' }} />
        <span className="text-xs font-medium" style={{ color: '#a3a3a3' }}>
          {chain.chain_length} event{chain.chain_length !== 1 ? 's' : ''} in causal chain
        </span>
      </div>
      <div className="space-y-0">
        {chain.chain.map((e, i) => (
          <div key={e.event_id} className="flex gap-3">
            {/* Connector */}
            <div className="flex flex-col items-center">
              <EventDot type={e.event} />
              {i < chain.chain.length - 1 && (
                <div className="w-px flex-1 my-1" style={{ background: '#2a2a2a', minHeight: 16 }} />
              )}
            </div>
            <div className="pb-3 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium" style={{ color: '#e5e5e5' }}>{e.event}</span>
                {i === 0 && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#1a2a1a', color: '#22c55e' }}>root</span>}
                {i === chain.chain.length - 1 && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#2a1a1a', color: '#f87171' }}>selected</span>}
              </div>
              <div className="text-xs font-mono truncate mt-0.5" style={{ color: '#525252' }}>
                {JSON.stringify(e.data).slice(0, 55)}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs" style={{ color: '#404040' }}>{format(new Date(e.timestamp), 'HH:mm:ss.SSS')}</span>
                {i < chain.chain.length - 1 && <ArrowRight size={10} style={{ color: '#2a2a2a' }} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupBySession(events: Event[]) {
  const map = new Map<string, Event[]>()
  const order: string[] = []
  for (const e of events) {
    const key = e.session_id ?? '__none__'
    if (!map.has(key)) { map.set(key, []); order.push(key) }
    map.get(key)!.push(e)
  }
  return order.map(k => ({ sessionId: k === '__none__' ? null : k, events: map.get(k)! }))
}

function eventColor(type: string): string {
  const map: Record<string, string> = {
    tool_call:      '#3b82f6',
    user_message:   '#8b5cf6',
    assistant:      '#8b5cf6',
    agent_response: '#22c55e',
    error:          '#ef4444',
    knowledge:      '#f59e0b',
    conversation:   '#06b6d4',
    handoff:        '#06b6d4',
    generation_start: '#a78bfa',
    post_generated:   '#34d399',
    image_generated:  '#fb923c',
  }
  return map[type] ?? '#525252'
}

function EventDot({ type, size = 'md' }: { type: string; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-1.5 h-1.5 mt-1.5' : 'w-2 h-2 mt-1'
  return <div className={`${s} rounded-full shrink-0`} style={{ background: eventColor(type) }} />
}

function FilterPill({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-2.5 py-1 rounded-full transition"
      style={{
        background: active ? `${color ?? '#22c55e'}20` : '#111',
        color:      active ? (color ?? '#22c55e') : '#525252',
        border:     `1px solid ${active ? (color ?? '#22c55e') + '40' : '#1f1f1f'}`,
      }}
    >
      {label}
    </button>
  )
}

function PanelTabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex-1 py-2 text-xs font-medium transition"
            style={{ background: active ? '#1a1a1a' : 'transparent', color: active ? '#e5e5e5' : '#525252' }}>
      {label}
    </button>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="font-mono shrink-0" style={{ color: '#525252', minWidth: 80 }}>{label}</span>
      <span className="font-mono break-all" style={{ color: '#404040' }}>{value}</span>
    </div>
  )
}

function Shell({ agentId, children }: { agentId: string; children: React.ReactNode }) {
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
        <ChevronLeft size={15} /> Agents
      </button>
      <h1 className="text-white font-semibold text-xl font-mono mb-6">{agentId}</h1>
      {children}
    </div>
  )
}

function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: '#111' }} />
      ))}
    </div>
  )
}
