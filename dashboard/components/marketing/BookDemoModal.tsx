'use client'

import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { submitDemoRequest } from '@/lib/demo'
import { M, violetBtn } from './marketing-theme'

type Props = {
  open: boolean
  onClose: () => void
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: `1px solid ${M.line}`,
  fontSize: 14,
  color: '#000',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
}

export function BookDemoModal({ open, onClose }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) return
    setFirstName('')
    setLastName('')
    setEmail('')
    setCompanyName('')
    setWebsite('')
    setBusy(false)
    setErr('')
    setDone(false)
  }, [open])

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await submitDemoRequest({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        company_name: companyName.trim(),
        website: website.trim(),
      })
      setDone(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-demo-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 440, background: '#fff', borderRadius: 16,
          border: `1px solid ${M.line}`, boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          padding: '28px 28px 24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="book-demo-title" style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#000' }}>
          Book a demo
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#000', lineHeight: 1.5, fontWeight: 500 }}>
          Tell us about your team and we will reach out to schedule a walkthrough.
        </p>

        {done ? (
          <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
            <p style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#000', lineHeight: 1.55 }}>
              Your demo request has been received. You will be contacted via email in 24 hours.
            </p>
            <button type="button" onClick={onClose} style={{ ...violetBtn, border: 'none', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="text" name="botcheck" tabIndex={-1} autoComplete="off"
              style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
              aria-hidden="true" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 6 }}>
                  First name
                </span>
                <input required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  style={inputStyle} autoComplete="given-name" />
              </label>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 6 }}>
                  Last name
                </span>
                <input required value={lastName} onChange={(e) => setLastName(e.target.value)}
                  style={inputStyle} autoComplete="family-name" />
              </label>
            </div>

            <label style={{ display: 'block', marginBottom: 10 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 6 }}>
                Email
              </span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                style={inputStyle} autoComplete="email" />
            </label>

            <label style={{ display: 'block', marginBottom: 10 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 6 }}>
                Company name
              </span>
              <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                style={inputStyle} autoComplete="organization" />
            </label>

            <label style={{ display: 'block', marginBottom: 16 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 6 }}>
                Website
              </span>
              <input required value={website} onChange={(e) => setWebsite(e.target.value)}
                style={inputStyle} placeholder="https://company.com" autoComplete="url" />
            </label>

            {err && (
              <div style={{
                marginBottom: 12, padding: '10px 12px', borderRadius: 8,
                background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                fontSize: 13, fontWeight: 600,
              }}>
                {err}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={busy}
                style={{ ...violetBtn, flex: 1, justifyContent: 'center', border: 'none', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1 }}>
                {busy ? 'Submitting…' : 'Submit'}
              </button>
              <button type="button" onClick={onClose}
                style={{
                  padding: '14px 18px', borderRadius: 12, border: `1px solid ${M.line}`,
                  background: '#fff', color: '#000', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
