'use client'

import { useEffect, useState } from 'react'
import { getApiKeys, createApiKey } from '@/lib/api'
import { requireAuth } from '@/lib/auth'
import { Key, Plus, Copy, Check } from 'lucide-react'

interface ApiKey {
  key_id: string
  prefix: string
  name: string | null
  created_at: string
  last_used: string | null
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newKey, setNewKey] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let token: string
    try { token = requireAuth() } catch { return }
    getApiKeys(token).then(setKeys).finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const token = requireAuth()
      const res = await createApiKey(token, name || 'Default')
      setNewKey(res.key)
      setKeys(prev => [{ key_id: res.key_id ?? '', prefix: res.prefix, name: res.name, created_at: new Date().toISOString(), last_used: null }, ...prev])
      setName('')
    } finally {
      setCreating(false)
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-white font-semibold text-xl mb-1">Settings</h1>
      <p className="text-sm mb-8" style={{ color: '#737373' }}>Manage your API keys.</p>

      {/* New key revealed */}
      {newKey && (
        <div className="rounded-xl p-4 mb-6" style={{ background: '#0d2010', border: '1px solid #22c55e40' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#22c55e' }}>
            ✓ API key created — save it now, it won't be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono rounded-lg px-3 py-2.5 truncate"
                  style={{ background: '#0a0a0a', color: '#e5e5e5' }}>
              {newKey}
            </code>
            <button
              onClick={() => copy(newKey)}
              className="shrink-0 p-2 rounded-lg transition"
              style={{ background: '#1a1a1a' }}
            >
              {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} style={{ color: '#737373' }} />}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="text-xs mt-3 block"
            style={{ color: '#525252' }}
          >
            I've saved my key — dismiss
          </button>
        </div>
      )}

      {/* Create new key */}
      <div className="rounded-xl p-5 mb-6" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
        <h2 className="text-sm font-medium text-white mb-4">Create API key</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Key name (e.g. production)"
            className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            onFocus={e => (e.target.style.borderColor = '#22c55e')}
            onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
          />
          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-black disabled:opacity-40 transition"
            style={{ background: '#22c55e' }}
          >
            <Plus size={14} />
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>

      {/* Key list */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1f1f1f' }}>
        <div className="px-5 py-3 border-b" style={{ background: '#111', borderColor: '#1f1f1f' }}>
          <span className="text-xs font-medium" style={{ color: '#737373' }}>API KEYS</span>
        </div>
        {loading ? (
          <div className="p-5 space-y-2">
            {[1,2].map(i => <div key={i} className="h-10 rounded animate-pulse" style={{ background: '#1a1a1a' }} />)}
          </div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: '#737373', background: '#111' }}>
            No API keys yet.
          </div>
        ) : (
          <div style={{ background: '#111' }}>
            {keys.map((key, i) => (
              <div
                key={key.key_id}
                className="flex items-center justify-between px-5 py-4"
                style={{ borderTop: i > 0 ? '1px solid #1a1a1a' : 'none' }}
              >
                <div className="flex items-center gap-3">
                  <Key size={14} style={{ color: '#525252' }} />
                  <div>
                    <div className="text-sm text-white">{key.name ?? 'Unnamed'}</div>
                    <div className="text-xs font-mono mt-0.5" style={{ color: '#525252' }}>
                      {key.prefix}...
                    </div>
                  </div>
                </div>
                <div className="text-xs" style={{ color: '#525252' }}>
                  {key.last_used
                    ? `Last used ${new Date(key.last_used).toLocaleDateString()}`
                    : 'Never used'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
