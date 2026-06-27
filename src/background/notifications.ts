/**
 * Notifications module – sends Chrome notifications for important events.
 */

import type { NotificationPayload } from '../types'

const ICON_URL = chrome.runtime.getURL('icons/icon128.png')

const lastSent = new Map<string, number>()
const MIN_INTERVALS: Record<string, number> = {
  dangerous_tracker: 120_000, // 2 minutes
  protection_disabled: 5_000,
  filter_update: 60_000,
  new_version: 60_000,
  mass_block: 300_000, // 5 minutes
}

/** Send a Chrome notification */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  try {
    const now = Date.now()
    const lastTime = lastSent.get(payload.type) || 0
    const minInterval = MIN_INTERVALS[payload.type] || 60_000

    if (now - lastTime < minInterval) {
      return // Skip to avoid spamming the user
    }

    lastSent.set(payload.type, now)

    // Query active tab to send browser-level toast notification
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const activeTab = tabs[0]
    if (activeTab?.id) {
      await chrome.tabs.sendMessage(activeTab.id, {
        type: 'SHOW_TOAST',
        data: {
          title: payload.title,
          message: payload.message,
          type: payload.type,
        },
      })
    }
  } catch (err) {
    // Expected when user is on a system tab or before content script loads
    console.debug('[PrivacyShield] Failed to send web toast, target tab not active or scripted:', err)
  }
}

/** Notify about a dangerous tracker */
export async function notifyDangerousTracker(domain: string): Promise<void> {
  await sendNotification({
    type: 'dangerous_tracker',
    title: '⚠️ Dangerous Tracker Blocked',
    message: `PrivacyShield blocked a high-risk tracker from ${domain}`,
  })
}

/** Notify about protection being disabled */
export async function notifyProtectionDisabled(domain: string): Promise<void> {
  await sendNotification({
    type: 'protection_disabled',
    title: '🛡️ Protection Disabled',
    message: `Ad blocking is paused for ${domain || 'this site'}`,
  })
}

/** Notify about filter list update */
export async function notifyFilterUpdate(listsUpdated: number): Promise<void> {
  await sendNotification({
    type: 'filter_update',
    title: '✅ Filter Lists Updated',
    message: `${listsUpdated} filter list${listsUpdated > 1 ? 's' : ''} were updated successfully`,
  })
}

/** Notify about a new extension version */
export async function notifyNewVersion(version: string): Promise<void> {
  await sendNotification({
    type: 'new_version',
    title: '🚀 PrivacyShield AI Updated',
    message: `Version ${version} is now installed with improved protection`,
  })
}

/** Notify when mass blocking milestone hit */
export async function notifyMassBlock(count: number): Promise<void> {
  await sendNotification({
    type: 'mass_block',
    title: '🎉 Milestone Reached!',
    message: `PrivacyShield has blocked ${count.toLocaleString()} ads and trackers for you!`,
  })
}
