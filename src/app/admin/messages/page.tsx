'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { Mail, Trash2, CheckCircle } from 'lucide-react'

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    const sb = createClient()
    const { data } = await sb.from('contact_messages').select('*').order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const sb = createClient()
    const newStatus = currentStatus === 'read' ? 'new' : 'read'
    await sb.from('contact_messages').update({ status: newStatus }).eq('id', id)
    loadMessages()
  }

  async function deleteMessage(id: string) {
    if (!confirm('למחוק הודעה זו לצמיתות?')) return
    const sb = createClient()
    await sb.from('contact_messages').delete().eq('id', id)
    loadMessages()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-beige flex items-center gap-2">
          <Mail className="w-6 h-6 text-gold" /> הודעות קשר
        </h1>
        <p className="text-beige-muted text-sm mt-1">נהל את פניות הלקוחות שהגיעו דרך האתר</p>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-beige-muted">טוען הודעות...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-beige-muted">אין הודעות כרגע.</div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/10 text-beige-muted bg-white/5">
                <th className="font-normal p-4">תאריך</th>
                <th className="font-normal p-4">מאת</th>
                <th className="font-normal p-4">תוכן הפנייה</th>
                <th className="font-normal p-4">סטטוס</th>
                <th className="font-normal p-4 w-24">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {messages.map(m => (
                <tr key={m.id} className={`hover:bg-white/5 transition-colors ${m.status === 'new' ? 'bg-gold/5' : ''}`}>
                  <td className="p-4 text-beige-muted">{new Date(m.created_at).toLocaleDateString('he-IL')}</td>
                  <td className="p-4">
                    <div className="text-beige font-medium">{m.name}</div>
                    <div className="text-beige-muted mt-1 text-xs">{m.email} <br/> {m.phone}</div>
                  </td>
                  <td className="p-4">
                    {m.subject && <div className="font-semibold text-beige mb-1">{m.subject}</div>}
                    <div className="text-beige-muted text-xs line-clamp-3 max-w-xs">{m.message}</div>
                  </td>
                  <td className="p-4">
                    {m.status === 'new' ? (
                      <span className="text-gold bg-gold/10 px-2 py-1 rounded-md text-xs">חדש</span>
                    ) : (
                      <span className="text-beige-muted bg-white/5 px-2 py-1 rounded-md text-xs">נקרא</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleStatus(m.id, m.status)}
                        className={`p-2 rounded-lg transition-colors text-status-success hover:bg-status-success/10`}
                        title={m.status === 'new' ? 'סמן כנקרא' : 'סמן כחדש'}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteMessage(m.id)}
                        className="p-2 text-beige-muted hover:text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
  )
}
