/**
 * PrivacyShield AI – Popup App
 * The main popup UI shown when the user clicks the extension icon.
 */

import React, { useState } from 'react'
import { Shield, ShieldOff, Settings, BarChart3, Clock, Globe, X, ChevronRight, Zap, Lock } from 'lucide-react'
import { useSettings } from '../src/hooks/useSettings'
import { useStats } from '../src/hooks/useStats'
import { useTabInfo } from '../src/hooks/useTabInfo'
import { RadialScore, StatCard } from '../src/components/ui/Chart'
import { Badge } from '../src/components/ui/Badge'
import { Button } from '../src/components/ui/Button'
import { Switch } from '../src/components/ui/Switch'
import { cn } from '../src/utils/cn'

// ============================================================
// Quick action button
// ============================================================

interface QuickActionProps {
  label: string
  onClick: () => void
  icon: React.ReactNode
  variant?: 'default' | 'warning' | 'danger'
}

const QuickAction: React.FC<QuickActionProps> = ({ label, onClick, icon, variant = 'default' }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium',
      'transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]',
      variant === 'default' && 'bg-white/5 hover:bg-white/8 text-white/80 hover:text-white',
      variant === 'warning' && 'bg-warning-500/10 hover:bg-warning-500/15 text-warning-400',
      variant === 'danger' && 'bg-danger-500/10 hover:bg-danger-500/15 text-danger-400',
    )}
  >
    <span className="shrink-0">{icon}</span>
    {label}
    <ChevronRight size={14} className="ml-auto opacity-50" />
  </button>
)

// ============================================================
// Pause menu
// ============================================================

interface PauseMenuProps {
  onPause: (minutes: number) => void
  onClose: () => void
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onPause, onClose }) => (
  <div className="absolute inset-0 z-50 bg-dark-800/95 backdrop-blur-md rounded-2xl p-4 animate-scale-in">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-white">Pause Protection</h3>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
        <X size={16} className="text-white/60" />
      </button>
    </div>
    <p className="text-sm text-white/50 mb-4">Temporarily disable blocking on this site:</p>
    <div className="flex flex-col gap-2">
      {[
        { label: '5 minutes', minutes: 5 },
        { label: '30 minutes', minutes: 30 },
        { label: '1 hour', minutes: 60 },
        { label: '24 hours', minutes: 1440 },
      ].map(({ label, minutes }) => (
        <button
          key={minutes}
          onClick={() => { onPause(minutes); onClose() }}
          className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white/80 hover:text-white transition-all duration-200"
        >
          <Clock size={14} className="text-warning-400 shrink-0" />
          {label}
          <ChevronRight size={14} className="ml-auto opacity-50" />
        </button>
      ))}
    </div>
  </div>
)

// ============================================================
// Main Popup App
// ============================================================

export default function App() {
  const { settings, updateSettings, loading: settingsLoading } = useSettings()
  const { formatted } = useStats()
  const { domain, enabled, privacyScore, tabInfo, toggleProtection, whitelistSite, pauseSite } =
    useTabInfo()

  const [showPauseMenu, setShowPauseMenu] = useState(false)

  const globalEnabled = settings.enabled

  function openOptions(page?: string) {
    const url = chrome.runtime.getURL(`options/index.html${page ? `#${page}` : ''}`)
    chrome.tabs.create({ url })
    window.close()
  }

  if (settingsLoading) {
    return (
      <div className="popup-root flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand animate-pulse flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="popup-root relative bg-dark-900 mesh-bg overflow-y-auto no-scrollbar">
      {/* Pause overlay */}
      {showPauseMenu && (
        <PauseMenu
          onPause={minutes => pauseSite(minutes)}
          onClose={() => setShowPauseMenu(false)}
        />
      )}

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Logo */}
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center',
            'shadow-brand',
            globalEnabled ? 'bg-gradient-brand animate-glow' : 'bg-white/10'
          )}>
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">PrivacyShield</div>
            <div className="text-[10px] text-white/40 leading-tight">AI Protection</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Global toggle */}
          <Switch
            checked={globalEnabled}
            onChange={checked => updateSettings({ enabled: checked })}
            size="md"
            id="global-toggle"
          />
          {/* Settings shortcut */}
          <button
            id="settings-btn"
            onClick={() => openOptions('settings')}
            className="p-1.5 rounded-lg hover:bg-white/8 transition-colors text-white/50 hover:text-white"
            title="Open Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* ── Status Banner ── */}
      <div className={cn(
        'mx-4 mb-3 rounded-2xl p-3 flex items-center gap-3',
        'border transition-all duration-300',
        globalEnabled && enabled
          ? 'bg-success-500/8 border-success-500/25'
          : 'bg-danger-500/8 border-danger-500/25'
      )}>
        <div className={cn(
          'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center',
          globalEnabled && enabled ? 'bg-success-500/20' : 'bg-danger-500/20'
        )}>
          {globalEnabled && enabled
            ? <Shield size={16} className="text-success-400" />
            : <ShieldOff size={16} className="text-danger-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white/90 truncate">
            {domain || 'No active tab'}
          </div>
          <div className={cn(
            'text-[11px] mt-0.5',
            globalEnabled && enabled ? 'text-success-400' : 'text-danger-400'
          )}>
            {!globalEnabled
              ? '⚠️ Protection globally disabled'
              : enabled
              ? '✓ Protected – all threats blocked'
              : '⚠️ Blocking paused on this site'
            }
          </div>
        </div>
        <Badge
          variant={globalEnabled && enabled ? 'success' : 'danger'}
          dot
          pulse={globalEnabled && enabled}
          size="xs"
        >
          {globalEnabled && enabled ? 'Active' : 'Off'}
        </Badge>
      </div>

      {/* ── Privacy Score ── */}
      <div className="mx-4 mb-3 rounded-2xl p-4 glass border border-white/8">
        <div className="flex items-center gap-4">
          <RadialScore
            score={privacyScore.score}
            size={80}
            strokeWidth={7}
            color={privacyScore.color}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white/40 mb-0.5">Privacy Score</div>
            <div className="flex items-center gap-2">
              <span
                className="text-2xl font-black"
                style={{ color: privacyScore.color }}
              >
                {privacyScore.grade}
              </span>
              <span className="text-sm text-white/70">{privacyScore.label}</span>
            </div>

            {/* Feature indicators */}
            <div className="flex flex-wrap gap-1 mt-2">
              <FeaturePill active={settings.adBlocking} label="Ads" />
              <FeaturePill active={settings.trackerBlocking} label="Trackers" />
              <FeaturePill active={settings.fingerprintProtection} label="Fingerprint" />
              <FeaturePill active={settings.cookieCleaning} label="Cookies" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Stats ── */}
      <div className="px-4 mb-3">
        <div className="section-title flex items-center gap-2">
          <Zap size={11} />
          Today's Stats
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MiniStat
            label="Ads Blocked"
            value={formatted.raw.today.adsBlocked.toLocaleString()}
            color="#6366f1"
          />
          <MiniStat
            label="Trackers"
            value={formatted.raw.today.trackersBlocked.toLocaleString()}
            color="#d946ef"
          />
          <MiniStat
            label="Bandwidth Saved"
            value={formatted.bandwidthSaved}
            color="#22c55e"
          />
          <MiniStat
            label="Total Blocked"
            value={formatted.requestsBlocked}
            color="#f59e0b"
          />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      {domain && (
        <div className="px-4 mb-3">
          <div className="section-title flex items-center gap-2">
            <Globe size={11} />
            Site Controls
          </div>
          <div className="flex flex-col gap-1.5">
            <QuickAction
              label={enabled ? 'Pause on this site' : 'Re-enable protection'}
              icon={enabled ? <Clock size={14} className="text-warning-400" /> : <Shield size={14} className="text-success-400" />}
              onClick={enabled ? () => setShowPauseMenu(true) : () => toggleProtection(true)}
              variant={enabled ? 'warning' : 'default'}
            />
            <QuickAction
              label="Add to whitelist"
              icon={<Lock size={14} className="text-white/50" />}
              onClick={() => whitelistSite('add')}
            />
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <button
          id="dashboard-btn"
          onClick={() => openOptions('dashboard')}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/8 transition-colors text-white/60 hover:text-white text-xs font-medium"
        >
          <BarChart3 size={13} />
          Dashboard
        </button>
        <button
          id="settings-btn-footer"
          onClick={() => openOptions('settings')}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/8 transition-colors text-white/60 hover:text-white text-xs font-medium"
        >
          <Settings size={13} />
          Settings
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

function FeaturePill({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium',
      active
        ? 'bg-success-500/15 text-success-400'
        : 'bg-white/5 text-white/30'
    )}>
      <span className={cn('w-1 h-1 rounded-full', active ? 'bg-success-400' : 'bg-white/30')} />
      {label}
    </span>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="glass rounded-xl px-3 py-2.5 border border-white/6">
      <div className="font-bold text-base" style={{ color }}>{value || '0'}</div>
      <div className="text-[11px] text-white/45 mt-0.5">{label}</div>
    </div>
  )
}
