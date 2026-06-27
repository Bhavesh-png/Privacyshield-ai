/**
 * StatsTracker – tracks blocked requests, bandwidth saved, and time-bucketed stats.
 * All data is persisted to chrome.storage.local.
 */

import {
  DEFAULT_STATS,
  DEFAULT_DAY_STATS,
  STORAGE_KEYS,
  BANDWIDTH_PER_AD,
  BANDWIDTH_PER_TRACKER,
  TIME_PER_AD_MS,
} from '../constants'
import type { ExtensionStats, DayStats } from '../types'

/** Load current stats from storage */
export async function loadStats(): Promise<ExtensionStats> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.STATS)
  if (result[STORAGE_KEYS.STATS]) {
    return result[STORAGE_KEYS.STATS] as ExtensionStats
  }
  return { ...DEFAULT_STATS, today: { ...DEFAULT_DAY_STATS, date: getTodayKey() } }
}

/** Persist stats to storage */
export async function saveStats(stats: ExtensionStats): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.STATS]: stats })
}

/** Get today's date as YYYY-MM-DD */
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

/** Ensure today bucket exists and rotate if needed */
function ensureToday(stats: ExtensionStats): ExtensionStats {
  const today = getTodayKey()
  if (stats.today.date !== today) {
    // Push yesterday into the week/month history
    const yesterday = { ...stats.today }
    stats.thisWeek = [yesterday, ...stats.thisWeek].slice(0, 7)
    stats.thisMonth = [yesterday, ...stats.thisMonth].slice(0, 30)
    stats.today = { ...DEFAULT_DAY_STATS, date: today }
    stats.lifetime.daysActive += 1
  }
  return stats
}

/** Record a blocked ad */
export async function recordAdBlocked(): Promise<void> {
  const stats = ensureToday(await loadStats())
  stats.adsBlocked += 1
  stats.requestsBlocked += 1
  stats.bandwidthSaved += BANDWIDTH_PER_AD
  stats.timeSaved += TIME_PER_AD_MS
  stats.today.adsBlocked += 1
  stats.today.requestsBlocked += 1
  stats.today.bandwidthSaved += BANDWIDTH_PER_AD
  stats.lifetime.adsBlocked += 1
  stats.lifetime.requestsBlocked += 1
  stats.lifetime.bandwidthSaved += BANDWIDTH_PER_AD
  stats.lifetime.timeSaved += TIME_PER_AD_MS
  await saveStats(stats)
}

/** Record a blocked tracker */
export async function recordTrackerBlocked(): Promise<void> {
  const stats = ensureToday(await loadStats())
  stats.trackersBlocked += 1
  stats.requestsBlocked += 1
  stats.bandwidthSaved += BANDWIDTH_PER_TRACKER
  stats.today.trackersBlocked += 1
  stats.today.requestsBlocked += 1
  stats.today.bandwidthSaved += BANDWIDTH_PER_TRACKER
  stats.lifetime.trackersBlocked += 1
  stats.lifetime.requestsBlocked += 1
  stats.lifetime.bandwidthSaved += BANDWIDTH_PER_TRACKER
  await saveStats(stats)
}

/** Record a generic blocked request */
export async function recordRequestBlocked(type: 'ad' | 'tracker' | 'other'): Promise<void> {
  if (type === 'ad') return recordAdBlocked()
  if (type === 'tracker') return recordTrackerBlocked()
  const stats = ensureToday(await loadStats())
  stats.requestsBlocked += 1
  stats.today.requestsBlocked += 1
  stats.lifetime.requestsBlocked += 1
  await saveStats(stats)
}

/** Record cookies blocked */
export async function recordCookiesBlocked(count: number): Promise<void> {
  const stats = ensureToday(await loadStats())
  stats.cookiesBlocked += count
  await saveStats(stats)
}

/** Increment websites protected counter */
export async function recordWebsiteProtected(): Promise<void> {
  const stats = ensureToday(await loadStats())
  stats.lifetime.websitesProtected += 1
  await saveStats(stats)
}

/** Reset all stats */
export async function resetStats(): Promise<void> {
  const fresh: ExtensionStats = {
    ...DEFAULT_STATS,
    today: { ...DEFAULT_DAY_STATS, date: getTodayKey() },
  }
  await saveStats(fresh)
}

/** Format bytes to human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/** Format milliseconds to human-readable time saved */
export function formatTimeSaved(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  return `${(ms / 3600000).toFixed(1)}h`
}
