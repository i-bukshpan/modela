'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { BookOpen, Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    const sb = createClient()
    const { data } = await sb.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('האם אתה בטוח שברצונך למחוק פוסט זה?')) return
    const sb = createClient()
    const { error } = await sb.from('blog_posts').delete().eq('id', id)
    if (error) alert("שגיאה במחיקה: " + error.message)
    else loadPosts()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-beige flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-gold" /> ניהול בלוג
          </h1>
          <p className="text-beige-muted text-sm mt-1">נהל פוסטים, מאמרים וחדשות</p>
        </div>
        <Link 
          href="/admin/blog/new"
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-slate-canvas font-bold hover:bg-gold-light transition-all"
        >
          <Plus className="w-5 h-5" /> פוסט חדש
        </Link>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-beige-muted">טוען פוסטים...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-beige-muted">אין פוסטים עדיין. הוסף את הפוסט הראשון שלך!</div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/10 text-beige-muted bg-white/5">
                <th className="font-normal p-4">כותרת הפוסט</th>
                <th className="font-normal p-4">תאריך</th>
                <th className="font-normal p-4">סטטוס</th>
                <th className="font-normal p-4">צפיות</th>
                <th className="font-normal p-4 w-24">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.cover_image ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                          <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                          <BookOpen className="w-5 h-5 text-beige-muted" />
                        </div>
                      )}
                      <div>
                        <div className="text-beige font-medium">{p.title}</div>
                        <div className="text-xs text-beige-muted mt-0.5">/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-beige-muted">{new Date(p.created_at).toLocaleDateString('he-IL')}</td>
                  <td className="p-4">
                    {p.status === 'published' ? (
                      <Badge variant="success" label="מפורסם" />
                    ) : (
                      <Badge variant="neutral" label="טיוטה" />
                    )}
                  </td>
                  <td className="p-4 text-beige-muted font-num flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {p.view_count || 0}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/blog/edit/${p.id}`} className="p-2 text-beige-muted hover:text-gold hover:bg-gold/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-beige-muted hover:text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors">
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
