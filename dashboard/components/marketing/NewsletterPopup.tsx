'use client'

import { useEffect, useState } from 'react'
import { subscribeNewsletter } from '@/lib/api'

const DISMISS_KEY = 'zdb_newsletter_dismissed_until'
const DISMISS_DAYS = 7
const SHOW_DELAY_MS = 15000
const NEWSLETTER_ENABLED = process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED === 'true'

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!NEWSLETTER_ENABLED) return
    if (typeof window === 'undefined') return
    const until = localStorage.getItem(DISMISS_KEY)
    if (until && Date.now() < Number(until)) return

    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  function dismiss() {
    const until = Date.now() + DISMISS_DAYS * 86400000
    localStorage.setItem(DISMISS_KEY, String(until))
    setVisible(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await subscribeNewsletter(email)
      setMessage(res.message)
      if (!res.already_subscribed) {
        setTimeout(dismiss, 2500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not subscribe')
    } finally {
      setLoading(false)
    }
  }

  if (!NEWSLETTER_ENABLED || !visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '28px 24px',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          style={{
            float: 'right',
            border: 'none',
            background: 'transparent',
            fontSize: 20,
            cursor: 'pointer',
            color: '#888',
            lineHeight: 1,
          }}
        >
          ×
        </button>
        <h2 id="newsletter-title" style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>
          Stay updated with the latest in Agentic AI
        </h2>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: '0 0 20px' }}>
          Get product updates, AI engineering insights, tutorials, and new feature announcements directly in your inbox.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{
              width: '100%',
              padding: '11px 12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 14,
              marginBottom: 10,
              boxSizing: 'border-box',
            }}
          />
          <input type="text" name="botcheck" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 8,
              border: 'none',
              background: '#111',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
        {message && <p style={{ color: '#16a34a', fontSize: 13, marginTop: 12 }}>{message}</p>}
        {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  )
}
