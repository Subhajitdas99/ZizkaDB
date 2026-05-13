'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearToken } from '@/lib/auth'
import { Database, Search, Settings, LogOut, Cpu } from 'lucide-react'

const nav = [
  { href: '/dashboard',         label: 'Agents',   icon: Cpu },
  { href: '/dashboard/search',  label: 'Search',   icon: Search },
  { href: '/dashboard/settings',label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  function signOut() {
    clearToken()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0a' }}>

      {/* Sidebar */}
      <aside className="w-56 flex flex-col shrink-0 border-r" style={{ background: '#0d0d0d', borderColor: '#1f1f1f' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: '#1f1f1f' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center"
                 style={{ background: '#22c55e' }}>
              <Database size={14} className="text-black" />
            </div>
            <span className="text-white font-semibold">ZizkaDB</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition"
                style={{
                  color: active ? '#fff' : '#737373',
                  background: active ? '#1a1a1a' : 'transparent',
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t" style={{ borderColor: '#1f1f1f' }}>
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full transition"
            style={{ color: '#737373' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e5e5e5')}
            onMouseLeave={e => (e.currentTarget.style.color = '#737373')}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
