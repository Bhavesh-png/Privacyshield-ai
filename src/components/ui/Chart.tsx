/**
 * Animated stat chart using SVG – no heavy chart libraries.
 */

import React, { useEffect, useRef } from 'react'
import { cn } from '../../utils/cn'
import type { DayStats } from '../../types'

// ============================================================
// MiniBarChart – compact bar chart for dashboard
// ============================================================

interface MiniBarChartProps {
  data: DayStats[]
  dataKey: keyof Omit<DayStats, 'date'>
  color?: string
  height?: number
  className?: string
}

export const MiniBarChart: React.FC<MiniBarChartProps> = ({
  data,
  dataKey,
  color = '#6366f1',
  height = 40,
  className,
}) => {
  const maxVal = Math.max(...data.map(d => d[dataKey] as number), 1)

  return (
    <div className={cn('flex items-end gap-0.5', className)} style={{ height }}>
      {data.map((d, i) => {
        const val = d[dataKey] as number
        const pct = (val / maxVal) * 100
        return (
          <div
            key={d.date + i}
            className="flex-1 rounded-t-sm transition-all duration-500"
            style={{
              height: `${Math.max(pct, 3)}%`,
              backgroundColor: color,
              opacity: 0.5 + (i / data.length) * 0.5,
            }}
            title={`${d.date}: ${val.toLocaleString()}`}
          />
        )
      })}
    </div>
  )
}

// ============================================================
// RadialScore – animated circular progress for privacy score
// ============================================================

interface RadialScoreProps {
  score: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  className?: string
}

export const RadialScore: React.FC<RadialScoreProps> = ({
  score,
  size = 100,
  strokeWidth = 8,
  color = '#6366f1',
  label,
  className,
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (score / 100) * circumference
  const gap = circumference - dash

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-white" style={{ fontSize: size * 0.22 }}>
          {score}
        </span>
        {label && (
          <span className="text-white/50" style={{ fontSize: size * 0.1 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================================
// StatCard – animated number display
// ============================================================

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  icon?: React.ReactNode
  color?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  color = '#6366f1',
  trend,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl p-4 bg-white/5 border border-white/8 backdrop-blur-sm',
        'hover:border-white/15 transition-all duration-200',
        'animate-fade-in',
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        {icon && (
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: color + '22' }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        )}
        {trend && (
          <span className={cn(
            'text-xs font-semibold',
            trend === 'up' && 'text-success-400',
            trend === 'down' && 'text-danger-400',
            trend === 'neutral' && 'text-white/50',
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      <div className="mt-1">
        <div
          className="text-2xl font-bold text-white tracking-tight"
          style={{ color }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-xs text-white/50 mt-0.5">{label}</div>
        {subValue && <div className="text-xs text-white/40 mt-0.5">{subValue}</div>}
      </div>
    </div>
  )
}
