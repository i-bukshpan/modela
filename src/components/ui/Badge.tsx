'use client'
import { cn } from '@/lib/utils'
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/lib/utils'

interface BadgeProps {
  label?: string
  className?: string
  variant?: 'gold' | 'cyber' | 'success' | 'warning' | 'danger' | 'muted'
  children?: React.ReactNode
}

export function Badge({ label, variant = 'gold', className, children }: BadgeProps) {
  const variants = {
    gold:    'bg-gold/10 text-gold border-gold/25',
    cyber:   'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/25',
    success: 'bg-status-success/10 text-status-success border-status-success/25',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/25',
    danger:  'bg-status-danger/10 text-status-danger border-status-danger/25',
    muted:   'bg-white/5 text-beige-muted border-white/10',
  }
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5',
      'text-xs font-medium rounded-full border',
      variants[variant],
      className
    )}>
      {label || children}
    </span>
  )
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border',
      JOB_STATUS_COLORS[status] || 'bg-white/5 text-beige-muted border-white/10',
      className
    )}>
      {JOB_STATUS_LABELS[status] || status}
    </span>
  )
}

interface MaterialBadgeProps {
  material: string
  className?: string
}

const MATERIAL_COLORS: Record<string, string> = {
  PLA:  'bg-green-500/10 text-green-400 border-green-500/25',
  PETG: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  TPU:  'bg-purple-500/10 text-purple-400 border-purple-500/25',
  ABS:  'bg-orange-500/10 text-orange-400 border-orange-500/25',
  Resin:'bg-pink-500/10 text-pink-400 border-pink-500/25',
}

export function MaterialBadge({ material, className }: MaterialBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 text-xs font-bold rounded border font-num',
      MATERIAL_COLORS[material] || 'bg-white/5 text-beige-muted border-white/10',
      className
    )}>
      {material}
    </span>
  )
}
