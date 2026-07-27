'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/StatCard'
import { formatPrice, formatDateHe } from '@/lib/utils'
import {
  Package, Layers, ClipboardList, Mail, MessageSquare,
  TrendingUp, AlertTriangle, Eye
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import Link from 'next/link'
import type { PrintJob } from '@/types/database'

interface DashStats {
  products: number
  jobs_pending: number
  jobs_printing: number
  new_messages: number
  pending_comments: number
  low_stock_count: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null)
  const [recentJobs, setRecentJobs] = useState<PrintJob[]>([])
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; expenses: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.from('products').select('id', { count: 'exact' }),
      sb.from('print_jobs').select('id', { count: 'exact' }).in('status', ['pending_quote', 'quoted', 'in_queue']),
      sb.from('print_jobs').select('id', { count: 'exact' }).eq('status', 'printing'),
      sb.from('contact_messages').select('id', { count: 'exact' }).eq('status', 'new'),
      sb.from('comments').select('id', { count: 'exact' }).eq('approved', false),
      sb.from('filaments').select('id', { count: 'exact' }).filter('remaining_weight_g', 'lte', 'low_stock_threshold_g').eq('is_active', true),
      sb.from('print_jobs').select('*').order('created_at', { ascending: false }).limit(5),
      sb.rpc('monthly_financials_summary').limit(6),
    ]).then(([p, pend, prnt, msg, cmts, ls, rj, rev]) => {
      setStats({
        products: p.count || 0,
        jobs_pending: pend.count || 0,
        jobs_printing: prnt.count || 0,
        new_messages: msg.count || 0,
        pending_comments: cmts.count || 0,
        low_stock_count: ls.count || 0,
      })
      if (rj.data) setRecentJobs(rj.data as PrintJob[])
      setLoading(false)
    })

    // Fetch revenue + expenses for chart
    Promise.all([
      sb.from('revenue_entries').select('date,amount').order('date', { ascending: true }).limit(30),
      sb.from('expenses').select('date,amount').order('date', { ascending: true }).limit(30),
    ]).then(([rev, exp]) => {
      // Group by month
      const map: Record<string, { revenue: number; expenses: number }> = {}
      rev.data?.forEach(r => {
        const m = r.date.slice(0, 7)
        if (!map[m]) map[m] = { revenue: 0, expenses: 0 }
        map[m].revenue += Number(r.amount)
      })
      exp.data?.forEach(e => {
        const m = e.date.slice(0, 7)
        if (!map[m]) map[m] = { revenue: 0, expenses: 0 }
        map[m].expenses += Number(e.amount)
      })
      const months = ['01','02','03','04','05','06','07','08','09','10','11','12']
      const HE_MONTHS = ['ינו','פבר','מרץ','אפר','מאי','יונ','יול','אוג','ספט','אוק','נוב','דצמ']
      setRevenueData(
        Object.entries(map)
          .sort()
          .slice(-6)
          .map(([key, val]) => ({
            month: HE_MONTHS[parseInt(key.slice(5, 7)) - 1],
            ...val,
          }))
      )
    })
  }, [])

  const STAT_CARDS = stats ? [
    { label: 'סה"כ מוצרים', value: stats.products, icon: Package, href: '/admin/products', color: 'text-gold' },
    { label: 'ממתינים / בתור', value: stats.jobs_pending, icon: ClipboardList, href: '/admin/jobs', color: 'text-status-warning' },
    { label: 'בהדפסה כעת', value: stats.jobs_printing, icon: Layers, href: '/admin/jobs', color: 'text-cyber-blue' },
    { label: 'הודעות חדשות', value: stats.new_messages, icon: Mail, href: '/admin/messages', color: 'text-status-success' },
    { label: 'תגובות לאישור', value: stats.pending_comments, icon: MessageSquare, href: '/admin/comments', color: 'text-cyber-violet' },
    { label: 'חוטים במלאי נמוך', value: stats.low_stock_count, icon: AlertTriangle, href: '/admin/filaments', color: 'text-status-danger' },
  ] : []

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-beige">סקירה כללית</h1>
        <p className="text-beige-muted text-sm mt-1">ברוך הבא לModela OS — מרכז ניהול הסטודיו</p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {STAT_CARDS.map(({ label, value, icon: Icon, href, color }) => (
            <Link key={label} href={href}>
              <GlassCard className="p-5 hover:border-gold/25 cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-3xl font-bold font-num ${color}`}>{value}</span>
                </div>
                <div className="text-sm text-beige-muted">{label}</div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}

      {/* Charts + Recent Jobs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <GlassCard className="p-6">
          <h3 className="font-semibold text-beige mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold" /> הכנסות vs הוצאות (6 חודשים)
          </h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,221,211,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#A39B91', fontSize: 11 }} />
                <YAxis tick={{ fill: '#A39B91', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#141312', border: '1px solid rgba(201,126,42,0.2)', borderRadius: '12px' }}
                  labelStyle={{ color: '#E5DDD3' }}
                />
                <Bar dataKey="revenue" name="הכנסות" fill="#C97E2A" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="הוצאות" fill="#E85D5D" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-beige-muted text-sm">
              אין נתונים פיננסיים עדיין
            </div>
          )}
        </GlassCard>

        {/* Recent Jobs */}
        <GlassCard className="p-6">
          <h3 className="font-semibold text-beige mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-gold" /> עבודות אחרונות
          </h3>
          <div className="space-y-2">
            {recentJobs.length > 0 ? recentJobs.map(job => (
              <div key={job.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-beige truncate">{job.customer_name}</div>
                  <div className="text-xs text-beige-muted font-num">{formatDateHe(job.created_at)}</div>
                </div>
                <StatusBadge status={job.status} />
                {job.quoted_price && (
                  <span className="text-sm font-bold text-gold font-num">{formatPrice(job.quoted_price)}</span>
                )}
              </div>
            )) : (
              <div className="text-sm text-beige-muted text-center py-8">אין עבודות עדיין</div>
            )}
          </div>
          <Link href="/admin/jobs" className="mt-4 block text-center text-xs text-gold hover:underline">
            לכל העבודות →
          </Link>
        </GlassCard>
      </div>
    </div>
  )
}
