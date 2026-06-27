/**
 * Options/Dashboard App – full-page UI for settings and stats.
 */

import React, { useState, useEffect } from 'react'
import {
  Shield, BarChart3, Settings, Globe, Info, Menu, X,
  ShieldCheck, Zap, Lock, Eye, Bell, Filter, Database, RefreshCw
} from 'lucide-react'
import { cn } from '../src/utils/cn'
import { Tabs } from '../src/components/ui/Tabs'
import { Dashboard } from '../src/pages/Dashboard'
import { SettingsPage } from '../src/pages/SettingsPage'
import { WhitelistPage } from '../src/pages/WhitelistPage'
import { AboutPage } from '../src/pages/AboutPage'

type PageId = 'dashboard' | 'settings' | 'whitelist' | 'about'

const NAV_ITEMS: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  { id: 'whitelist', label: 'Sites', icon: <Globe size={18} /> },
  { id: 'about', label: 'About', icon: <Info size={18} /> },
]

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Respect hash navigation from popup
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as PageId
    if (hash && ['dashboard', 'settings', 'whitelist', 'about'].includes(hash)) {
      setActivePage(hash)
    }
  }, [])

  return (
    <div className="min-h-screen bg-dark-900 mesh-bg flex">
      {/* ── Sidebar ── */}
      <aside className={cn(
        'flex flex-col shrink-0 transition-all duration-300',
        'bg-dark-800/60 backdrop-blur border-r border-white/8',
        sidebarOpen ? 'w-56' : 'w-16',
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
          <div className="w-9 h-9 shrink-0 bg-gradient-brand rounded-xl flex items-center justify-center shadow-brand">
            <Shield size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="font-bold text-sm text-white leading-tight">PrivacyShield</div>
              <div className="text-[10px] text-white/40">AI v1.0</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className={cn(
              'p-1.5 rounded-lg hover:bg-white/8 transition-colors text-white/50 hover:text-white',
              sidebarOpen ? 'ml-auto' : 'mx-auto'
            )}
          >
            {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActivePage(item.id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-left',
                activePage === item.id
                  ? 'bg-gradient-brand text-white shadow-brand'
                  : 'text-white/60 hover:text-white hover:bg-white/8',
                !sidebarOpen && 'justify-center px-2'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/8">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-success-500/10 border border-success-500/20">
              <ShieldCheck size={14} className="text-success-400 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-success-400">Protected</div>
                <div className="text-[10px] text-white/40">All systems active</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto scrollbar-thin">
        <div className="max-w-5xl mx-auto p-6">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'settings' && <SettingsPage />}
          {activePage === 'whitelist' && <WhitelistPage />}
          {activePage === 'about' && <AboutPage />}
        </div>
      </main>
    </div>
  )
}
