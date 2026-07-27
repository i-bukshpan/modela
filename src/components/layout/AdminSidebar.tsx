'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Box, LayoutDashboard, Package, Layers, ClipboardList,
  TrendingDown, BarChart2, MessageSquare, Mail, BookOpen,
  Settings, LogOut, Calculator, ChevronLeft, AlertTriangle,
  DollarSign
} from 'lucide-react'

const ADMIN_LINKS = [
  { href: '/admin',              label: 'סקירה כללית',    icon: LayoutDashboard },
  { href: '/admin/products',     label: 'מוצרים',         icon: Package },
  { href: '/admin/filaments',    label: 'מלאי חוטים',     icon: Layers },
  { href: '/admin/jobs',         label: 'תור הדפסות',     icon: ClipboardList },
  { href: '/admin/finances',     label: 'ניהול כספים',    icon: DollarSign },
  { href: '/admin/analytics',    label: 'ניתוח פיננסי',   icon: BarChart2 },
  { href: '/admin/comments',     label: 'תגובות',          icon: MessageSquare },
  { href: '/admin/messages',     label: 'הודעות קשר',      icon: Mail },
  { href: '/admin/blog',         label: 'בלוג',            icon: BookOpen },
  { href: '/admin/settings',     label: 'הגדרות',          icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="fixed right-0 top-0 h-full w-56 glass-heavy border-l border-white/10 flex flex-col z-40 pt-4 pb-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-4 py-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
          <Box className="w-4 h-4 text-slate-canvas" strokeWidth={2.5} />
        </div>
        <span className="font-brand font-bold text-base text-beige">
          Modela <span className="text-gold">OS</span>
        </span>
      </Link>

      <div className="px-2 mb-4">
        <div className="h-px bg-white/10" />
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {ADMIN_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-gold/15 text-gold border border-gold/20'
                  : 'text-beige-muted hover:bg-white/5 hover:text-beige'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 pt-4 border-t border-white/10 mt-4">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-beige-muted hover:text-beige transition-colors">
          <ChevronLeft className="w-4 h-4" /> חזור לאתר
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-status-danger hover:bg-status-danger/10 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" /> יציאה
        </button>
      </div>
    </aside>
  )
}
