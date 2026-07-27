'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { BarChart2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState({ rev: 0, exp: 0 })

  useEffect(() => {
    async function loadStats() {
      const sb = createClient()
      const { data: revs } = await sb.from('revenue_entries').select('amount, date')
      const { data: exps } = await sb.from('expenses').select('amount, date')

      // Group by month
      const monthly: Record<string, { name: string, revenue: number, expenses: number }> = {}
      
      let tRev = 0
      let tExp = 0

      if (revs) {
        revs.forEach(r => {
          tRev += Number(r.amount)
          const month = r.date.substring(0, 7) // YYYY-MM
          if (!monthly[month]) monthly[month] = { name: month, revenue: 0, expenses: 0 }
          monthly[month].revenue += Number(r.amount)
        })
      }

      if (exps) {
        exps.forEach(e => {
          tExp += Number(e.amount)
          const month = e.date.substring(0, 7) // YYYY-MM
          if (!monthly[month]) monthly[month] = { name: month, revenue: 0, expenses: 0 }
          monthly[month].expenses += Number(e.amount)
        })
      }

      const sorted = Object.values(monthly).sort((a, b) => a.name.localeCompare(b.name))
      setData(sorted)
      setTotals({ rev: tRev, exp: tExp })
      setLoading(false)
    }
    loadStats()
  }, [])

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-beige flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-gold" /> ניתוח פיננסי
        </h1>
        <p className="text-beige-muted text-sm mt-1">צפה בביצועים העסקיים שלך לאורך זמן</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-beige-muted">סה"כ הכנסות</div>
              <div className="text-2xl font-bold text-beige font-num">₪{totals.rev.toFixed(2)}</div>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-status-danger/10 text-status-danger flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-beige-muted">סה"כ הוצאות</div>
              <div className="text-2xl font-bold text-beige font-num">₪{totals.exp.toFixed(2)}</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="gold" className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-dark/20 text-gold flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gold/80">רווח נקי</div>
              <div className="text-2xl font-bold text-gold font-num">₪{(totals.rev - totals.exp).toFixed(2)}</div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="font-semibold text-beige mb-6">תזרים לאורך זמן</h3>
        {loading ? (
          <div className="h-72 flex items-center justify-center text-beige-muted">טוען נתונים...</div>
        ) : data.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-beige-muted">אין מספיק נתונים להצגת גרף</div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} />
                <YAxis stroke="#ffffff50" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Area type="monotone" dataKey="revenue" name="הכנסות" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" name="הוצאות" stroke="#EF4444" fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
