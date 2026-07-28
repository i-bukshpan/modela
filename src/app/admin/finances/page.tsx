'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { Wallet, TrendingUp, TrendingDown, Plus, CreditCard, Download } from 'lucide-react'

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState<'expenses'|'revenues'>('expenses')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    title: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData() {
    setLoading(true)
    const sb = createClient()
    const table = activeTab === 'expenses' ? 'expenses' : 'revenue_entries'
    const { data } = await sb.from(table).select('*').order('date', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.category || !form.amount) return
    const sb = createClient()
    const table = activeTab === 'expenses' ? 'expenses' : 'revenue_entries'
    
    if (editingId) {
      const { error } = await sb.from(table).update({
        title: form.title,
        category: form.category,
        amount: Number(form.amount),
        date: form.date,
        notes: form.notes
      }).eq('id', editingId)
      
      if (error) {
        alert("שגיאה בעדכון: " + error.message)
        return
      }
    } else {
      const { error } = await sb.from(table).insert([{
        title: form.title,
        category: form.category,
        amount: Number(form.amount),
        date: form.date,
        notes: form.notes
      }])
      
      if (error) {
        alert("שגיאה בשמירה: " + error.message)
        return
      }
    }
    
    setForm({ ...form, title: '', amount: '', notes: '' })
    setEditingId(null)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק רשומה זו?')) return
    const sb = createClient()
    const table = activeTab === 'expenses' ? 'expenses' : 'revenue_entries'
    await sb.from(table).delete().eq('id', id)
    loadData()
  }

  const handleEdit = (entry: any) => {
    setForm({
      title: entry.title,
      category: entry.category,
      amount: entry.amount,
      date: entry.date,
      notes: entry.notes || ''
    })
    setEditingId(entry.id)
  }

  const totalAmount = entries.reduce((acc, curr) => acc + Number(curr.amount), 0)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-beige flex items-center gap-2">
            <Wallet className="w-6 h-6 text-gold" /> ניהול כספים
          </h1>
          <p className="text-beige-muted text-sm mt-1">מעקב אחר הוצאות, הכנסות, וניתוח רווחיות</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'expenses' ? 'bg-status-danger/20 text-status-danger border border-status-danger/30' : 'glass text-beige-muted border border-white/10'}`}
        >
          <TrendingDown className="w-5 h-5" /> הוצאות
        </button>
        <button 
          onClick={() => setActiveTab('revenues')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'revenues' ? 'bg-status-success/20 text-status-success border border-status-success/30' : 'glass text-beige-muted border border-white/10'}`}
        >
          <TrendingUp className="w-5 h-5" /> הכנסות
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <GlassCard className="p-6 h-fit">
          <h3 className="font-semibold text-beige mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-gold" /> {editingId ? 'ערוך' : 'הוסף'} {activeTab === 'expenses' ? 'הוצאה' : 'הכנסה'}
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs text-beige-muted mb-1">כותרת</label>
              <input required value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="w-full glass rounded-lg px-3 py-2 text-sm text-beige outline-none border border-white/10 focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-xs text-beige-muted mb-1">קטגוריה</label>
              <select required value={form.category} onChange={e=>setForm({...form, category: e.target.value})} className="w-full glass rounded-lg px-3 py-2 text-sm text-beige outline-none border border-white/10 focus:border-gold/50 [&>option]:bg-slate-900">
                <option value="">בחר קטגוריה</option>
                {activeTab === 'expenses' ? (
                  <>
                    <option value="materials">חומרי גלם</option>
                    <option value="maintenance">תחזוקה</option>
                    <option value="power">חשמל</option>
                    <option value="software">תוכנה</option>
                    <option value="shipping">משלוחים</option>
                    <option value="equipment">ציוד</option>
                    <option value="general">כללי</option>
                  </>
                ) : (
                  <>
                    <option value="print_job">הדפסה</option>
                    <option value="design_service">שירותי עיצוב</option>
                    <option value="product_sale">מכירת מוצר קטלוג</option>
                    <option value="consultation">ייעוץ</option>
                    <option value="other">אחר</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs text-beige-muted mb-1">סכום (₪)</label>
              <input required type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} className="w-full glass rounded-lg px-3 py-2 text-sm text-beige outline-none border border-white/10 focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-xs text-beige-muted mb-1">תאריך</label>
              <input required type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} className="w-full glass rounded-lg px-3 py-2 text-sm text-beige outline-none border border-white/10 focus:border-gold/50 [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs text-beige-muted mb-1">הערות</label>
              <textarea rows={2} value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})} className="w-full glass rounded-lg px-3 py-2 text-sm text-beige outline-none border border-white/10 focus:border-gold/50" />
            </div>
            <div className="flex gap-2 mt-2">
              <GoldButton type="submit" className="flex-1">
                {editingId ? 'עדכן רשומה' : 'הוסף רשומה'}
              </GoldButton>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm({ ...form, title: '', amount: '', notes: '' }) }} className="px-4 py-2 glass rounded-xl text-beige-muted hover:text-beige">
                  ביטול
                </button>
              )}
            </div>
          </form>
        </GlassCard>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          
          <GlassCard className="p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-beige-muted mb-1">סה"כ {activeTab === 'expenses' ? 'הוצאות' : 'הכנסות'} רשומות</div>
              <div className={`text-3xl font-bold font-num ${activeTab === 'expenses' ? 'text-status-danger' : 'text-status-success'}`}>
                ₪{totalAmount.toFixed(2)}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeTab === 'expenses' ? 'bg-status-danger/10 text-status-danger' : 'bg-status-success/10 text-status-success'}`}>
              <CreditCard className="w-6 h-6" />
            </div>
          </GlassCard>

          <GlassCard className="p-0 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-beige-muted">טוען נתונים...</div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center text-beige-muted">אין נתונים להצגה</div>
            ) : (
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-beige-muted bg-white/5">
                    <th className="font-normal p-4">תאריך</th>
                    <th className="font-normal p-4">כותרת</th>
                    <th className="font-normal p-4">קטגוריה</th>
                    <th className="font-normal p-4">סכום</th>
                    <th className="font-normal p-4 w-24">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {entries.map(e => (
                    <tr key={e.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-beige-muted">{new Date(e.date).toLocaleDateString('he-IL')}</td>
                      <td className="p-4 text-beige">
                        <div>{e.title}</div>
                        {e.notes && <div className="text-xs text-beige-muted mt-1 whitespace-pre-wrap">{e.notes}</div>}
                      </td>
                      <td className="p-4 text-beige-muted">
                        <span className="px-2 py-1 rounded-md bg-white/5 text-xs">{e.category}</span>
                      </td>
                      <td className={`p-4 font-bold font-num ${activeTab === 'expenses' ? 'text-status-danger' : 'text-status-success'}`}>
                        {activeTab === 'expenses' ? '-' : '+'}₪{e.amount}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(e)} className="p-1.5 text-beige-muted hover:text-gold hover:bg-gold/10 rounded-lg transition-colors">
                            <span className="text-xs">ערוך</span>
                          </button>
                          <button onClick={() => handleDelete(e.id)} className="p-1.5 text-beige-muted hover:text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors">
                            <span className="text-xs">מחק</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  )
}
