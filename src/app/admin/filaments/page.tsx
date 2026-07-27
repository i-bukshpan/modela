'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Filament } from '@/types/database'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { Badge } from '@/components/ui/Badge'
import { FilamentProgressBar, Skeleton } from '@/components/ui/StatCard'
import { Plus, Edit2, Trash2, AlertTriangle, Check, X } from 'lucide-react'

const MATERIALS = ['PLA', 'PLA+', 'PETG', 'PETG-CF', 'TPU', 'ABS', 'ASA', 'Resin', 'Nylon', 'HIPS']

const emptyFilament = {
  brand: '', material: 'PLA', color_name: '', color_hex: '#C97E2A',
  spool_weight_g: 1000, remaining_weight_g: 1000, cost_per_kg: 85,
  low_stock_threshold_g: 150, purchase_date: '', notes: '', is_active: true,
}

export default function FilamentsPage() {
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyFilament)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const sb = createClient()
    const { data } = await sb.from('filaments').select('*').order('is_active', { ascending: false }).order('material')
    setFilaments((data || []) as Filament[])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const openNew = () => {
    setEditId(null)
    setForm(emptyFilament as any)
    setShowForm(true)
  }

  const openEdit = (f: Filament) => {
    setEditId(f.id)
    setForm({ ...f, purchase_date: f.purchase_date || '', notes: f.notes || '' } as typeof emptyFilament)
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const sb = createClient()
    const payload = {
      ...form,
      purchase_date: form.purchase_date || null,
      spool_weight_g: +form.spool_weight_g,
      remaining_weight_g: +form.remaining_weight_g,
      cost_per_kg: +form.cost_per_kg,
      low_stock_threshold_g: +form.low_stock_threshold_g,
    }
    if (editId) {
      const { error } = await sb.from('filaments').update(payload).eq('id', editId)
      if (error) { alert("שגיאה: " + error.message); setSaving(false); return; }
    } else {
      const { error } = await sb.from('filaments').insert(payload)
      if (error) { alert("שגיאה: " + error.message); setSaving(false); return; }
    }
    setShowForm(false)
    setSaving(false)
    fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('בטוח שברצונך למחוק?')) return
    const sb = createClient()
    await sb.from('filaments').delete().eq('id', id)
    fetch()
  }

  const lowStock = filaments.filter(f => f.remaining_weight_g <= f.low_stock_threshold_g && f.is_active)

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-beige">ניהול מלאי חוטים</h1>
          <p className="text-beige-muted text-sm mt-1">{filaments.length} ספולים במלאי</p>
        </div>
        <GoldButton onClick={openNew}>
          <Plus className="w-4 h-4" /> הוסף ספול
        </GoldButton>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <GlassCard className="p-4 mb-6 border-status-danger/30 bg-status-danger/5">
          <div className="flex items-center gap-2 text-status-danger">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-semibold text-sm">{lowStock.length} חוטים במלאי נמוך:</span>
            <span className="text-sm text-beige-muted">
              {lowStock.map(f => `${f.brand} ${f.color_name} (${f.remaining_weight_g}g)`).join(' · ')}
            </span>
          </div>
        </GlassCard>
      )}

      {/* Filament cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filaments.map(f => (
            <GlassCard
              key={f.id}
              className={`p-5 ${!f.is_active ? 'opacity-50' : ''} ${f.remaining_weight_g <= f.low_stock_threshold_g ? 'border-status-danger/25' : ''}`}
            >
              {/* Color swatch + name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl border-2 border-white/20 flex-shrink-0 shadow-inner"
                  style={{ backgroundColor: f.color_hex }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-beige truncate">
                    {f.brand} — {f.color_name}
                  </div>
                  <div className="flex gap-1.5 mt-0.5">
                    <Badge variant="gold" label={f.material} />
                    {f.remaining_weight_g <= f.low_stock_threshold_g && (
                      <Badge variant="danger" label="מלאי נמוך" />
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <FilamentProgressBar
                remaining={f.remaining_weight_g}
                total={f.spool_weight_g}
                threshold={f.low_stock_threshold_g}
                colorHex={f.color_hex}
                className="mb-3"
              />

              {/* Info */}
              <div className="text-xs text-beige-muted space-y-1">
                <div className="flex justify-between">
                  <span>ספול</span>
                  <span className="font-num">{f.spool_weight_g}g</span>
                </div>
                <div className="flex justify-between">
                  <span>עלות לק"ג</span>
                  <span className="text-gold font-num font-semibold">₪{f.cost_per_kg}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
                <GoldButton variant="ghost" size="sm" className="flex-1" onClick={() => openEdit(f)}>
                  <Edit2 className="w-3.5 h-3.5" /> עריכה
                </GoldButton>
                <GoldButton variant="danger" size="sm" onClick={() => handleDelete(f.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </GoldButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <GlassCard className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-beige">{editId ? 'עריכת ספול' : 'ספול חדש'}</h3>
              <button onClick={() => setShowForm(false)} className="text-beige-muted hover:text-beige">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'brand', label: 'מותג', type: 'text' },
                { key: 'color_name', label: 'שם צבע', type: 'text' },
                { key: 'spool_weight_g', label: 'משקל ספול (g)', type: 'number' },
                { key: 'remaining_weight_g', label: 'נותר (g)', type: 'number' },
                { key: 'cost_per_kg', label: 'עלות לק"ג (₪)', type: 'number' },
                { key: 'low_stock_threshold_g', label: 'סף מלאי נמוך (g)', type: 'number' },
                { key: 'purchase_date', label: 'תאריך רכישה', type: 'date' },
              ].map(f => (
                <div key={f.key} className={f.key === 'brand' || f.key === 'color_name' ? 'col-span-1' : ''}>
                  <label className="block text-xs text-beige-muted mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form] as any}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full glass rounded-lg px-3 py-2 text-sm text-beige bg-transparent outline-none"
                  />
                </div>
              ))}

              {/* Material select */}
              <div>
                <label className="block text-xs text-beige-muted mb-1">חומר</label>
                <select
                  value={form.material}
                  onChange={e => setForm({ ...form, material: e.target.value })}
                  className="w-full glass rounded-lg px-3 py-2 text-sm text-beige bg-slate-card outline-none"
                >
                  {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs text-beige-muted mb-1">צבע Hex</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.color_hex}
                    onChange={e => setForm({ ...form, color_hex: e.target.value })}
                    className="w-10 h-9 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.color_hex}
                    onChange={e => setForm({ ...form, color_hex: e.target.value })}
                    className="flex-1 glass rounded-lg px-3 py-2 text-sm text-beige bg-transparent outline-none font-num"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-xs text-beige-muted mb-1">הערות</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full glass rounded-lg px-3 py-2 text-sm text-beige bg-transparent outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <GoldButton onClick={handleSave} loading={saving} className="flex-1">
                <Check className="w-4 h-4" /> {editId ? 'עדכון' : 'הוספה'}
              </GoldButton>
              <GoldButton variant="ghost" onClick={() => setShowForm(false)}>
                ביטול
              </GoldButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
