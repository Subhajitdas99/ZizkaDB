'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { confirmCheckout } from '@/lib/api'
import { BrandLogo } from '@/components/BrandLogo'

export default function SignupSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback message="Confirming your subscription…" />}>
      <SignupSuccessInner />
    </Suspense>
  )
}

function SuccessFallback({ message }: { message: string }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#fafafa', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <BrandLogo variant="full" />
        <p style={{ marginTop: 24, color: '#666', fontSize: 14 }}>{message}</p>
      </div>
    </div>
  )
}

function SignupSuccessInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/signup')
      return
    }
    if (!sessionId) {
      setError('Missing checkout session. Please try again.')
      return
    }

    let cancelled = false

    async function confirm() {
      try {
        const status = await confirmCheckout(token!, sessionId!)
        if (cancelled) return
        if (status.has_access) {
          router.replace('/dashboard')
        } else {
          setError('Payment was not completed. Please try again.')
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not confirm payment')
        }
      }
    }

    confirm()
    return () => { cancelled = true }
  }, [router, sessionId])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fafafa', padding: 24,
      }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>
          <a href="/signup/plan" style={{ color: '#111', fontWeight: 600 }}>Return to plan selection →</a>
        </div>
      </div>
    )
  }

  return <SuccessFallback message="Payment successful — opening your dashboard…" />
}
