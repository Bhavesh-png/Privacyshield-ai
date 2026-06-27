// ============================================================
// Core extension types
// ============================================================

export interface ExtensionSettings {
  enabled: boolean
  darkMode: boolean
  protectionLevel: 'low' | 'medium' | 'high' | 'paranoid'

  // Feature toggles
  adBlocking: boolean
  trackerBlocking: boolean
  fingerprintProtection: boolean
  cookieCleaning: boolean

  // Fingerprint sub-settings
  fingerprint: {
    canvas: boolean
    webgl: boolean
    audioContext: boolean
    battery: boolean
    fonts: boolean
    screenResolution: boolean
    timezone: boolean
    language: boolean
    webRTC: boolean
    hardwareConcurrency: boolean
    deviceMemory: boolean
    mediaDevices: boolean
  }

  // Cleaning settings
  cleaning: {
    cookies: boolean
    cache: boolean
    localStorage: boolean
    sessionStorage: boolean
    indexedDB: boolean
    onClose: boolean
    scheduled: boolean
    scheduleInterval: number // minutes
  }

  // Notifications
  notifications: {
    dangerousTrackers: boolean
    protectionDisabled: boolean
    filterListUpdates: boolean
    newVersion: boolean
    massAdBlock: boolean
  }

  // Filter lists
  filterLists: {
    easyList: boolean
    easyPrivacy: boolean
    fanboySocial: boolean
    uBlockFilters: boolean
    customRules: string[]
  }
}

export interface ExtensionStats {
  adsBlocked: number
  trackersBlocked: number
  cookiesBlocked: number
  requestsBlocked: number
  bandwidthSaved: number // bytes
  timeSaved: number // milliseconds

  // Time-bucketed stats
  today: DayStats
  thisWeek: DayStats[]
  thisMonth: DayStats[]
  lifetime: LifetimeStats
}

export interface DayStats {
  date: string // ISO date string YYYY-MM-DD
  adsBlocked: number
  trackersBlocked: number
  requestsBlocked: number
  bandwidthSaved: number
}

export interface LifetimeStats {
  adsBlocked: number
  trackersBlocked: number
  requestsBlocked: number
  bandwidthSaved: number
  timeSaved: number
  websitesProtected: number
  daysActive: number
}

export interface TabInfo {
  tabId: number
  url: string
  domain: string
  enabled: boolean
  paused: boolean
  pausedUntil?: number // timestamp
  stats: {
    adsBlocked: number
    trackersBlocked: number
    requestsBlocked: number
  }
  privacyScore: number // 0-100
}

export interface WhitelistEntry {
  domain: string
  addedAt: number
  type: 'whitelist' | 'blacklist'
  pausedUntil?: number
}

export interface BlockedRequest {
  url: string
  type: 'ad' | 'tracker' | 'fingerprint' | 'other'
  domain: string
  timestamp: number
  tabId: number
}

export interface NotificationPayload {
  type: 'dangerous_tracker' | 'protection_disabled' | 'filter_update' | 'new_version' | 'mass_block'
  title: string
  message: string
  data?: Record<string, unknown>
}

export interface MessagePayload {
  type: MessageType
  data?: unknown
}

export type MessageType =
  | 'GET_SETTINGS'
  | 'SET_SETTINGS'
  | 'GET_STATS'
  | 'GET_TAB_INFO'
  | 'TOGGLE_SITE'
  | 'WHITELIST_SITE'
  | 'PAUSE_SITE'
  | 'CLEAN_DATA'
  | 'RESET_STATS'
  | 'EXPORT_SETTINGS'
  | 'IMPORT_SETTINGS'
  | 'BLOCK_RECORDED'
  | 'UPDATE_FILTER_LISTS'
  | 'SHOW_TOAST'

export interface PrivacyScore {
  score: number // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  threats: ThreatItem[]
  label: string
  color: string
}

export interface ThreatItem {
  name: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  blocked: boolean
  description: string
}

export type Theme = 'dark' | 'light' | 'system'
