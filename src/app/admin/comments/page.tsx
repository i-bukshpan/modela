'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { MessageSquare, CheckCircle, Trash2, XCircle } from 'lucide-react'

export default function CommentsPage() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComments()
  }, [])

  async function loadComments() {
    const sb = createClient()
    const { data } = await sb.from('comments').select('*, products(title)').order('created_at', { ascending: false })
    setComments(data || [])
    setLoading(false)
  }

  async function toggleApprove(id: string, currentStatus: boolean) {
    const sb = createClient()
    await sb.from('comments').update({ approved: !currentStatus }).eq('id', id)
    loadComments()
  }

  async function deleteComment(id: string) {
    if (!confirm('למחוק תגובה זו לצמיתות?')) return
    const sb = createClient()
    await sb.from('comments').delete().eq('id', id)
    loadComments()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-beige flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-gold" /> ניהול תגובות
        </h1>
        <p className="text-beige-muted text-sm mt-1">אשר, מחק, ונהל את התגובות של לקוחות על מוצרים</p>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-beige-muted">טוען תגובות...</div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-beige-muted">אין תגובות כרגע.</div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/10 text-beige-muted bg-white/5">
                <th className="font-normal p-4">תאריך</th>
                <th className="font-normal p-4">שם ותוכן</th>
                <th className="font-normal p-4">מוצר</th>
                <th className="font-normal p-4">סטטוס</th>
                <th className="font-normal p-4 w-24">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {comments.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-beige-muted">{new Date(c.created_at).toLocaleDateString('he-IL')}</td>
                  <td className="p-4">
                    <div className="text-beige font-medium">{c.author_name}</div>
                    <div className="text-beige-muted mt-1 text-xs">{c.content}</div>
                  </td>
                  <td className="p-4 text-beige-muted">{c.products?.title || '—'}</td>
                  <td className="p-4">
                    {c.approved ? (
                      <span className="text-status-success bg-status-success/10 px-2 py-1 rounded-md text-xs">מאושר</span>
                    ) : (
                      <span className="text-status-warning bg-status-warning/10 px-2 py-1 rounded-md text-xs">ממתין</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleApprove(c.id, c.approved)}
                        className={`p-2 rounded-lg transition-colors ${c.approved ? 'text-status-warning hover:bg-status-warning/10' : 'text-status-success hover:bg-status-success/10'}`}
                        title={c.approved ? 'בטל אישור' : 'אשר'}
                      >
                        {c.approved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => deleteComment(c.id)}
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
