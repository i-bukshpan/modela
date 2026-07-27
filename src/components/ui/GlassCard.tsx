'use client'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'heavy' | 'gold'
  hover?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
    const base = {
      default: 'glass',
      heavy:   'glass-heavy',
      gold:    'glass-gold',
    }[variant]

    return (
      <motion.div
        ref={ref}
        className={cn(
          base,
          'rounded-2xl transition-glass',
          hover && 'hover:border-white/[0.15] hover:shadow-card-hover cursor-default',
          className
        )}
        whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
GlassCard.displayName = 'GlassCard'
