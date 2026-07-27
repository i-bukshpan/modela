'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Box, Grid3X3, Info, BookOpen, Mail, Menu, X, Phone, Zap
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/',        label: 'בית',         icon: Box },
  { href: '/gallery', label: 'עבודות',       icon: Grid3X3 },
  { href: '/about',   label: 'אודות',        icon: Info },
  { href: '/blog',    label: 'בלוג',         icon: BookOpen },
  { href: '/quote',   label: 'קבל הצעה',     icon: Zap, highlight: true },
  { href: '/contact', label: 'צור קשר',      icon: Mail },
]

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          scrolled
            ? 'glass-heavy border-b border-white/10 py-2'
            : 'bg-transparent py-4'
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-gold-sm group-hover:shadow-gold-md transition-shadow">
              <Box className="w-5 h-5 text-slate-canvas" strokeWidth={2.5} />
            </div>
            <span className="font-brand font-bold text-xl tracking-wide text-beige">
              modela
              <span className="text-gold">.</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon, highlight }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                    highlight
                      ? 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 hover:border-gold/50 mr-1'
                      : active
                        ? 'bg-white/10 text-beige'
                        : 'text-beige-muted hover:text-beige hover:bg-white/5'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {active && !highlight && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-px bg-gold"
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg glass text-beige hover:text-gold transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? 'close' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 z-50 h-full w-72 glass-heavy border-l border-white/10 flex flex-col pt-20 pb-8 px-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map(({ href, label, icon: Icon, highlight }) => {
                  const active = pathname === href || (href !== '/' && pathname.startsWith(href))
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all',
                        highlight
                          ? 'bg-gold/10 border border-gold/30 text-gold'
                          : active
                            ? 'bg-white/10 text-beige'
                            : 'text-beige-muted hover:text-beige hover:bg-white/5'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </Link>
                  )
                })}
              </div>
              <div className="mt-auto pt-6 border-t border-white/10">
                <a href="tel:+972500000000" className="flex items-center gap-2 text-sm text-beige-muted hover:text-gold transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>050-0000000</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
