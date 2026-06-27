import React from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand'
  size?: 'xs' | 'sm' | 'md'
  dot?: boolean
  pulse?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  dot = false,
  pulse = false,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full',
        size === 'xs' && 'px-1.5 py-0.5 text-[10px]',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        variant === 'default' && 'bg-white/10 text-white/80',
        variant === 'success' && 'bg-success-500/20 text-success-400 border border-success-500/30',
        variant === 'warning' && 'bg-warning-500/20 text-warning-400 border border-warning-500/30',
        variant === 'danger' && 'bg-danger-500/20 text-danger-400 border border-danger-500/30',
        variant === 'info' && 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
        variant === 'brand' && 'bg-gradient-brand text-white',
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn(
          'inline-block rounded-full shrink-0',
          size === 'xs' ? 'w-1 h-1' : 'w-1.5 h-1.5',
          pulse && 'animate-pulse',
          variant === 'success' && 'bg-success-400',
          variant === 'warning' && 'bg-warning-400',
          variant === 'danger' && 'bg-danger-400',
          variant === 'info' && 'bg-brand-400',
          variant === 'default' && 'bg-white/60',
          variant === 'brand' && 'bg-white',
        )} />
      )}
      {children}
    </span>
  )
}
