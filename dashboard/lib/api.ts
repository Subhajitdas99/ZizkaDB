const API = process.env.API_URL ?? 'http://localhost:8000'

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
  return apiFetch(`/v1/events?${qs}`, token)
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
    body: JSON.stringify({ email }),
  })
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
