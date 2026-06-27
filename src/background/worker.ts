/**
 * PrivacyShield AI – Background Service Worker
 * Entry point for all background processing.
 *
 * Responsibilities:
 * - Intercept and log blocked requests (via webNavigation + storage)
 * - Manage whitelist / pause rules
 * - Handle popup/options messaging
 * - Run scheduled cleaning alarms
 * - Send notifications
 */

import { loadStats, saveStats, recordRequestBlocked, recordWebsiteProtected, resetStats } from './statsTracker'
import {
  loadWhitelist,
  addToWhitelist,
  removeFromWhitelist,
  pauseSite,
  resumeSite,
  checkAndCleanPauses,
  extractDomain,
  isDomainWhitelisted,
} from './ruleEngine'
import {
  notifyDangerousTracker,
  notifyProtectionDisabled,
  notifyNewVersion,
  notifyMassBlock,
} from './notifications'
import {
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  EXTENSION_VERSION,
  ALARMS,
  DANGEROUS_TRACKERS,
  BANDWIDTH_PER_AD,
} from '../constants'
import type { ExtensionSettings, MessagePayload, TabInfo } from '../types'

// ============================================================
// Tab stats tracking (in-memory, per tab)
// ============================================================

const tabStats = new Map<number, TabInfo>()

function getOrCreateTabInfo(tabId: number, url?: string): TabInfo {
  if (!tabStats.has(tabId)) {
    const domain = url ? extractDomain(url) : ''
    tabStats.set(tabId, {
      tabId,
      url: url ?? '',
      domain,
      enabled: true,
      paused: false,
      stats: { adsBlocked: 0, trackersBlocked: 0, requestsBlocked: 0 },
      privacyScore: 100,
    })
  }
  return tabStats.get(tabId)!
}

// ============================================================
// Install / Update lifecycle
// ============================================================

chrome.runtime.onInstalled.addListener(async details => {
  console.log('[PrivacyShield] onInstalled', details.reason)

  if (details.reason === 'install') {
    // Initialize default settings
    await chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS,
      [STORAGE_KEYS.INSTALL_DATE]: Date.now(),
      [STORAGE_KEYS.VERSION]: EXTENSION_VERSION,
    })

    // Open options page on first install
    chrome.tabs.create({ url: chrome.runtime.getURL('options/index.html') })
  }

  if (details.reason === 'update') {
    const settings = await loadSettings()
    if (settings.notifications.newVersion) {
      await notifyNewVersion(EXTENSION_VERSION)
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.VERSION]: EXTENSION_VERSION })
  }

  // Set up recurring alarms
  await chrome.alarms.clearAll()
  chrome.alarms.create(ALARMS.STATS_SYNC, { periodInMinutes: 1 })
  chrome.alarms.create(ALARMS.SCHEDULED_CLEAN, { periodInMinutes: 60 })
})

// ============================================================
// Alarm handlers
// ============================================================

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === ALARMS.STATS_SYNC) {
    await checkAndCleanPauses()
  }

  if (alarm.name === ALARMS.SCHEDULED_CLEAN) {
    const settings = await loadSettings()
    if (settings.cleaning.scheduled) {
      await performDataCleaning(settings)
    }
  }
})

// ============================================================
// Tab lifecycle tracking
// ============================================================

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    const info = getOrCreateTabInfo(tabId, tab.url)
    tabStats.set(tabId, { ...info, url: tab.url, domain: extractDomain(tab.url) })
    await recordWebsiteProtected()
  }
})

chrome.tabs.onRemoved.addListener(tabId => {
  tabStats.delete(tabId)
})

// ============================================================
// declarativeNetRequest feedback (track blocked requests)
// ============================================================

// Note: MV3 doesn't allow webRequest blocking, but we can use
// declarativeNetRequestFeedback to observe blocked requests
if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(async info => {
    const tabId = info.request.tabId
    const url = info.request.url
    const domain = extractDomain(url)

    // Determine block type from rule
    let blockType: 'ad' | 'tracker' | 'other' = 'other'
    if (info.rule.rulesetId === 'ad_rules') blockType = 'ad'
    else if (info.rule.rulesetId === 'tracker_rules') blockType = 'tracker'

    // Update tab stats
    if (tabId > 0) {
      const tabInfo = getOrCreateTabInfo(tabId)
      if (blockType === 'ad') tabInfo.stats.adsBlocked++
      else if (blockType === 'tracker') tabInfo.stats.trackersBlocked++
      tabInfo.stats.requestsBlocked++
      // Reduce privacy score based on tracker threats
      tabInfo.privacyScore = Math.max(0, tabInfo.privacyScore - 2)
      tabStats.set(tabId, tabInfo)
    }

    // Update global stats
    await recordRequestBlocked(blockType)

    // Check for dangerous trackers
    const settings = await loadSettings()
    if (settings.notifications.dangerousTrackers) {
      if (DANGEROUS_TRACKERS.some(t => domain.includes(t))) {
        await notifyDangerousTracker(domain)
      }
    }

    // Mass block milestones
    if (settings.notifications.massAdBlock) {
      const stats = await loadStats()
      const total = stats.adsBlocked + stats.trackersBlocked
      const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000]
      if (milestones.includes(total)) {
        await notifyMassBlock(total)
      }
    }
  })
}

// ============================================================
// Message handling (from popup / options)
// ============================================================

chrome.runtime.onMessage.addListener((message: MessagePayload, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(err => {
    console.error('[PrivacyShield] Message error:', err)
    sendResponse({ error: err.message })
  })
  return true // Keep channel open for async response
})

async function handleMessage(
  message: MessagePayload,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  const { type, data } = message

  switch (type) {
    case 'GET_SETTINGS':
      return loadSettings()

    case 'SET_SETTINGS': {
      const settings = data as ExtensionSettings
      await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings })
      return { success: true }
    }

    case 'GET_STATS':
      return loadStats()

    case 'RESET_STATS':
      await resetStats()
      return { success: true }

    case 'GET_TAB_INFO': {
      const tabId = (data as { tabId: number }).tabId
      return tabStats.get(tabId) ?? null
    }

    case 'TOGGLE_SITE': {
      const { domain, enabled } = data as { domain: string; enabled: boolean }
      if (enabled) {
        await resumeSite(domain)
      } else {
        const settings = await loadSettings()
        if (settings.notifications.protectionDisabled) {
          await notifyProtectionDisabled(domain)
        }
        await addToWhitelist(domain)
      }
      return { success: true }
    }

    case 'WHITELIST_SITE': {
      const { domain, action } = data as { domain: string; action: 'add' | 'remove' }
      if (action === 'add') await addToWhitelist(domain)
      else await removeFromWhitelist(domain)
      return { success: true }
    }

    case 'PAUSE_SITE': {
      const { domain, minutes } = data as { domain: string; minutes: number }
      await pauseSite(domain, minutes)
      return { success: true }
    }

    case 'CLEAN_DATA': {
      const settings = await loadSettings()
      await performDataCleaning(settings)
      return { success: true }
    }

    case 'EXPORT_SETTINGS': {
      const settings = await loadSettings()
      return { settings }
    }

    case 'IMPORT_SETTINGS': {
      const imported = data as ExtensionSettings
      await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: imported })
      return { success: true }
    }

    default:
      return { error: 'Unknown message type' }
  }
}

// ============================================================
// Helpers
// ============================================================

async function loadSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
  return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] ?? {}) }
}

async function performDataCleaning(settings: ExtensionSettings): Promise<void> {
  try {
    const origins = ['<all_urls>']
    const dataToRemove: chrome.browsingData.DataTypeSet = {}

    if (settings.cleaning.cookies) dataToRemove.cookies = true
    if (settings.cleaning.cache) dataToRemove.cache = true
    if (settings.cleaning.localStorage) dataToRemove.localStorage = true
    if (settings.cleaning.indexedDB) dataToRemove.indexedDB = true

    if (Object.keys(dataToRemove).length > 0) {
      await chrome.browsingData.remove(
        { since: 0 },
        dataToRemove
      )
    }
  } catch (err) {
    console.error('[PrivacyShield] Data cleaning error:', err)
  }
}

console.log('[PrivacyShield AI] Service worker started v' + EXTENSION_VERSION)
