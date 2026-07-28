'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { Save, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { processImageFile } from '@/lib/imageUtils'
import Editor from 'react-simple-wysiwyg'

export default function NewBlogPostPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  
  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const processed = await processImageFile(file)
      setCoverImageFile(processed)
    } else {
      setCoverImageFile(null)
    }
  }

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft',
    tags: ''
  })

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9א-ת]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setForm({ ...form, title, slug })
  }

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSaving(true)
      try {
        const file = await processImageFile(e.target.files[0])
        const sb = createClient()
        const ext = file.name.split('.').pop()
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
        const { data } = await sb.storage.from('blog-images').upload(`content/${filename}`, file)
        if (data) {
          const { data: { publicUrl } } = sb.storage.from('blog-images').getPublicUrl(`content/${filename}`)
          setForm(prev => ({...prev, content: prev.content + `<br/><img src="${publicUrl}" style="max-width:100%; border-radius: 8px; margin: 16px auto; display: block;" /><br/>`}))
        }
      } catch (err) {
        console.error(err)
      }
      setSaving(false)
      e.target.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const sb = createClient()
    
    let coverImageUrl = null
    if (coverImageFile) {
      const ext = coverImageFile.name.split('.').pop()
      const fileName = `blog_${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { data: imgData, error: imgError } = await sb.storage.from('products').upload(fileName, coverImageFile)
      if (imgData) {
        const { data: publicUrlData } = sb.storage.from('products').getPublicUrl(fileName)
        coverImageUrl = publicUrlData.publicUrl
      } else if (imgError) {
        alert("שגיאה בהעלאת תמונה: " + imgError.message)
      }
    }

    const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)

    const { error } = await sb.from('blog_posts').insert([{
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      status: form.status,
      tags: tagsArray,
      cover_image: coverImageUrl
    }])

    if (error) {
      alert("שגיאה בשמירת הפוסט: " + error.message)
      setSaving(false)
      return
    }

    router.push('/admin/blog')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="p-2 rounded-xl glass text-beige-muted hover:text-beige transition-colors">
            <ChevronRight className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-beige">פוסט חדש</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <GlassCard className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm text-beige-muted mb-1">כותרת הפוסט</label>
              <input required value={form.title} onChange={e => handleTitleChange(e.target.value)} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 focus:border-gold/50" />
            </div>
            
            <div className="col-span-1">
              <label className="block text-sm text-beige-muted mb-1">Slug (URL)</label>
              <input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 focus:border-gold/50 text-left" dir="ltr" />
            </div>

            <div className="col-span-1">
              <label className="block text-sm text-beige-muted mb-1">סטטוס</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 focus:border-gold/50 [&>option]:bg-slate-900">
                <option value="draft">טיוטה (Draft)</option>
                <option value="published">מפורסם (Published)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-beige-muted mb-1">תמונת נושא (Cover Image)</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-beige-muted overflow-hidden shrink-0">
                {coverImageFile ? (
                  <img src={URL.createObjectURL(coverImageFile)} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6" />
                )}
              </div>
              <input type="file" accept="image/*,.heic" onChange={handleCoverImageChange} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/20 file:text-gold hover:file:bg-gold/30" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-beige-muted mb-1">תקציר (Excerpt)</label>
            <textarea rows={2} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 focus:border-gold/50" />
          </div>

          <div>
            <label className="block text-sm text-beige-muted mb-1">תוכן המאמר</label>
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden [&_.rsw-editor]:min-h-[300px] [&_.rsw-editor]:text-beige [&_.rsw-toolbar]:bg-slate-900 [&_.rsw-toolbar]:border-white/10 [&_.rsw-btn]:text-beige">
              <Editor value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
            </div>
            <div className="mt-2 text-left">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-beige cursor-pointer transition-colors">
                <ImageIcon className="w-4 h-4" />
                העלאת תמונה לגוף הפוסט
                <input type="file" accept="image/*,.heic" onChange={handleContentImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-beige-muted mb-1">תגיות (מופרדות בפסיקים)</label>
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="3D printing, tutorials, news..." className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 focus:border-gold/50" />
          </div>
        </GlassCard>

        <div className="flex justify-end gap-3">
          <Link href="/admin/blog" className="px-6 py-2.5 rounded-xl border border-white/10 text-beige hover:bg-white/5 transition-all">
            ביטול
          </Link>
          <GoldButton type="submit" loading={saving} className="px-8">
            <Save className="w-4 h-4" /> שמור פוסט
          </GoldButton>
        </div>
      </form>
    </div>
  )
}
