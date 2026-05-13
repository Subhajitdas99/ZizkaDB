'use client'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('zizkadb_token')
}

export function setToken(token: string) {
  localStorage.setItem('zizkadb_token', token)
}

export function clearToken() {
  localStorage.removeItem('zizkadb_token')
}

export function requireAuth(): string {
  const token = getToken()
  if (!token) {
    window.location.href = '/login'
    throw new Error('Not authenticated')
  }
  return token
}
