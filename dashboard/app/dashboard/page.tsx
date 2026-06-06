'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAgents } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'
import { Zap } from 'lucide-react'
import { GettingStartedChecklist } from '@/components/ConnectionStatus'

interface Agent {
  agent: string
  first_seen: string
  last_seen: string
  event_count: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/login')
      return
    }

    let cancelled = false

    const loadAgents = (initial: boolean) => {
      if (initial) setLoading(true)
      getAgents(token)
        .then((data) => {
          if (!cancelled) {
            setAgents(Array.isArray(data) ? data : [])
            setLastSync(new Date())
          }
        })
        .catch((e) => {
          if (cancelled) return
          const msg = e instanceof Error ? e.message : 'Could not load your agents'
          if (msg.includes('401') || msg.toLowerCase().includes('invalid token')) {
            router.replace('/login')
            return
          }
          if (initial) setError(msg)
        })
        .finally(() => {
          if (!cancelled && initial) setLoading(false)
        })
    }

    loadAgents(true)
    const interval = setInterval(() => loadAgents(false), 30_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [router])

  if (loading) return <PageShell><Skeleton /></PageShell>

  if (error) {
    return (
      <PageShell>
        <div className="rounded-xl p-8 text-center" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
          <p className="text-white font-medium mb-2">Could not load dashboard</p>
          <p className="text-sm mb-4" style={{ color: '#737373' }}>{error}</p>
          <button
            type="button"
            onClick={() => router.replace('/login')}
            className="text-sm font-medium"
            style={{ color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sign in again →
          </button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-semibold text-xl">Agents</h1>
          <p className="text-sm mt-0.5" style={{ color: '#737373' }}>
            {agents.length} agent{agents.length !== 1 ? 's' : ''} tracked · updates every 30s
          </p>
        </div>
        {lastSync && (
          <div className="flex items-center gap-2 text-xs" style={{ color: '#525252' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            Live · synced {formatDistanceToNow(lastSync, { addSuffix: true })}
          </div>
        )}
      </div>

      {agents.length === 0 ? (
        <GettingStartedChecklist />
      ) : (
        <div className="grid gap-3">
          {agents.map(agent => (
            <AgentCard
              key={agent.agent}
              agent={agent}
              onClick={() => router.push(`/dashboard/agents/${encodeURIComponent(agent.agent)}`)}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}

function AgentCard({ agent, onClick }: { agent: Agent; onClick: () => void }) {
  const lastSeen = formatDistanceToNow(new Date(agent.last_seen), { addSuffix: true })
  const isRecent = Date.now() - new Date(agent.last_seen).getTime() < 5 * 60 * 1000

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-5 transition group"
      style={{ background: '#111', border: '1px solid #1f1f1f' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f1f1f')}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
               style={{ background: '#1a1a1a' }}>
            <Zap size={16} style={{ color: '#22c55e' }} />
          </div>
          <div>
            <div className="text-white font-medium font-mono text-sm">{agent.agent}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isRecent && (
                <span className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: '#22c55e' }} />
              )}
              <span className="text-xs" style={{ color: '#737373' }}>
                Active {lastSeen}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-right">
          <div>
            <div className="text-white font-semibold font-mono">
              {agent.event_count.toLocaleString()}
            </div>
            <div className="text-xs" style={{ color: '#737373' }}>events</div>
          </div>
          <span style={{ color: '#525252' }}>→</span>
        </div>
      </div>
    </button>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="p-8 max-w-4xl mx-auto">{children}</div>
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#111' }} />
      ))}
    </div>
  )
}
