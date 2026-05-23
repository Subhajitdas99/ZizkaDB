// NEXT_PUBLIC_ prefix makes this available in the browser.
// Falls back to '' (relative URL) so Nginx can route /v1/ → FastAPI.
const API = process.env.NEXT_PUBLIC_API_URL ?? ''

async function apiFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'API error')
  }
  return res.json()
}

export async function getAgents(token: string) {
  return apiFetch('/v1/agents', token)
}

export async function getAgentStats(token: string, agentId: string) {
  return apiFetch(`/v1/agents/${encodeURIComponent(agentId)}/stats`, token)
}

export async function getEvents(
  token: string,
  agent: string,
  params: Record<string, string> = {},
) {
  const qs = new URLSearchParams({ agent, ...params }).toString()
  const data = await apiFetch(`/v1/events?${qs}`, token)
  // API returns either an array directly or { events: [] }
  return Array.isArray(data) ? data : (data as { events?: unknown[] }).events ?? []
}

export async function getWhyChain(token: string, eventId: string) {
  return apiFetch(`/v1/events/${eventId}/why`, token)
}

export async function searchEvents(token: string, query: string, agent?: string) {
  return apiFetch('/v1/search', token, {
    method: 'POST',
    body: JSON.stringify({ query, agent, limit: 20 }),
  })
}

export async function getAgentSessions(token: string, agentId: string) {
  return apiFetch(`/v1/agents/${encodeURIComponent(agentId)}/sessions`, token)
}

export async function getMemoryDiff(token: string, sessionId: string) {
  return apiFetch(`/v1/memory/diff/${encodeURIComponent(sessionId)}`, token)
}

export async function timeTravel(token: string, agent: string, timestamp: string) {
  const qs = new URLSearchParams({ agent, timestamp }).toString()
  return apiFetch(`/v1/events/at?${qs}`, token)
}

export async function getAgentBaseline(
  token: string,
  agentId: string,
  recentWindow = 50,
) {
  const qs = new URLSearchParams({ recent_window: String(recentWindow) }).toString()
  return apiFetch(
    `/v1/agents/${encodeURIComponent(agentId)}/baseline?${qs}`,
    token,
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin (single-tenant; locked to founder@zizka.ai by the backend)
// ─────────────────────────────────────────────────────────────────────────────

export async function adminRequestOtp(email: string, signal?: AbortSignal) {
  const res = await fetch(`${API}/v1/admin/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    signal,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

export async function adminVerifyOtp(email: string, otp: string) {
  const res = await fetch(`${API}/v1/admin/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })
  if (!res.ok) throw new Error('Invalid code')
  return res.json()
}

export async function adminOverview(token: string) {
  return apiFetch('/v1/admin/overview', token)
}

export async function adminTelemetrySummary(token: string) {
  return apiFetch('/v1/admin/telemetry/summary', token)
}

export async function adminTelemetryRecent(token: string, limit = 50) {
  return apiFetch(`/v1/admin/telemetry/recent?limit=${limit}`, token)
}

export async function adminManagedOverview(token: string) {
  return apiFetch('/v1/admin/managed/overview', token)
}

export async function adminManagedSubscribers(
  token: string,
  params: { search?: string; status?: string } = {},
) {
  const qs = new URLSearchParams()
  if (params.search?.trim()) qs.set('search', params.search.trim())
  if (params.status?.trim()) qs.set('status', params.status.trim())
  const q = qs.toString()
  return apiFetch(`/v1/admin/managed/subscribers${q ? `?${q}` : ''}`, token)
}

export async function adminManagedUsers(
  token: string,
  params: { search?: string; has_keys?: boolean; active_7d?: boolean } = {},
) {
  const qs = new URLSearchParams()
  if (params.search?.trim()) qs.set('search', params.search.trim())
  if (params.has_keys === true) qs.set('has_keys', 'true')
  if (params.has_keys === false) qs.set('has_keys', 'false')
  if (params.active_7d === true) qs.set('active_7d', 'true')
  if (params.active_7d === false) qs.set('active_7d', 'false')
  const q = qs.toString()
  return apiFetch(`/v1/admin/managed/users${q ? `?${q}` : ''}`, token)
}

export async function adminManagedUsage(token: string) {
  return apiFetch('/v1/admin/managed/usage', token)
}

export async function getApiKeys(token: string) {
  return apiFetch('/v1/auth/api-keys', token)
}

export async function createApiKey(token: string, name: string) {
  return apiFetch('/v1/auth/api-keys', token, {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function requestOtp(email: string) {
  const res = await fetch(`${API}/v1/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.toLowerCase().trim() }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(typeof err.detail === 'string' ? err.detail : 'Failed to send code')
  }
  return res.json()
}

export async function verifyOtp(email: string, otp: string) {
  const res = await fetch(`${API}/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })
  if (!res.ok) throw new Error('Invalid code')
  return res.json()
}
