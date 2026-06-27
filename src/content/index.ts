/**
 * Content Script Entry Point
 * Coordinates all content-side protection modules.
 * Runs at document_start before any page scripts.
 */

import { initAntiFingerprint } from './antiFingerprint'
import { initCosmeticFilter, pauseCosmeticFilter, resumeCosmeticFilter } from './cosmeticFilter'
import { blockThirdPartyCookies } from './cookieCleaner'
import type { ExtensionSettings, MessagePayload } from '../types'
import { DEFAULT_SETTINGS } from '../constants'

// ============================================================
// State
// ============================================================

let currentSettings: ExtensionSettings = DEFAULT_SETTINGS
let isInitialized = false

// ============================================================
// Initialization
// ============================================================

async function initialize(): Promise<void> {
  if (isInitialized) return
  isInitialized = true

  try {
    // Load settings from background
    const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' } as MessagePayload)
    if (response && !response.error) {
      currentSettings = response as ExtensionSettings
    }
  } catch {
    // Use defaults if communication fails (e.g., first load)
    currentSettings = DEFAULT_SETTINGS
  }

  // Check if this site is paused/whitelisted
  const domain = window.location.hostname.replace(/^www\./, '')

  if (!currentSettings.enabled) {
    console.debug('[PrivacyShield] Globally disabled')
    return
  }

  // Initialize protection modules
  if (currentSettings.fingerprintProtection) {
    initAntiFingerprint(currentSettings.fingerprint)
  }

  if (currentSettings.adBlocking) {
    // Cosmetic filter runs after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initCosmeticFilter(), { once: true })
    } else {
      initCosmeticFilter()
    }
  }

  if (currentSettings.cookieCleaning && currentSettings.cleaning.cookies) {
    blockThirdPartyCookies()
  }

  console.debug('[PrivacyShield] Content script initialized on', domain)
}

// ============================================================
// Listen for messages from background / popup
// ============================================================

chrome.runtime.onMessage.addListener((message: MessagePayload, _sender, sendResponse) => {
  handleContentMessage(message).then(sendResponse)
  return true
})

async function handleContentMessage(message: MessagePayload): Promise<unknown> {
  switch (message.type) {
    case 'TOGGLE_SITE': {
      const { enabled } = message.data as { domain: string; enabled: boolean }
      if (enabled) {
        resumeCosmeticFilter()
        initAntiFingerprint(currentSettings.fingerprint)
      } else {
        pauseCosmeticFilter()
      }
      return { success: true }
    }

    case 'GET_SETTINGS':
      return currentSettings

    case 'SHOW_TOAST': {
      const { title, message: body, type } = message.data as { title: string; message: string; type: string }
      showBrowserToast(title, body, type)
      return { success: true }
    }

    default:
      return null
  }
}

// ============================================================
// YouTube-specific: Skip pre-roll ads
// ============================================================

function initYouTubeAdSkip(): void {
  if (!window.location.hostname.includes('youtube.com')) return

  setInterval(() => {
    const isAdActive = document.querySelector('.ad-showing, .ad-interrupting') || 
                       document.querySelector('.ytp-ad-player-overlay, .ytp-ad-message-container')

    const video = document.querySelector<HTMLVideoElement>('video.html5-main-video')

    if (isAdActive) {
      // Click skip button if available
      const skipBtn = document.querySelector<HTMLButtonElement>('.ytp-skip-ad-button, .ytp-ad-skip-button')
      if (skipBtn) {
        skipBtn.click()
      }

      // Fast forward and mute
      if (video) {
        video.muted = true
        video.playbackRate = 16 // 16x playback speed to finish ad instantly

        // If it's a non-skippable or skippable video ad, skip it manually by jumping to the end
        if (video.duration && isFinite(video.duration) && video.currentTime < video.duration - 0.2) {
          video.currentTime = video.duration - 0.1
        }
      }
    } else {
      // Restore normal playback speed and unmute if we previously sped it up
      if (video && video.playbackRate > 2) {
        video.playbackRate = 1
        video.muted = false
      }
    }
  }, 250)
}

// ============================================================
// Spotify-specific: Skip audio ads
// ============================================================

function initSpotifyAdSkip(): void {
  if (!window.location.hostname.includes('spotify.com')) return

  setInterval(() => {
    // Find ad indicator and skip
    const adBanner = document.querySelector('[data-testid="audio-ad-banner"]') ||
                     document.querySelector('.ad-container') ||
                     document.querySelector('[aria-label*="Advertisement"]')

    if (adBanner) {
      // Mute during ad
      const nowPlayingBar = document.querySelector<HTMLElement>('[data-testid="now-playing-bar"]')
      if (nowPlayingBar) {
        const volumeSlider = nowPlayingBar.querySelector<HTMLInputElement>('input[type="range"]')
        if (volumeSlider) {
          volumeSlider.value = '0'
          volumeSlider.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }
    }
  }, 500)
}

// ============================================================
// Bootstrap
// ============================================================

// Run immediately (document_start)
initialize()

// Platform-specific ad skip (after DOM ready)
document.addEventListener('DOMContentLoaded', () => {
  initYouTubeAdSkip()
  initSpotifyAdSkip()
}, { once: true })

// ============================================================
// Glassmorphic In-Browser Notifications
// ============================================================

function showBrowserToast(title: string, message: string, type: string): void {
  // Check if container exists, if not create it
  let container = document.getElementById('privacyshield-toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'privacyshield-toast-container'
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '2147483647',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    })
    document.body.appendChild(container)
  }

  // Create individual toast card
  const toast = document.createElement('div')
  Object.assign(toast.style, {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    width: '320px',
    padding: '14px 16px',
    borderRadius: '16px',
    background: 'rgba(15, 15, 20, 0.85)',
    backdropFilter: 'blur(12px)',
    webkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    opacity: '0',
    transform: 'translateY(20px) scale(0.95)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  })

  // Determine icon based on notification type
  let icon = '🛡️'
  if (type === 'dangerous_tracker') icon = '⚠️'
  else if (type === 'mass_block') icon = '🎉'
  else if (type === 'protection_disabled') icon = '🔓'
  else if (type === 'new_version') icon = '🚀'

  toast.innerHTML = `
    <div style="font-size: 18px; line-height: 1; margin-top: 2px;">${icon}</div>
    <div style="flex: 1; min-width: 0;">
      <div style="font-weight: 700; font-size: 13px; color: #ffffff; margin-bottom: 3px;">${title}</div>
      <div style="font-size: 11px; color: rgba(255, 255, 255, 0.6); line-height: 1.4; word-break: break-word;">${message}</div>
    </div>
    <button style="background: none; border: none; color: rgba(255, 255, 255, 0.3); font-size: 14px; cursor: pointer; padding: 0; line-height: 1; transition: color 0.2s;">✕</button>
  `

  // Close button trigger
  const closeBtn = toast.querySelector('button')
  if (closeBtn) {
    closeBtn.onmouseover = () => { closeBtn.style.color = '#ffffff' }
    closeBtn.onmouseout = () => { closeBtn.style.color = 'rgba(255, 255, 255, 0.3)' }
    closeBtn.onclick = () => removeToast(toast)
  }

  container.appendChild(toast)

  // Trigger animation in
  setTimeout(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateY(0) scale(1)'
  }, 10)

  // Auto-remove after 4.5 seconds
  const autoRemoveTimer = setTimeout(() => {
    removeToast(toast)
  }, 4500)

  function removeToast(el: HTMLDivElement) {
    clearTimeout(autoRemoveTimer)
    el.style.opacity = '0'
    el.style.transform = 'translateY(-20px) scale(0.95)'
    setTimeout(() => {
      el.remove()
      if (container && container.children.length === 0) {
        container.remove()
      }
    }, 300)
  }
}

