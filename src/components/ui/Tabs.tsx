import React, { useState } from 'react'
import { cn } from '../../utils/cn'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  variant?: 'pills' | 'underline' | 'glass'
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex',
        variant === 'pills' && 'gap-1 p-1 bg-white/5 rounded-xl',
        variant === 'underline' && 'gap-0 border-b border-white/10',
        variant === 'glass' && 'gap-2',
        className
      )}
      role="tablist"
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 font-medium transition-all duration-200 rounded-lg',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',

            variant === 'pills' && [
              'px-3 py-1.5 text-sm flex-1 justify-center',
              activeTab === tab.id
                ? 'bg-gradient-brand text-white shadow-brand'
                : 'text-white/60 hover:text-white/80',
            ],

            variant === 'underline' && [
              'px-4 py-2.5 text-sm rounded-none border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-brand-400 text-brand-300'
                : 'border-transparent text-white/50 hover:text-white/70',
            ],

            variant === 'glass' && [
              'px-4 py-2 text-sm',
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/70 hover:bg-white/5',
            ],
          )}
        >
          {tab.icon && <span className="shrink-0">{tab.icon}</span>}
          {tab.label}
          {tab.badge !== undefined && (
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
              activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-white/10 text-white/60'
            )}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
