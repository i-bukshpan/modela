'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { Save, Settings, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const [stats, setStats] = useState({
    projects: 500,
    customers: 200,
    satisfaction: 99,
    printers: 8
  })
  
  const [preset, setPreset] = useState({
    electricity_kwh_rate: 0.65,
    printer_wattage: 200,
    hourly_labor_rate: 60,
    failure_margin_pct: 10,
    default_profit_margin: 30
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPreset, setSavingPreset] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSettings() {
      const sb = createClient()
      const { data, error } = await sb.from('site_settings').select('value').eq('key', 'homepage_stats').maybeSingle()
      if (error && error.code === '42P01') {
        setError('יש להריץ את סקריפט התקנת מסד הנתונים עבור טבלת site_settings.')
      } else if (data && data.value) {
        setStats(prev => ({...prev, ...data.value}))
      }
      
      const { data: presetData } = await sb.from('cost_presets').select('*').eq('is_default', true).maybeSingle()
      if (presetData) {
        setPreset(presetData)
      }
      
      setLoading(false)
    }
    loadSettings()
  }, [])

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const sb = createClient()
    
    const { data } = await sb.from('site_settings').select('id').eq('key', 'homepage_stats').maybeSingle()
    if (data) {
      await sb.from('site_settings').update({ value: stats }).eq('key', 'homepage_stats')
    } else {
      await sb.from('site_settings').insert([{ key: 'homepage_stats', value: stats }])
    }
    
    setSaving(false)
    alert('ההגדרות נשמרו בהצלחה!')
  }

  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPreset(true)
    const sb = createClient()
    
    const { data } = await sb.from('cost_presets').select('*').eq('is_default', true).maybeSingle()
    if (data) {
      await sb.from('cost_presets').update(preset).eq('id', data.id)
    } else {
      await sb.from('cost_presets').insert([{ ...preset, name: 'Default Profile', is_default: true }])
    }
    
    setSavingPreset(false)
    alert('הגדרות התמחור נשמרו בהצלחה!')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-beige">הגדרות מערכת</h1>
          <p className="text-beige-muted text-sm mt-1">ניהול נתונים ותצוגה באתר</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <form onSubmit={handleSaveStats}>
          <GlassCard className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-beige mb-4 border-b border-white/10 pb-2">נתונים סטטיסטיים (דף הבית)</h3>
            <p className="text-sm text-beige-muted mb-4">המספרים שיופיעו תחת כרטיסיות הסטטיסטיקה בעמוד הראשי.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-beige-muted mb-2">פרויקטים מוצלחים</label>
                <input type="number" required value={stats.projects} onChange={e => setStats({...stats, projects: +e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10" />
              </div>
              <div>
                <label className="block text-sm text-beige-muted mb-2">לקוחות מרוצים</label>
                <input type="number" required value={stats.customers} onChange={e => setStats({...stats, customers: +e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10" />
              </div>
              <div>
                <label className="block text-sm text-beige-muted mb-2">אחוזי שביעות רצון</label>
                <input type="number" required max="100" value={stats.satisfaction} onChange={e => setStats({...stats, satisfaction: +e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10" />
              </div>
              <div>
                <label className="block text-sm text-beige-muted mb-2">מדפסות פעילות</label>
                <input type="number" required value={stats.printers} onChange={e => setStats({...stats, printers: +e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10" />
              </div>
            </div>

            <div className="pt-4 text-left">
              <GoldButton type="submit" loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                שמור נתונים סטטיסטיים
              </GoldButton>
            </div>
          </GlassCard>
        </form>
      )}

      {!loading && !error && (
        <form onSubmit={handleSavePreset}>
          <GlassCard className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-beige mb-4 border-b border-white/10 pb-2">הגדרות תמחור (הצעות מחיר אוטומטיות)</h3>
            <p className="text-sm text-beige-muted mb-4">פרמטרים אלו משמשים בחישוב העלויות בהצעת מחיר פומבית וביצירת מוצרים.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-beige-muted mb-2">עלות חשמל לקוט"ש (₪)</label>
                <input type="number" step="0.01" required value={preset.electricity_kwh_rate} onChange={e => setPreset({...preset, electricity_kwh_rate: +e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10" />
              </div>
              <div>
                <label className="block text-sm text-beige-muted mb-2">צריכת חשמל מדפסת (W)</label>
                <input type="number" required value={preset.printer_wattage} onChange={e => setPreset({...preset, printer_wattage: +e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10" />
              </div>
              <div>
                <label className="block text-sm text-beige-muted mb-2">עלות שעת עבודה (₪)</label>
                <input type="number" required value={preset.hourly_labor_rate} onChange={e => setPreset({...preset, hourly_labor_rate: +e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10" />
              </div>
              <div>
                <label className="block text-sm text-beige-muted mb-2">מרווח כשלון מדפסת (%)</label>
                <input type="number" required value={preset.failure_margin_pct} onChange={e => setPreset({...preset, failure_margin_pct: +e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10" />
              </div>
              <div>
                <label className="block text-sm text-beige-muted mb-2">אחוז רווח דיפולטיבי (%)</label>
                <input type="number" required value={preset.default_profit_margin} onChange={e => setPreset({...preset, default_profit_margin: +e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10" />
              </div>
            </div>

            <div className="pt-4 text-left">
              <GoldButton type="submit" loading={savingPreset}>
                <Save className="w-4 h-4 mr-2" />
                שמור הגדרות תמחור
              </GoldButton>
            </div>
          </GlassCard>
        </form>
      )}
    </div>
  )
}
