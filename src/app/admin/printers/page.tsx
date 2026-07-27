'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { Printer, Check, X, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface PrinterModel {
  id: string
  name: string
  status: string
  created_at: string
}

export default function PrintersPage() {
  const [printers, setPrinters] = useState<PrinterModel[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchPrinters = async () => {
    const sb = createClient()
    const { data } = await sb.from('printers').select('*').order('created_at', { ascending: true })
    if (data) setPrinters(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPrinters()
  }, [])

  const handleAddPrinter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    const sb = createClient()
    await sb.from('printers').insert([{ name: newName.trim(), status: 'active' }])
    setNewName('')
    setAdding(false)
    fetchPrinters()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק מדפסת זו?')) return
    const sb = createClient()
    await sb.from('printers').delete().eq('id', id)
    fetchPrinters()
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const sb = createClient()
    const newStatus = currentStatus === 'active' ? 'maintenance' : 'active'
    await sb.from('printers').update({ status: newStatus }).eq('id', id)
    fetchPrinters()
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Printer className="w-8 h-8 text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-beige">ניהול מדפסות</h1>
          <p className="text-beige-muted text-sm mt-1">הוסף ונהל את מדפסות הסטודיו להקצאת עבודות</p>
        </div>
      </div>

      <GlassCard className="p-6 mb-8">
        <form onSubmit={handleAddPrinter} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-beige-muted mb-2">שם המדפסת החדשה</label>
            <input 
              required 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              placeholder="למשל: Bambu Lab X1C #1"
              className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10" 
            />
          </div>
          <GoldButton type="submit" loading={adding} className="h-[46px] px-8">
            הוסף מדפסת
          </GoldButton>
        </form>
      </GlassCard>

      <div className="space-y-4">
        {loading ? (
          <p className="text-beige-muted text-center">טוען מדפסות...</p>
        ) : printers.length === 0 ? (
          <p className="text-beige-muted text-center py-8">לא נמצאו מדפסות. הוסף את המדפסת הראשונה שלך!</p>
        ) : (
          printers.map(p => (
            <GlassCard key={p.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${p.status === 'active' ? 'bg-status-success' : 'bg-status-warning'}`}></div>
                <div>
                  <h3 className="text-beige font-semibold text-lg">{p.name}</h3>
                  <p className="text-beige-muted text-sm">{p.status === 'active' ? 'פעילה ומוכנה' : 'בתחזוקה / מושבתת'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleStatus(p.id, p.status)}
                  className="text-sm text-beige-muted hover:text-beige border border-white/10 rounded-lg px-4 py-2 hover:bg-white/5 transition-colors"
                >
                  שנה סטטוס ל-{p.status === 'active' ? 'תחזוקה' : 'פעילה'}
                </button>
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-status-danger hover:bg-status-danger/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  )
}
