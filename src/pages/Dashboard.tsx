/**
 * Dashboard Page – statistics overview with charts.
 */

import React, { useState } from 'react'
import { BarChart3, Shield, Zap, Globe, Clock, TrendingUp, RefreshCw, Trash2 } from 'lucide-react'
import { useStats } from '../hooks/useStats'
import { MiniBarChart, StatCard, RadialScore } from '../components/ui/Chart'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Tabs } from '../components/ui/Tabs'
import { cn } from '../utils/cn'

type Period = 'today' | 'week' | 'month' | 'lifetime'

export function Dashboard() {
  const { stats, formatted, loading, resetStats } = useStats()
  const [period, setPeriod] = useState<Period>('today')
  const [resetting, setResetting] = useState(false)

  async function handleReset() {
    setResetting(true)
    await resetStats()
    setResetting(false)
  }

  const periodStats = period === 'today'
    ? { ads: stats.today.adsBlocked, trackers: stats.today.trackersBlocked, requests: stats.today.requestsBlocked, bandwidth: stats.today.bandwidthSaved }
    : period === 'lifetime'
    ? { ads: stats.lifetime.adsBlocked, trackers: stats.lifetime.trackersBlocked, requests: stats.lifetime.requestsBlocked, bandwidth: stats.lifetime.bandwidthSaved }
    : { ads: stats.adsBlocked, trackers: stats.trackersBlocked, requests: stats.requestsBlocked, bandwidth: stats.bandwidthSaved }

  const privacyScore = Math.min(100, Math.round(
    (stats.lifetime.adsBlocked + stats.lifetime.trackersBlocked > 0 ? 95 : 60)
  ))

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-sm text-white/50 mt-0.5">Your privacy protection overview</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} />}
          loading={resetting}
          onClick={handleReset}
        >
          Reset Stats
        </Button>
      </div>

      {/* Hero stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Ads Blocked"
          value={formatted.adsBlocked}
          icon={<Shield size={16} />}
          color="#6366f1"
          subValue="lifetime"
        />
        <StatCard
          label="Trackers Blocked"
          value={formatted.trackersBlocked}
          icon={<Zap size={16} />}
          color="#d946ef"
          subValue="lifetime"
        />
        <StatCard
          label="Bandwidth Saved"
          value={formatted.bandwidthSaved}
          icon={<TrendingUp size={16} />}
          color="#22c55e"
          subValue="estimated"
        />
        <StatCard
          label="Time Saved"
          value={formatted.timeSaved}
          icon={<Clock size={16} />}
          color="#f59e0b"
          subValue="estimated"
        />
      </div>

      {/* Privacy Score + Chart grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Privacy Score */}
        <div className="glass rounded-2xl border border-white/8 p-5 flex flex-col items-center justify-center">
          <div className="text-xs text-white/40 mb-3 uppercase tracking-widest font-semibold">
            Privacy Score
          </div>
          <RadialScore
            score={privacyScore}
            size={120}
            strokeWidth={10}
            color={privacyScore >= 80 ? '#22c55e' : privacyScore >= 60 ? '#f59e0b' : '#ef4444'}
            label="/100"
          />
          <div className="mt-4 text-center">
            <div className="text-sm font-semibold text-white/80">
              {privacyScore >= 90 ? 'Excellent Protection' :
               privacyScore >= 70 ? 'Good Protection' :
               privacyScore >= 50 ? 'Moderate Protection' : 'Low Protection'}
            </div>
            <div className="text-xs text-white/40 mt-1">Based on active protections</div>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="md:col-span-2 glass rounded-2xl border border-white/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">Blocked This Week</div>
            <Badge variant="info" size="xs">
              {stats.thisWeek.length} days
            </Badge>
          </div>
          <div className="flex gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#6366f1' }} />
              Ads
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#d946ef' }} />
              Trackers
            </div>
          </div>
          {stats.thisWeek.length > 0 ? (
            <div className="space-y-2">
              <MiniBarChart
                data={stats.thisWeek}
                dataKey="adsBlocked"
                color="#6366f1"
                height={60}
              />
              <MiniBarChart
                data={stats.thisWeek}
                dataKey="trackersBlocked"
                color="#d946ef"
                height={40}
              />
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-white/30 text-sm">
              Start browsing to see statistics
            </div>
          )}
        </div>
      </div>

      {/* Detailed stats by period */}
      <div className="glass rounded-2xl border border-white/8 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Statistics Breakdown</h2>
          <Tabs
            tabs={[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
              { id: 'lifetime', label: 'All Time' },
            ]}
            activeTab={period}
            onChange={id => setPeriod(id as Period)}
            variant="pills"
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Ads Blocked', value: periodStats.ads.toLocaleString(), color: '#6366f1' },
            { label: 'Trackers', value: periodStats.trackers.toLocaleString(), color: '#d946ef' },
            { label: 'Requests', value: periodStats.requests.toLocaleString(), color: '#22c55e' },
            { label: 'Data Saved', value: formatBytes(periodStats.bandwidth), color: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl bg-white/4 border border-white/6 p-3">
              <div className="font-bold text-lg" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Additional lifetime stats */}
        {period === 'lifetime' && (
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/8">
            <div className="rounded-xl bg-white/4 border border-white/6 p-3">
              <div className="font-bold text-lg text-brand-400">
                {stats.lifetime.websitesProtected.toLocaleString()}
              </div>
              <div className="text-xs text-white/40">Websites Protected</div>
            </div>
            <div className="rounded-xl bg-white/4 border border-white/6 p-3">
              <div className="font-bold text-lg text-accent-400">
                {stats.lifetime.daysActive}
              </div>
              <div className="text-xs text-white/40">Days Active</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
