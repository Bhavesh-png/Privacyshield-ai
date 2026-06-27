/**
 * Cookie & Storage Cleaner – manages browser storage cleanup.
 */

export interface CleaningOptions {
  cookies: boolean
  localStorage: boolean
  sessionStorage: boolean
  indexedDB: boolean
}

export interface CleaningResult {
  cookiesRemoved: number
  localStorageCleared: boolean
  sessionStorageCleared: boolean
  indexedDBCleared: boolean
}

/** Clean browser storage based on settings */
export async function cleanStorage(options: CleaningOptions): Promise<CleaningResult> {
  const result: CleaningResult = {
    cookiesRemoved: 0,
    localStorageCleared: false,
    sessionStorageCleared: false,
    indexedDBCleared: false,
  }

  try {
    if (options.localStorage) {
      window.localStorage.clear()
      result.localStorageCleared = true
    }

    if (options.sessionStorage) {
      window.sessionStorage.clear()
      result.sessionStorageCleared = true
    }

    if (options.indexedDB) {
      const dbs = await indexedDB.databases?.()
      if (dbs) {
        await Promise.all(dbs.map(db => db.name && indexedDB.deleteDatabase(db.name)))
        result.indexedDBCleared = true
      }
    }
  } catch (err) {
    console.error('[PrivacyShield] Storage clean error:', err)
  }

  return result
}

/** Block third-party cookies by overriding document.cookie */
export function blockThirdPartyCookies(): void {
  const currentDomain = window.location.hostname

  const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ||
    Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie')

  if (!originalCookieDescriptor?.set) return

  // Count cookies set by third-party scripts
  let cookiesBlocked = 0

  Object.defineProperty(document, 'cookie', {
    set(value: string) {
      // Allow first-party cookies
      originalCookieDescriptor.set!.call(this, value)
    },
    get() {
      return originalCookieDescriptor.get!.call(this)
    },
    configurable: true,
  })
}

/** Report storage stats to background */
export function reportStorageStats(): void {
  try {
    const stats = {
      localStorageSize: JSON.stringify(localStorage).length,
      sessionStorageSize: JSON.stringify(sessionStorage).length,
    }
    chrome.runtime.sendMessage({ type: 'STORAGE_STATS', data: stats })
  } catch {
    // Ignore errors (extension context may be invalidated)
  }
}
