/**
 * Cosmetic Filter – hides ad elements from the DOM using CSS injection
 * and MutationObserver for dynamically injected ads.
 */

import { COSMETIC_SELECTORS } from '../constants/trackerDomains'

let styleElement: HTMLStyleElement | null = null
let observer: MutationObserver | null = null
let isActive = true

/** Build the CSS rule string from selectors */
function buildCSSRules(selectors: string[]): string {
  return selectors.join(',\n') + ' { display: none !important; visibility: hidden !important; }'
}

/** Inject cosmetic CSS into the page */
function injectStyles(selectors: string[]): void {
  if (styleElement) {
    styleElement.textContent = buildCSSRules(selectors)
    return
  }
  styleElement = document.createElement('style')
  styleElement.id = '__privacyshield_cosmetic__'
  styleElement.textContent = buildCSSRules(selectors)
  ;(document.head || document.documentElement).appendChild(styleElement)
}

/** Remove all injected styles */
function removeStyles(): void {
  if (styleElement) {
    styleElement.remove()
    styleElement = null
  }
}

/** Hide ad elements found by MutationObserver */
function hideAdElements(nodes: NodeList): void {
  nodes.forEach(node => {
    if (!(node instanceof HTMLElement)) return
    COSMETIC_SELECTORS.forEach(selector => {
      try {
        if (node.matches(selector)) {
          node.style.setProperty('display', 'none', 'important')
          node.style.setProperty('visibility', 'hidden', 'important')
        }
        node.querySelectorAll(selector).forEach(el => {
          (el as HTMLElement).style.setProperty('display', 'none', 'important')
          ;(el as HTMLElement).style.setProperty('visibility', 'hidden', 'important')
        })
      } catch {
        // Invalid selector – skip
      }
    })
  })
}

/** Start DOM observation for dynamically injected ads */
function startObserver(): void {
  if (observer) return

  observer = new MutationObserver(mutations => {
    if (!isActive) return
    const addedNodes = mutations.flatMap(m => Array.from(m.addedNodes))
    if (addedNodes.length > 0) {
      hideAdElements(addedNodes as unknown as NodeList)
    }
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })
}

/** Stop DOM observation */
function stopObserver(): void {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

/** Apply platform-specific selectors for the current hostname */
function getPlatformSelectors(): string[] {
  const hostname = window.location.hostname
  const base = [...COSMETIC_SELECTORS]

  // YouTube-specific
  if (hostname.includes('youtube.com')) {
    base.push(
      'ytd-ad-slot-renderer',
      '.video-ads.ytp-ad-module',
      '#masthead-ad',
      'ytd-promoted-sparkles-web-renderer',
      'ytd-companion-slot-renderer',
      '#player-ads',
      '.ytp-ad-overlay-slot',
      '.ytp-ad-text-overlay',
      'ytd-banner-promo-renderer',
      'ytd-in-feed-ad-layout-renderer',
      'ytd-rich-item-renderer:has(ytd-ad-slot-renderer)',
      '.ytd-merch-shelf-renderer',
      'ytd-statement-banner-renderer',
    )
  }

  // Facebook-specific
  if (hostname.includes('facebook.com')) {
    base.push(
      '[data-pagelet="RightRail"]',
      'div[role="feed"] > div[data-fort-id]',
      'div[aria-label="Sponsored"]',
    )
  }

  // Instagram-specific
  if (hostname.includes('instagram.com')) {
    base.push(
      'article[role="presentation"]',
      '._adp',
    )
  }

  // Twitter/X-specific
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    base.push(
      '[data-testid="placementTracking"]',
      'div[data-testid="tweet"] + div[data-testid="cellInnerDiv"]',
    )
  }

  // Reddit-specific
  if (hostname.includes('reddit.com')) {
    base.push(
      'shreddit-ad-post',
      '.promotedlink',
      '[data-promoted="true"]',
    )
  }

  // Twitch-specific
  if (hostname.includes('twitch.tv')) {
    base.push(
      '.js-converted-ad',
      '[data-a-target="ad-banner"]',
    )
  }

  return [...new Set(base)] // dedupe
}

/** Initialize cosmetic filtering */
export function initCosmeticFilter(): void {
  if (!isActive) return

  const selectors = getPlatformSelectors()
  injectStyles(selectors)
  hideAdElements(document.querySelectorAll('*') as NodeList)
  startObserver()
}

/** Pause cosmetic filtering */
export function pauseCosmeticFilter(): void {
  isActive = false
  removeStyles()
  stopObserver()
}

/** Resume cosmetic filtering */
export function resumeCosmeticFilter(): void {
  isActive = true
  initCosmeticFilter()
}
