import React from 'react'
import { cn } from '../../utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'glass'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
        'transition-all duration-200 select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-800',
        'disabled:opacity-50 disabled:cursor-not-allowed',

        // Variants
        variant === 'primary' && [
          'bg-gradient-brand text-white',
          'hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]',
          'shadow-brand hover:shadow-brand-lg',
        ],
        variant === 'secondary' && [
          'bg-white/10 text-white border border-white/15',
          'hover:bg-white/15 active:scale-[0.98]',
        ],
        variant === 'ghost' && [
          'text-white/70 hover:text-white hover:bg-white/8',
          'active:scale-[0.98]',
        ],
        variant === 'danger' && [
          'bg-danger-600 text-white',
          'hover:bg-danger-500 active:scale-[0.98]',
          'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
        ],
        variant === 'success' && [
          'bg-success-600 text-white',
          'hover:bg-success-500 active:scale-[0.98]',
        ],
        variant === 'glass' && [
          'bg-white/5 backdrop-blur border border-white/10 text-white',
          'hover:bg-white/10 active:scale-[0.98]',
        ],

        // Sizes
        size === 'xs' && 'px-2.5 py-1 text-xs',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',

        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  )
}
