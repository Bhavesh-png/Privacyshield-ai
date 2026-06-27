import React from 'react'
import { cn } from '../../utils/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  id?: string
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  id,
}) => {
  const switchId = id ?? `switch-${Math.random().toString(36).slice(2)}`

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'flex items-center gap-3 cursor-pointer group',
        disabled && 'opacity-50 cursor-not-allowed',
        (label || description) && 'justify-between'
      )}
    >
      {(label || description) && (
        <div className="flex flex-col min-w-0">
          {label && <span className="text-sm font-medium text-white/90">{label}</span>}
          {description && <span className="text-xs text-white/50 mt-0.5">{description}</span>}
        </div>
      )}

      <div className="relative shrink-0">
        <input
          id={switchId}
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={e => onChange(e.target.checked)}
        />
        <div
          className={cn(
            'rounded-full transition-all duration-300 cursor-pointer',
            size === 'sm' && 'w-8 h-4',
            size === 'md' && 'w-11 h-6',
            size === 'lg' && 'w-14 h-7',
            checked
              ? 'bg-gradient-brand shadow-brand'
              : 'bg-white/15 group-hover:bg-white/20',
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 bg-white rounded-full shadow-sm',
              'transition-all duration-300 ease-in-out',
              size === 'sm' && 'h-3 w-3 left-0.5',
              size === 'md' && 'h-5 w-5 left-0.5',
              size === 'lg' && 'h-6 w-6 left-0.5',
              checked && size === 'sm' && 'translate-x-4',
              checked && size === 'md' && 'translate-x-5',
              checked && size === 'lg' && 'translate-x-7',
            )}
          />
        </div>
      </div>
    </label>
  )
}
