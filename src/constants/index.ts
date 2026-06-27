import type { ExtensionSettings, ExtensionStats, DayStats, LifetimeStats } from '../types'

// ============================================================
// Default extension settings
// ============================================================

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  darkMode: true,
  protectionLevel: 'high',

  adBlocking: true,
  trackerBlocking: true,
  fingerprintProtection: true,
  cookieCleaning: false,

  fingerprint: {
    canvas: true,
    webgl: true,
    audioContext: true,
    battery: true,
    fonts: true,
    screenResolution: false,
    timezone: false,
    language: false,
    webRTC: true,
    hardwareConcurrency: true,
    deviceMemory: true,
    mediaDevices: true,
  },

  cleaning: {
    cookies: true,
    cache: false,
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    onClose: false,
    scheduled: false,
    scheduleInterval: 60,
  },

  notifications: {
    dangerousTrackers: false,
    protectionDisabled: true,
    filterListUpdates: true,
    newVersion: true,
    massAdBlock: false,
  },

  filterLists: {
    easyList: true,
    easyPrivacy: true,
    fanboySocial: true,
    uBlockFilters: true,
    customRules: [],
  },
}

// ============================================================
// Default stats
// ============================================================

export const DEFAULT_DAY_STATS: DayStats = {
  date: new Date().toISOString().split('T')[0],
  adsBlocked: 0,
  trackersBlocked: 0,
  requestsBlocked: 0,
  bandwidthSaved: 0,
}

export const DEFAULT_LIFETIME_STATS: LifetimeStats = {
  adsBlocked: 0,
  trackersBlocked: 0,
  requestsBlocked: 0,
  bandwidthSaved: 0,
  timeSaved: 0,
  websitesProtected: 0,
  daysActive: 1,
}

export const DEFAULT_STATS: ExtensionStats = {
  adsBlocked: 0,
  trackersBlocked: 0,
  cookiesBlocked: 0,
  requestsBlocked: 0,
  bandwidthSaved: 0,
  timeSaved: 0,
  today: DEFAULT_DAY_STATS,
  thisWeek: [],
  thisMonth: [],
  lifetime: DEFAULT_LIFETIME_STATS,
}

// ============================================================
// Storage keys
// ============================================================

export const STORAGE_KEYS = {
  SETTINGS: 'privacyshield_settings',
  STATS: 'privacyshield_stats',
  WHITELIST: 'privacyshield_whitelist',
  TAB_STATS: 'privacyshield_tab_stats',
  INSTALL_DATE: 'privacyshield_install_date',
  VERSION: 'privacyshield_version',
} as const

// ============================================================
// Extension metadata
// ============================================================

export const EXTENSION_VERSION = '1.0.0'
export const EXTENSION_NAME = 'PrivacyShield AI'

// ============================================================
// Bandwidth estimation per request type (bytes)
// ============================================================

export const BANDWIDTH_PER_AD = 150_000 // ~150KB avg ad
export const BANDWIDTH_PER_TRACKER = 50_000 // ~50KB avg tracker
export const TIME_PER_AD_MS = 200 // ~200ms loading time saved per ad

// ============================================================
// Protection level rule counts
// ============================================================

export const PROTECTION_LEVELS = {
  low: { maxRules: 1000, fingerprint: false },
  medium: { maxRules: 5000, fingerprint: false },
  high: { maxRules: 20000, fingerprint: true },
  paranoid: { maxRules: 30000, fingerprint: true },
} as const

// ============================================================
// Alarm names
// ============================================================

export const ALARMS = {
  SCHEDULED_CLEAN: 'scheduled_clean',
  STATS_SYNC: 'stats_sync',
  FILTER_UPDATE: 'filter_update',
} as const

// ============================================================
// Dangerous tracker domains (triggers notification)
// ============================================================

export const DANGEROUS_TRACKERS = [
  'doubleclick.net',
  'facebook.com/tr',
  'connect.facebook.net',
  'scorecardresearch.com',
  'quantserve.com',
  'bluekai.com',
  'exelator.com',
  'krxd.net',
  'demdex.net',
  'omtrdc.net',
]
