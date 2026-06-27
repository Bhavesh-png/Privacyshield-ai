/**
 * useStats hook – reads live extension statistics from chrome.storage.
 */

import { useState, useEffect } from 'react'
import type { ExtensionStats } from '../types'
import { DEFAULT_STATS, STORAGE_KEYS } from '../constants'
import { formatBytes, formatTimeSaved } from '../background/statsTracker'

export interface FormattedStats {
  raw: ExtensionStats
  adsBlocked: string
  trackersBlocked: string
  requestsBlocked: string
  bandwidthSaved: string
  timeSaved: string
  cookiesBlocked: string
  websitesProtected: string
}

export function useStats() {
  const [stats, setStats] = useState<ExtensionStats>(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[STORAGE_KEYS.STATS]) {
        const newValue = changes[STORAGE_KEYS.STATS].newValue as ExtensionStats | undefined
        if (newValue) setStats(prev => ({ ...prev, ...newValue }))
      }
    }
    chrome.storage.onChanged.addListener(listener)

    // Refresh every 5 seconds for live updates
    const interval = setInterval(loadStats, 5000)
    return () => {
      chrome.storage.onChanged.removeListener(listener)
      clearInterval(interval)
    }
  }, [])

  async function loadStats() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.STATS)
      const stored = result[STORAGE_KEYS.STATS] as ExtensionStats | undefined
      if (stored) {
        setStats(stored)
      }
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatted: FormattedStats = {
    raw: stats,
    adsBlocked: stats.adsBlocked.toLocaleString(),
    trackersBlocked: stats.trackersBlocked.toLocaleString(),
    requestsBlocked: stats.requestsBlocked.toLocaleString(),
    bandwidthSaved: formatBytes(stats.bandwidthSaved),
    timeSaved: formatTimeSaved(stats.timeSaved),
    cookiesBlocked: stats.cookiesBlocked.toLocaleString(),
    websitesProtected: stats.lifetime.websitesProtected.toLocaleString(),
  }

  const resetStats = async () => {
    await chrome.runtime.sendMessage({ type: 'RESET_STATS' })
    setStats(DEFAULT_STATS)
  }

  return { stats, formatted, loading, resetStats }
}
