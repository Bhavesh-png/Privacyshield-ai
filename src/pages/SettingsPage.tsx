/**
 * Settings Page – full settings management UI.
 */

import React, { useState, useRef } from 'react'
import {
  Shield, Eye, Cookie, Bell, Filter, Database, Download, Upload,
  RefreshCw, ChevronDown, ChevronRight, Lock, Fingerprint
} from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { Switch } from '../components/ui/Switch'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Tabs } from '../components/ui/Tabs'
import { cn } from '../utils/cn'
import type { ExtensionSettings } from '../types'

// ============================================================
// Section component
// ============================================================

interface SectionProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function Section({ title, description, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="glass rounded-2xl border border-white/8 overflow-hidden mb-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/3 transition-colors"
      >
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
            <span className="text-brand-400">{icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-white">{title}</div>
          {description && <div className="text-xs text-white/40 mt-0.5">{description}</div>}
        </div>
        {open ? <ChevronDown size={16} className="text-white/40 shrink-0" /> : <ChevronRight size={16} className="text-white/40 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-white/8">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Setting row
// ============================================================

interface SettingRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  badge?: string
}

function SettingRow({ label, description, checked, onChange, disabled, badge }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/85">{label}</span>
          {badge && <Badge variant="info" size="xs">{badge}</Badge>}
        </div>
        {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} disabled={disabled} size="sm" />
    </div>
  )
}

// ============================================================
// Protection level slider
// ============================================================

const LEVELS = ['low', 'medium', 'high', 'paranoid'] as const
type Level = typeof LEVELS[number]

function ProtectionLevelPicker({
  value,
  onChange,
}: {
  value: Level
  onChange: (v: Level) => void
}) {
  const descriptions: Record<Level, string> = {
    low: 'Basic ad blocking only',
    medium: 'Ad + tracker blocking',
    high: 'Full protection with fingerprinting (Recommended)',
    paranoid: 'Maximum protection — may break some sites',
  }
  const colors: Record<Level, string> = {
    low: 'text-white/60',
    medium: 'text-warning-400',
    high: 'text-success-400',
    paranoid: 'text-danger-400',
  }

  return (
    <div className="py-3">
      <div className="flex gap-1.5 mb-3">
        {LEVELS.map(level => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200',
              value === level
                ? level === 'paranoid'
                  ? 'bg-danger-500/20 text-danger-400 border border-danger-500/40'
                  : level === 'high'
                  ? 'bg-success-500/20 text-success-400 border border-success-500/40'
                  : 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                : 'bg-white/5 text-white/40 border border-white/8 hover:bg-white/8'
            )}
          >
            {level}
          </button>
        ))}
      </div>
      <p className={cn('text-xs', colors[value])}>{descriptions[value]}</p>
    </div>
  )
}

// ============================================================
// Main Settings Page
// ============================================================

export function SettingsPage() {
  const { settings, updateSettings, resetToDefaults, exportSettings, importSettings } = useSettings()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const success = await importSettings(file)
    setImportSuccess(success)
    setImporting(false)
    setTimeout(() => setImportSuccess(null), 3000)
  }

  function updateFingerprint(key: keyof ExtensionSettings['fingerprint'], value: boolean) {
    updateSettings({ fingerprint: { ...settings.fingerprint, [key]: value } })
  }

  function updateCleaning(key: keyof ExtensionSettings['cleaning'], value: boolean | number) {
    updateSettings({ cleaning: { ...settings.cleaning, [key]: value } })
  }

  function updateNotifications(key: keyof ExtensionSettings['notifications'], value: boolean) {
    updateSettings({ notifications: { ...settings.notifications, [key]: value } })
  }

  function updateFilterLists(key: keyof ExtensionSettings['filterLists'], value: boolean) {
    updateSettings({ filterLists: { ...settings.filterLists, [key]: value } })
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-white/50 mt-0.5">Customize your privacy protection</p>
      </div>

      {/* General */}
      <Section title="General" description="Core protection settings" icon={<Shield size={14} />}>
        <SettingRow
          label="Enable PrivacyShield AI"
          description="Master toggle for all protection features"
          checked={settings.enabled}
          onChange={v => updateSettings({ enabled: v })}
        />
        <SettingRow
          label="Dark Mode"
          description="Use dark theme across the extension"
          checked={settings.darkMode}
          onChange={v => updateSettings({ darkMode: v })}
        />
        <div className="pt-2">
          <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">
            Protection Level
          </div>
          <ProtectionLevelPicker
            value={settings.protectionLevel}
            onChange={v => updateSettings({ protectionLevel: v })}
          />
        </div>
      </Section>

      {/* Ad & Tracker Blocking */}
      <Section title="Ad & Tracker Blocking" description="Control what gets blocked" icon={<Filter size={14} />}>
        <SettingRow
          label="Ad Blocking"
          description="Block advertisements from all major networks"
          checked={settings.adBlocking}
          onChange={v => updateSettings({ adBlocking: v })}
        />
        <SettingRow
          label="Tracker Blocking"
          description="Block analytics, pixels, and tracking scripts"
          checked={settings.trackerBlocking}
          onChange={v => updateSettings({ trackerBlocking: v })}
        />
      </Section>

      {/* Filter Lists */}
      <Section title="Filter Lists" description="Choose which blocklists to apply" icon={<Filter size={14} />} defaultOpen={false}>
        <SettingRow
          label="EasyList"
          description="Primary ad blocking filter list"
          checked={settings.filterLists.easyList}
          onChange={v => updateFilterLists('easyList', v)}
          badge="Recommended"
        />
        <SettingRow
          label="EasyPrivacy"
          description="Blocks tracking and analytics"
          checked={settings.filterLists.easyPrivacy}
          onChange={v => updateFilterLists('easyPrivacy', v)}
          badge="Recommended"
        />
        <SettingRow
          label="Fanboy's Social Blocking"
          description="Blocks social media trackers"
          checked={settings.filterLists.fanboySocial}
          onChange={v => updateFilterLists('fanboySocial', v)}
        />
        <SettingRow
          label="uBlock Origin Filters"
          description="Additional comprehensive rules"
          checked={settings.filterLists.uBlockFilters}
          onChange={v => updateFilterLists('uBlockFilters', v)}
        />
      </Section>

      {/* Fingerprint Protection */}
      <Section title="Fingerprint Protection" description="Prevent browser fingerprinting" icon={<Fingerprint size={14} />}>
        <SettingRow
          label="Enable Fingerprint Protection"
          description="Master toggle for all fingerprint defenses"
          checked={settings.fingerprintProtection}
          onChange={v => updateSettings({ fingerprintProtection: v })}
        />
        {settings.fingerprintProtection && (
          <div className="mt-2 pl-3 border-l border-white/10 space-y-0">
            {[
              { key: 'canvas' as const, label: 'Canvas', desc: 'Add noise to canvas reads' },
              { key: 'webgl' as const, label: 'WebGL', desc: 'Spoof GPU vendor/renderer strings' },
              { key: 'audioContext' as const, label: 'AudioContext', desc: 'Add noise to audio buffer reads' },
              { key: 'battery' as const, label: 'Battery API', desc: 'Mask battery level and status' },
              { key: 'fonts' as const, label: 'Font Enumeration', desc: 'Block font list access' },
              { key: 'webRTC' as const, label: 'WebRTC', desc: 'Prevent IP leaks via STUN' },
              { key: 'hardwareConcurrency' as const, label: 'Hardware Concurrency', desc: 'Spoof CPU core count' },
              { key: 'deviceMemory' as const, label: 'Device Memory', desc: 'Spoof RAM amount' },
              { key: 'mediaDevices' as const, label: 'Media Devices', desc: 'Mask device list' },
            ].map(({ key, label, desc }) => (
              <SettingRow
                key={key}
                label={label}
                description={desc}
                checked={settings.fingerprint[key]}
                onChange={v => updateFingerprint(key, v)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Cookie & Privacy Cleaning */}
      <Section title="Privacy Cleaning" description="Manage cookies and stored data" icon={<Cookie size={14} />} defaultOpen={false}>
        <SettingRow
          label="Cookie Blocking"
          description="Block third-party tracking cookies"
          checked={settings.cookieCleaning}
          onChange={v => updateSettings({ cookieCleaning: v })}
        />
        <SettingRow
          label="Clear Cookies on Close"
          description="Remove all cookies when browser closes"
          checked={settings.cleaning.onClose}
          onChange={v => updateCleaning('onClose', v)}
        />
        <SettingRow
          label="Clear LocalStorage"
          description="Remove localStorage data on clean"
          checked={settings.cleaning.localStorage}
          onChange={v => updateCleaning('localStorage', v)}
        />
        <SettingRow
          label="Clear SessionStorage"
          description="Remove sessionStorage data on clean"
          checked={settings.cleaning.sessionStorage}
          onChange={v => updateCleaning('sessionStorage', v)}
        />
        <SettingRow
          label="Clear IndexedDB"
          description="Remove indexed database data on clean"
          checked={settings.cleaning.indexedDB}
          onChange={v => updateCleaning('indexedDB', v)}
        />
        <SettingRow
          label="Scheduled Cleaning"
          description="Automatically clean data at regular intervals"
          checked={settings.cleaning.scheduled}
          onChange={v => updateCleaning('scheduled', v)}
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications" description="Choose what to be notified about" icon={<Bell size={14} />} defaultOpen={false}>
        <SettingRow
          label="Dangerous Trackers"
          description="Alert when a high-risk tracker is blocked"
          checked={settings.notifications.dangerousTrackers}
          onChange={v => updateNotifications('dangerousTrackers', v)}
        />
        <SettingRow
          label="Protection Disabled"
          description="Notify when blocking is paused on a site"
          checked={settings.notifications.protectionDisabled}
          onChange={v => updateNotifications('protectionDisabled', v)}
        />
        <SettingRow
          label="Filter List Updates"
          description="Notify when filter lists are updated"
          checked={settings.notifications.filterListUpdates}
          onChange={v => updateNotifications('filterListUpdates', v)}
        />
        <SettingRow
          label="New Version"
          description="Notify when the extension is updated"
          checked={settings.notifications.newVersion}
          onChange={v => updateNotifications('newVersion', v)}
        />
        <SettingRow
          label="Blocking Milestones"
          description="Celebrate when blocking milestones are reached"
          checked={settings.notifications.massAdBlock}
          onChange={v => updateNotifications('massAdBlock', v)}
        />
      </Section>

      {/* Backup & Restore */}
      <Section title="Backup & Restore" description="Save and restore your settings" icon={<Database size={14} />} defaultOpen={false}>
        <div className="py-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={exportSettings}
          >
            Export Settings
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            loading={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            Import Settings
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={() => {
              if (confirm('Reset all settings to defaults?')) resetToDefaults()
            }}
          >
            Reset Defaults
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        {importSuccess === true && (
          <div className="mt-2 text-xs text-success-400">✓ Settings imported successfully</div>
        )}
        {importSuccess === false && (
          <div className="mt-2 text-xs text-danger-400">✗ Failed to import settings – invalid file</div>
        )}
      </Section>
    </div>
  )
}
