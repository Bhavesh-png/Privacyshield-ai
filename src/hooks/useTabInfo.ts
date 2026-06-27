/**
 * useTabInfo hook – gets the current tab's protection status.
 */

import { useState, useEffect } from 'react'
import type { TabInfo, PrivacyScore } from '../types'

function computePrivacyScore(tabInfo: TabInfo | null, enabled: boolean): PrivacyScore {
  if (!enabled || !tabInfo?.enabled) {
    return {
      score: 0,
      grade: 'F',
      threats: [],
      label: 'Unprotected',
      color: '#ef4444',
    }
  }

  const score = tabInfo?.privacyScore ?? 100
  let grade: PrivacyScore['grade'] = 'A+'
  let label = 'Excellent'
  let color = '#22c55e'

  if (score >= 90) { grade = 'A+'; label = 'Excellent'; color = '#22c55e' }
  else if (score >= 80) { grade = 'A'; label = 'Very Good'; color = '#4ade80' }
  else if (score >= 70) { grade = 'B'; label = 'Good'; color = '#fbbf24' }
  else if (score >= 50) { grade = 'C'; label = 'Fair'; color = '#f97316' }
  else if (score >= 30) { grade = 'D'; label = 'Poor'; color = '#ef4444' }
  else { grade = 'F'; label = 'Dangerous'; color = '#dc2626' }

  return { score, grade, label, color, threats: [] }
}

export function useTabInfo() {
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null)
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTabInfo()
  }, [])

  async function loadTabInfo() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      setCurrentTab(tab)

      if (tab?.id) {
        const info = await chrome.runtime.sendMessage({
          type: 'GET_TAB_INFO',
          data: { tabId: tab.id },
        })
        setTabInfo(info)
      }
    } catch (err) {
      console.error('Failed to load tab info:', err)
    } finally {
      setLoading(false)
    }
  }

  const domain = currentTab?.url
    ? new URL(currentTab.url).hostname.replace(/^www\./, '')
    : ''

  const enabled = tabInfo?.enabled ?? true
  const privacyScore = computePrivacyScore(tabInfo, enabled)

  const toggleProtection = async (enabled: boolean) => {
    if (!domain) return
    await chrome.runtime.sendMessage({
      type: 'TOGGLE_SITE',
      data: { domain, enabled },
    })
    setTabInfo(prev => prev ? { ...prev, enabled } : null)
  }

  const whitelistSite = async (action: 'add' | 'remove') => {
    if (!domain) return
    await chrome.runtime.sendMessage({
      type: 'WHITELIST_SITE',
      data: { domain, action },
    })
  }

  const pauseSite = async (minutes: number) => {
    if (!domain) return
    await chrome.runtime.sendMessage({
      type: 'PAUSE_SITE',
      data: { domain, minutes },
    })
    setTabInfo(prev => prev ? { ...prev, paused: true } : null)
  }

  return {
    tabInfo,
    currentTab,
    domain,
    enabled,
    privacyScore,
    loading,
    toggleProtection,
    whitelistSite,
    pauseSite,
    refresh: loadTabInfo,
  }
}
