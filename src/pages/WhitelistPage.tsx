/**
 * Whitelist / Sites Management Page
 */

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Globe, Shield, ShieldOff, Clock, Search } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { cn } from '../utils/cn'
import type { WhitelistEntry } from '../types'
import { STORAGE_KEYS } from '../constants'

export function WhitelistPage() {
  const [entries, setEntries] = useState<WhitelistEntry[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<'whitelist' | 'blacklist'>('whitelist')

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    const result = await chrome.storage.local.get(STORAGE_KEYS.WHITELIST)
    setEntries((result[STORAGE_KEYS.WHITELIST] as WhitelistEntry[]) ?? [])
    setLoading(false)
  }

  async function saveEntries(updated: WhitelistEntry[]) {
    await chrome.storage.local.set({ [STORAGE_KEYS.WHITELIST]: updated })
    setEntries(updated)
    // Notify background
    chrome.runtime.sendMessage({ type: 'WHITELIST_SITE', data: { updated } })
  }

  async function addEntry() {
    const domain = newDomain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')
    if (!domain) return
    if (entries.some(e => e.domain === domain)) return

    const updated = [...entries, { domain, addedAt: Date.now(), type }]
    await saveEntries(updated)
    setNewDomain('')
  }

  async function removeEntry(domain: string) {
    await saveEntries(entries.filter(e => e.domain !== domain))
  }

  const filtered = entries.filter(e =>
    filter ? e.domain.toLowerCase().includes(filter.toLowerCase()) : true
  )

  const whitelisted = filtered.filter(e => e.type === 'whitelist')
  const blacklisted = filtered.filter(e => e.type === 'blacklist')

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Site Controls</h1>
        <p className="text-sm text-white/50 mt-0.5">Manage per-site blocking rules</p>
      </div>

      {/* Add site form */}
      <div className="glass rounded-2xl border border-white/8 p-5 mb-5">
        <h2 className="text-sm font-semibold text-white mb-3">Add a Site</h2>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setType('whitelist')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
              type === 'whitelist'
                ? 'bg-success-500/20 text-success-400 border border-success-500/40'
                : 'bg-white/5 text-white/40 border border-white/8 hover:bg-white/8'
            )}
          >
            <Shield size={12} />
            Whitelist (allow all)
          </button>
          <button
            onClick={() => setType('blacklist')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
              type === 'blacklist'
                ? 'bg-danger-500/20 text-danger-400 border border-danger-500/40'
                : 'bg-white/5 text-white/40 border border-white/8 hover:bg-white/8'
            )}
          >
            <ShieldOff size={12} />
            Blacklist (block all)
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addEntry()}
            placeholder="example.com"
            className="input-base flex-1"
            id="add-domain-input"
          />
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={14} />}
            onClick={addEntry}
            disabled={!newDomain.trim()}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter sites..."
          className="input-base pl-9"
          id="filter-sites-input"
        />
      </div>

      {loading ? (
        <div className="glass rounded-2xl border border-white/8 p-8 text-center text-white/30 text-sm">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-white/8 p-10 text-center">
          <Globe size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40 text-sm">No sites added yet</p>
          <p className="text-white/25 text-xs mt-1">
            Add sites above to whitelist or blacklist them
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {whitelisted.length > 0 && (
            <SiteList
              title="Whitelisted Sites"
              subtitle="Blocking is disabled on these sites"
              entries={whitelisted}
              onRemove={removeEntry}
              variant="whitelist"
            />
          )}
          {blacklisted.length > 0 && (
            <SiteList
              title="Blacklisted Sites"
              subtitle="All requests are blocked on these sites"
              entries={blacklisted}
              onRemove={removeEntry}
              variant="blacklist"
            />
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Site list group
// ============================================================

interface SiteListProps {
  title: string
  subtitle: string
  entries: WhitelistEntry[]
  onRemove: (domain: string) => void
  variant: 'whitelist' | 'blacklist'
}

function SiteList({ title, subtitle, entries, onRemove, variant }: SiteListProps) {
  return (
    <div className="glass rounded-2xl border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="text-xs text-white/40">{subtitle}</p>
        </div>
        <Badge
          variant={variant === 'whitelist' ? 'success' : 'danger'}
          size="xs"
        >
          {entries.length} site{entries.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      <div className="divide-y divide-white/5">
        {entries.map(entry => (
          <div key={entry.domain} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
            <div className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
              variant === 'whitelist' ? 'bg-success-500/15' : 'bg-danger-500/15'
            )}>
              {variant === 'whitelist'
                ? <Shield size={12} className="text-success-400" />
                : <ShieldOff size={12} className="text-danger-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white/90 truncate">{entry.domain}</div>
              <div className="text-xs text-white/35">
                Added {new Date(entry.addedAt).toLocaleDateString()}
                {entry.pausedUntil && entry.pausedUntil > Date.now() && (
                  <span className="ml-2 text-warning-400 flex items-center gap-1 inline-flex">
                    <Clock size={10} />
                    Paused until {new Date(entry.pausedUntil).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(entry.domain)}
              className="p-1.5 rounded-lg hover:bg-danger-500/15 text-white/30 hover:text-danger-400 transition-colors"
              title="Remove"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
