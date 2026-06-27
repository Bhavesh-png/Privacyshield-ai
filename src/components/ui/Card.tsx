import React from 'react'
import { cn } from '../../utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'gradient' | 'bordered'
  padding?: 'sm' | 'md' | 'lg' | 'none'
  glow?: boolean
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  padding = 'md',
  glow = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200',
        variant === 'glass' && [
          'bg-white/5 backdrop-blur-md border border-white/10',
          'shadow-glass',
        ],
        variant === 'solid' && 'bg-dark-700 border border-white/5',
        variant === 'gradient' && [
          'bg-gradient-card border border-brand-500/20',
          'shadow-inner-brand',
        ],
        variant === 'bordered' && 'border border-white/15 bg-transparent',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-4',
        padding === 'lg' && 'p-6',
        padding === 'none' && '',
        glow && 'shadow-brand hover:shadow-brand-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
