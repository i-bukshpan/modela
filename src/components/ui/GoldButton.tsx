'use client'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface GoldButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: [
        'bg-gradient-to-r from-gold-dark via-gold to-gold-light',
        'text-slate-canvas font-semibold',
        'shadow-gold-sm hover:shadow-gold-md',
        'border border-gold/40',
      ],
      secondary: [
        'bg-transparent',
        'border border-gold/40 text-gold',
        'hover:bg-gold/10 hover:border-gold/70',
      ],
      ghost: [
        'bg-transparent text-beige hover:bg-white/5',
        'border border-white/10 hover:border-white/20',
      ],
      danger: [
        'bg-status-danger/10 text-status-danger',
        'border border-status-danger/30 hover:bg-status-danger/20',
      ],
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-base gap-2',
      lg: 'px-8 py-3.5 text-lg gap-2.5',
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          'transition-all duration-200 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
          'disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        <>{children}</>
      </motion.button>
    )
  }
)
GoldButton.displayName = 'GoldButton'
