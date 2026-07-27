'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  suffix?: string
  prefix?: string
  icon?: React.ReactNode
  delay?: number
  className?: string
}

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    if (!start) return
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * ease))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, start])

  return count
}

export function StatCard({ label, value, suffix = '', prefix = '', icon, delay = 0, className }: StatCardProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
  const count = useCountUp(numericValue, 2000, visible)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <GlassCard className={cn('p-6 text-center', className)}>
        {icon && (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 text-gold mb-4 mx-auto">
            {icon}
          </div>
        )}
        <div className="font-num text-4xl font-bold gradient-text-static mb-1">
          {prefix}{typeof value === 'number' ? count : value}{suffix}
        </div>
        <div className="text-beige-muted text-sm">{label}</div>
      </GlassCard>
    </motion.div>
  )
}

// ── Filament Progress Bar ──

interface FilamentBarProps {
  remaining: number
  total: number
  threshold?: number
  colorHex?: string
  className?: string
}

export function FilamentProgressBar({ remaining, total, threshold = 150, colorHex = '#C97E2A', className }: FilamentBarProps) {
  const pct = Math.round((remaining / total) * 100)
  const isLow = remaining <= threshold

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className={isLow ? 'text-status-danger font-semibold' : 'text-beige-muted'}>
          {remaining}g נותרו
        </span>
        <span className="text-beige-dim font-num">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: isLow ? '#E85D5D' : colorHex }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ── Skeleton ──

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

// ── Section Header ──

interface SectionHeaderProps {
  label?: string
  title: string
  titleHighlight?: string
  subtitle?: string
  centered?: boolean
}

export function SectionHeader({ label, title, titleHighlight, subtitle, centered = true }: SectionHeaderProps) {
  return (
    <motion.div
      className={cn('mb-12', centered && 'text-center')}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {label && (
        <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-widest uppercase rounded-full glass-gold text-gold border border-gold/20">
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-beige leading-tight mb-4">
        {title}{' '}
        {titleHighlight && <span className="gradient-text">{titleHighlight}</span>}
      </h2>
      {subtitle && <p className="text-beige-muted text-lg max-w-2xl mx-auto">{subtitle}</p>}
    </motion.div>
  )
}
