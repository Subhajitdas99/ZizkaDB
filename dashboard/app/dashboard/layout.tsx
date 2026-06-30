import type { Metadata } from 'next'
import { DashboardShell } from '@/components/DashboardShell'
import { SubscriptionGate } from '@/components/SubscriptionGate'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <SubscriptionGate>{children}</SubscriptionGate>
    </DashboardShell>
  )
}
