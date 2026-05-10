/**
 * AgentDB TypeScript SDK
 *
 * @example
 * import { AgentDB } from 'agentdb'
 *
 * // Cloud
 * const db = new AgentDB({ apiKey: 'agdb_live_xxxx' })
 *
 * // Self-hosted
 * const db = new AgentDB({ host: 'http://localhost:8000' })
 *
 * // Log an event
 * const result = await db.log({
 *   agent: 'my-bot',
 *   event: 'tool_call',
 *   data: { tool: 'search', query: '...' },
 * })
 *
 * // Why did something happen?
 * const chain = await db.why(result.eventId)
 * chain.print()
 */

import type {
  AgentDBConfig,
  AgentEvent,
  AgentInfo,
  AgentState,
  AtOptions,
  CausalChain,
  LogOptions,
  LogResult,
  QueryOptions,
  SearchOptions,
} from './types'
import { AgentDBError, AuthError, NotFoundError } from './types'

export * from './types'

const CLOUD_HOST = 'https://agentdb.zizka.ai/api'

export class AgentDB {
  private readonly baseUrl: string
  private readonly headers: Record<string, string>
  private readonly timeout: number

  constructor(config: AgentDBConfig) {
    if (!config.apiKey && !config.host) {
      throw new AgentDBError(
        'Provide an apiKey (cloud) or host (self-hosted).\n' +
        '  Cloud:       new AgentDB({ apiKey: "agdb_live_..." })\n' +
        '  Self-hosted: new AgentDB({ host: "http://localhost:8000" })',
      )
    }

    this.baseUrl = config.host?.replace(/\/$/, '') ?? CLOUD_HOST
    this.timeout = config.timeout ?? 10_000
    this.headers = {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    }
  }

  // ─────────────────────────────────────────
  // LOG
  // ─────────────────────────────────────────

  async log(options: LogOptions): Promise<LogResult> {
    const res = await this.post('/v1/events', {
      agent: options.agent,
      event: options.event,
      data: options.data,
      parent_id: options.parentId ?? null,
      session_id: options.sessionId ?? null,
      metadata: options.metadata ?? null,
    })
    return {
      eventId: res.event_id,
      timestamp: new Date(res.timestamp),
      sequenceNo: res.sequence_no,
      checksum: res.checksum,
    }
  }

  // ─────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────

  async query(options: QueryOptions): Promise<AgentEvent[]> {
    const params: Record<string, string> = {
      agent: options.agent,
      limit: String(options.limit ?? 50),
    }
    if (options.before) params.before = options.before.toISOString()
    if (options.after) params.after = options.after.toISOString()
    if (options.eventType) params.event_type = options.eventType
    if (options.sessionId) params.session_id = options.sessionId

    const res = await this.get('/v1/events', params)
    return res.map(parseEvent)
  }

  // ─────────────────────────────────────────
  // WHY
  // ─────────────────────────────────────────

  async why(eventId: string, depth = 10): Promise<CausalChain> {
    const res = await this.get(`/v1/events/${eventId}/why`, {
      depth: String(depth),
    })
    const chain = res.chain.map(parseEvent)

    return {
      eventId: res.event_id,
      chainLength: res.chain_length,
      chain,
      print() {
        if (chain.length === 0) {
          console.log('(empty chain)')
          return
        }
        chain.forEach((event, i) => {
          const indent = '    '.repeat(i)
          const connector = i > 0 ? '└── ' : ''
          const data = JSON.stringify(event.data).slice(0, 60)
          const time = event.timestamp.toTimeString().slice(0, 8)
          console.log(`${indent}${connector}${event.event}: ${data}  [${time}]`)
        })
      },
    }
  }

  // ─────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────

  async search(options: SearchOptions): Promise<AgentEvent[]> {
    const res = await this.post('/v1/search', {
      query: options.query,
      agent: options.agent ?? null,
      limit: options.limit ?? 10,
    })
    return res.results.map(parseEvent)
  }

  // ─────────────────────────────────────────
  // AT (time travel)
  // ─────────────────────────────────────────

  async at(options: AtOptions): Promise<AgentState> {
    const res = await this.get('/v1/events/at', {
      agent: options.agent,
      timestamp: options.timestamp.toISOString(),
    })
    return {
      agent: res.agent,
      at: new Date(res.at),
      eventCount: res.event_count,
      state: res.state,
    }
  }

  // ─────────────────────────────────────────
  // AGENTS
  // ─────────────────────────────────────────

  async agents(): Promise<AgentInfo[]> {
    const res = await this.get('/v1/agents', {})
    return res.map((a: Record<string, unknown>) => ({
      agent: a.agent,
      firstSeen: new Date(a.first_seen as string),
      lastSeen: new Date(a.last_seen as string),
      eventCount: a.event_count,
    }))
  }

  // ─────────────────────────────────────────
  // HTTP HELPERS
  // ─────────────────────────────────────────

  private async post(path: string, body: unknown): Promise<Record<string, unknown>> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      return this.handle(res)
    } finally {
      clearTimeout(timer)
    }
  }

  private async get(
    path: string,
    params: Record<string, string>,
  ): Promise<unknown> {
    const qs = new URLSearchParams(params).toString()
    const url = qs ? `${this.baseUrl}${path}?${qs}` : `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.headers,
        signal: controller.signal,
      })
      return this.handle(res)
    } finally {
      clearTimeout(timer)
    }
  }

  private async handle(res: Response): Promise<unknown> {
    if (res.status === 401) {
      throw new AuthError(
        'Invalid API key. Check your key at agentdb.zizka.ai/settings/api-keys',
      )
    }
    if (res.status === 404) {
      throw new NotFoundError('Resource not found')
    }
    if (res.status >= 400) {
      let detail = res.statusText
      try {
        const json = await res.json() as Record<string, unknown>
        detail = (json.detail as string) ?? detail
      } catch {}
      throw new AgentDBError(`AgentDB error (${res.status}): ${detail}`, res.status)
    }
    return res.json()
  }
}

function parseEvent(e: Record<string, unknown>): AgentEvent {
  return {
    eventId: e.event_id as string,
    agent: e.agent as string,
    timestamp: new Date(e.timestamp as string),
    event: e.event as string,
    data: e.data as Record<string, unknown>,
    parentId: (e.parent_id as string) ?? null,
    sessionId: (e.session_id as string) ?? null,
    sequenceNo: e.sequence_no as number,
    score: e.score as number | undefined,
  }
}
