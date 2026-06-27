/**
 * useSettings hook – reads/writes extension settings via chrome.storage.
 */

import { useState, useEffect, useCallback } from 'react'
import type { ExtensionSettings } from '../types'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants'

export function useSettings() {
  const [settings, setSettingsState] = useState<ExtensionSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
    // Listen for storage changes from other contexts
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[STORAGE_KEYS.SETTINGS]) {
        const newValue = changes[STORAGE_KEYS.SETTINGS].newValue as ExtensionSettings | undefined
        if (newValue) setSettingsState(prev => ({ ...prev, ...newValue }))
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
      const stored = result[STORAGE_KEYS.SETTINGS] as ExtensionSettings | undefined
      setSettingsState(stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS)
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = useCallback(async (updates: Partial<ExtensionSettings>) => {
    const updated = { ...settings, ...updates }
    setSettingsState(updated)
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated })
    // Notify background
    chrome.runtime.sendMessage({ type: 'SET_SETTINGS', data: updated })
  }, [settings])

  const resetToDefaults = useCallback(async () => {
    setSettingsState(DEFAULT_SETTINGS)
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS })
  }, [])

  const exportSettings = useCallback(() => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `privacyshield-settings-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [settings])

  const importSettings = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const imported = JSON.parse(text) as ExtensionSettings
      await updateSettings(imported)
      return true
    } catch {
      return false
    }
  }, [updateSettings])

  return { settings, loading, updateSettings, resetToDefaults, exportSettings, importSettings }
}
