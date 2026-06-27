/**
 * RuleEngine – manages declarativeNetRequest dynamic rules.
 * Handles loading whitelist, blacklist, and per-site pause rules.
 */

import type { WhitelistEntry } from '../types'
import { STORAGE_KEYS } from '../constants'

const MAX_DYNAMIC_RULES = 5000

/** Load whitelist entries from storage */
export async function loadWhitelist(): Promise<WhitelistEntry[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.WHITELIST)
  return (result[STORAGE_KEYS.WHITELIST] as WhitelistEntry[]) ?? []
}

/** Save whitelist entries */
export async function saveWhitelist(entries: WhitelistEntry[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.WHITELIST]: entries })
}

/** Add a domain to the whitelist – disables blocking on that domain */
export async function addToWhitelist(domain: string): Promise<void> {
  const list = await loadWhitelist()
  const existing = list.findIndex(e => e.domain === domain)
  if (existing >= 0) {
    list[existing] = { ...list[existing], type: 'whitelist' }
  } else {
    list.push({ domain, addedAt: Date.now(), type: 'whitelist' })
  }
  await saveWhitelist(list)
  await updateAllowRules(list)
}

/** Remove a domain from the whitelist */
export async function removeFromWhitelist(domain: string): Promise<void> {
  const list = await loadWhitelist()
  const filtered = list.filter(e => e.domain !== domain)
  await saveWhitelist(filtered)
  await updateAllowRules(filtered)
}

/** Pause blocking on a domain for a given number of minutes */
export async function pauseSite(domain: string, minutes: number): Promise<void> {
  const list = await loadWhitelist()
  const pausedUntil = Date.now() + minutes * 60 * 1000
  const existing = list.findIndex(e => e.domain === domain)
  if (existing >= 0) {
    list[existing] = { ...list[existing], pausedUntil, type: 'whitelist' }
  } else {
    list.push({ domain, addedAt: Date.now(), type: 'whitelist', pausedUntil })
  }
  await saveWhitelist(list)
  await updateAllowRules(list)
}

/** Resume blocking on a previously paused domain */
export async function resumeSite(domain: string): Promise<void> {
  await removeFromWhitelist(domain)
}

/** Check if a domain is currently paused and clean up expired pauses */
export async function checkAndCleanPauses(): Promise<void> {
  const list = await loadWhitelist()
  const now = Date.now()
  const updated = list.filter(e => {
    if (e.pausedUntil && e.pausedUntil < now) return false // Expired pause, remove
    return true
  })
  if (updated.length !== list.length) {
    await saveWhitelist(updated)
    await updateAllowRules(updated)
  }
}

/** Update declarativeNetRequest allow rules based on whitelist */
async function updateAllowRules(entries: WhitelistEntry[]): Promise<void> {
  try {
    // Get existing dynamic rules to remove old allow rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
    const oldAllowRuleIds = existingRules
      .filter(r => r.priority === 100) // Priority 100 = allow rules
      .map(r => r.id)

    const now = Date.now()
    const activeEntries = entries.filter(e => {
      if (e.type === 'blacklist') return false
      if (e.pausedUntil && e.pausedUntil < now) return false
      return true
    })

    // Build new allow rules for whitelisted domains
    const newRules: chrome.declarativeNetRequest.Rule[] = activeEntries
      .slice(0, MAX_DYNAMIC_RULES)
      .map((entry, idx) => ({
        id: 90000 + idx,
        priority: 100, // Higher priority than block rules
        action: { type: 'allow' as chrome.declarativeNetRequest.RuleActionType },
        condition: {
          initiatorDomains: [entry.domain],
          resourceTypes: Object.values(chrome.declarativeNetRequest.ResourceType),
        },
      }))

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldAllowRuleIds,
      addRules: newRules,
    })
  } catch (err) {
    console.error('[PrivacyShield] Rule engine error:', err)
  }
}

/** Check if global blocking is enabled */
export async function isGloballyEnabled(): Promise<boolean> {
  const result = await chrome.storage.local.get('privacyshield_settings')
  const settings = result['privacyshield_settings'] as { enabled?: boolean } | undefined
  return settings?.enabled ?? true
}

/** Extract domain from URL */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** Check if domain is in whitelist */
export async function isDomainWhitelisted(domain: string): Promise<boolean> {
  const list = await loadWhitelist()
  const now = Date.now()
  return list.some(e => {
    if (e.domain !== domain) return false
    if (e.type === 'blacklist') return false
    if (e.pausedUntil && e.pausedUntil < now) return false
    return true
  })
}
