'use client'
import { useEffect, useState, use } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductFile, Comment } from '@/types/database'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { Badge, MaterialBadge, StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/StatCard'
import {
  Download, Eye, Heart, Clock, Weight, Box, Layers, Zap,
  ChevronRight, ChevronLeft, Star, Send, Check, Share2,
  Maximize2, Ruler, LayoutTemplate
} from 'lucide-react'
import { formatPrice, formatDateHe, formatFileSize, getProductCover, cn } from '@/lib/utils'

const ThreeModelViewer = dynamic(() => import('@/components/3d/ThreeModelViewer').then(m => m.ThreeModelViewer), { ssr: false })

interface Props { params: Promise<{ slug: string }> }

export default function ProductPage({ params }: Props) {
  const unwrapped = use(params)
  const slug = decodeURIComponent(unwrapped.slug)
  const [product, setProduct] = useState<Product | null>(null)
  const [files, setFiles] = useState<ProductFile[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [mediaIdx, setMediaIdx] = useState(0)
  const [showViewer, setShowViewer] = useState(false)
  const [liked, setLiked] = useState(false)
  const [commentSent, setCommentSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', content: '' })
  
  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [ordering, setOrdering] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.from('products')
        .select('*,product_media(url,type,is_cover,sort_order),category:categories(name,slug)')
        .eq('slug', slug)
        .single(),
      sb.from('comments').select('*').eq('approved', true).order('created_at', { ascending: false }),
    ]).then(([{ data: p }, { data: c }]) => {
      if (!p) { setLoading(false); return }
      setProduct(p as Product)
      if (c) setComments(c.filter(x => x.product_id === p.id) as Comment[])
      
      // Fetch files using the product ID
      sb.from('product_files').select('*').eq('product_id', p.id).then(({ data: fData }) => {
        if (fData) {
          setFiles(fData as ProductFile[])
          if (fData.some((f: ProductFile) => f.file_type === 'stl' || f.file_type === 'obj' || f.filename?.toLowerCase().endsWith('.stl'))) {
            setShowViewer(true)
          }
        }
      })

      setLoading(false)
      sb.rpc('increment_product_view', { p_id: p.id })
      // Check liked
      const saved = localStorage.getItem('modela-liked')
      if (saved) setLiked(JSON.parse(saved).includes(p.id))
    })
  }, [slug])

  const handleLike = async () => {
    if (!product) return
    const sb = createClient()
    const saved = JSON.parse(localStorage.getItem('modela-liked') || '[]')
    if (liked) {
      await sb.rpc('decrement_product_like', { p_id: product.id })
      setLiked(false)
      localStorage.setItem('modela-liked', JSON.stringify(saved.filter((id: string) => id !== product.id)))
    } else {
      await sb.rpc('increment_product_like', { p_id: product.id })
      setLiked(true)
      localStorage.setItem('modela-liked', JSON.stringify([...saved, product.id]))
    }
  }

  const handleDownload = async (file: ProductFile) => {
    const sb = createClient()
    await sb.rpc('increment_file_download', { f_id: file.id })
    window.open(file.file_url, '_blank')
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    const sb = createClient()
    await sb.from('comments').insert({
      product_id: product.id,
      author_name: form.name,
      author_email: form.email,
      content: form.content,
      approved: false,
    })
    setCommentSent(true)
  }

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setOrdering(true)
    const sb = createClient()
    await sb.from('print_jobs').insert({
      customer_name: orderForm.name,
      customer_phone: orderForm.phone,
      customer_email: orderForm.email,
      product_id: product.id,
      material_requested: product.material || 'PLA',
      notes: orderForm.notes,
      status: 'pending_quote',
      quoted_price: product.sale_price || product.price,
      is_custom_quote: false
    })
    setOrdering(false)
    setOrderSuccess(true)
    setTimeout(() => {
      setShowOrderModal(false)
      setOrderSuccess(false)
      setOrderForm({ name: '', phone: '', email: '', notes: '' })
    }, 3000)
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <Skeleton className="h-96" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )

  if (!product) return notFound()

  const media = (product.product_media || []).sort((a, b) => a.sort_order - b.sort_order)
  const currentMedia = media[mediaIdx]
  
  // Find STL file, ignoring the old 'uploaded_via_admin' placeholders if possible
  const validStlFiles = files.filter(f => (f.file_type === 'stl' || f.file_type === 'obj' || f.filename?.toLowerCase().endsWith('.stl')) && f.file_url !== 'uploaded_via_admin')
  const stlFile = validStlFiles.length > 0 ? validStlFiles[0] : files.find(f => f.file_type === 'stl' || f.file_type === 'obj' || f.filename?.toLowerCase().endsWith('.stl'))

  const SPECS = [
    { icon: Box, label: 'חומר', value: product.material },
    { icon: Layers, label: 'גובה שכבה', value: product.layer_height_mm ? `${product.layer_height_mm}mm` : null },
    { icon: Zap, label: 'אחוז מילוי', value: product.infill_percent ? `${product.infill_percent}%` : null },
    { icon: Clock, label: 'זמן הדפסה', value: product.print_time },
    { icon: Weight, label: 'משקל חומר', value: product.material_weight_g ? `${product.material_weight_g}g` : null },
    { icon: Ruler, label: 'מידות', value: product.dimensions },
    { icon: LayoutTemplate, label: 'גימור', value: product.finish_type },
    { icon: Box, label: 'מדפסת', value: product.printer_model },
  ].filter(s => s.value)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-beige-muted mb-8">
        <a href="/" className="hover:text-gold">בית</a>
        <ChevronLeft className="w-3.5 h-3.5" />
        <a href="/gallery" className="hover:text-gold">גלריה</a>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-beige">{product.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* ── LEFT: Media ── */}
        <div>
          {/* View toggle */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShowViewer(false)}
              className={cn('flex-1 py-2 text-sm rounded-xl transition-all', !showViewer ? 'bg-gold/20 border border-gold/40 text-gold' : 'glass text-beige-muted')}
            >
              תמונות
            </button>
            {stlFile && (
              <button
                onClick={() => setShowViewer(true)}
                className={cn('flex-1 py-2 text-sm rounded-xl transition-all', showViewer ? 'bg-gold/20 border border-gold/40 text-gold' : 'glass text-beige-muted')}
              >
                <Box className="w-4 h-4 inline ml-1" />
                צפייה תלת-מימדית
              </button>
            )}
          </div>

          {showViewer && stlFile ? (
            <ThreeModelViewer
              fileUrl={stlFile.file_url}
              fileType={stlFile.file_type}
              colorHex={product.material_color_hex || '#C97E2A'}
              className="h-96"
            />
          ) : (
            <>
              {/* Main image */}
              <GlassCard className="overflow-hidden mb-3 h-96">
                {currentMedia ? (
                  currentMedia.type === 'video' ? (
                    <video src={currentMedia.url} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={currentMedia.url} alt={product.title} className="w-full h-full object-contain" />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-beige-muted">
                    <Box className="w-24 h-24 opacity-20" />
                  </div>
                )}
              </GlassCard>
              {/* Thumbnails */}
              {media.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {media.map((m, i) => (
                    <button
                      key={m.url}
                      onClick={() => setMediaIdx(i)}
                      className={cn('flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                        i === mediaIdx ? 'border-gold' : 'border-transparent glass'
                      )}
                    >
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── RIGHT: Info ── */}
        <div className="space-y-6">
          {/* Category */}
          {product.category && (
            <a href={`/gallery?cat=${product.category.slug}`}>
              <Badge variant="gold">{product.category.name}</Badge>
            </a>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-beige leading-tight">{product.title}</h1>

          {/* Engagement */}
          <div className="flex items-center gap-4 text-sm text-beige-muted">
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> <span className="font-num">{product.view_count}</span> צפיות</span>
            <button onClick={handleLike} className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <Heart className={cn('w-4 h-4 transition-all', liked ? 'fill-red-400 text-red-400' : '')} />
              <span className="font-num">{product.like_count}</span> לייקים
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <Share2 className="w-4 h-4" /> שיתוף
            </button>
          </div>

          {/* Price */}
          {(product.price || product.sale_price) && (
            <GlassCard className="p-4 flex items-center gap-4">
              {product.sale_price ? (
                <>
                  <span className="text-3xl font-bold text-gold font-num">₪{product.sale_price}</span>
                  <span className="text-xl text-beige-muted line-through font-num">₪{product.price}</span>
                  <Badge variant="danger">במבצע!</Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-gold font-num">₪{product.price}</span>
              )}
            </GlassCard>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-beige-muted leading-relaxed">{product.description}</p>
          )}

          {/* Specs grid */}
          {SPECS.length > 0 && (
            <div>
              <h3 className="font-semibold text-beige mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-gold" /> מפרט טכני
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {SPECS.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="glass rounded-xl p-3 flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-gold/70 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-beige-muted">{label}</div>
                      <div className="text-sm font-medium text-beige">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={() => setShowOrderModal(true)} className="flex-1">
              <GoldButton className="w-full" size="lg">
                <Send className="w-5 h-5" /> הזמן עכשיו
              </GoldButton>
            </button>
            <a href={`https://wa.me/972500000000?text=שלום, אני מעוניין במוצר: ${product.title}`} target="_blank" className="flex-1">
              <GoldButton variant="secondary" className="w-full" size="lg">
                WhatsApp
              </GoldButton>
            </a>
          </div>
        </div>
      </div>

      {/* ── FILES ── */}
      {files.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-beige mb-6 flex items-center gap-2">
            <Download className="w-6 h-6 text-gold" /> קבצים להורדה
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map(file => (
              <GlassCard key={file.id} className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyber-blue/10 border border-cyber-blue/25 flex items-center justify-center text-cyber-blue font-bold text-xs font-num">
                  {file.file_type?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-beige truncate">{file.filename}</div>
                  <div className="text-xs text-beige-muted">{formatFileSize(file.file_size_bytes)}</div>
                  {file.mesh_volume_cm3 && (
                    <div className="text-xs text-beige-muted font-num">{file.mesh_volume_cm3} cm³</div>
                  )}
                </div>
                <GoldButton variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                  <Download className="w-4 h-4" />
                </GoldButton>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* ── COMMENTS ── */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-beige mb-6">תגובות ({comments.length})</h2>

        {/* Comment form */}
        {!commentSent ? (
          <GlassCard className="p-6 mb-8">
            <h3 className="font-semibold text-beige mb-4">הוסף תגובה</h3>
            <form onSubmit={handleComment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="שם *"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="glass rounded-xl px-4 py-3 text-beige placeholder-beige-dim outline-none focus:border-gold/40 transition-all bg-transparent w-full"
                />
                <input
                  type="email"
                  placeholder="אימייל"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="glass rounded-xl px-4 py-3 text-beige placeholder-beige-dim outline-none focus:border-gold/40 transition-all bg-transparent w-full"
                />
              </div>
              <textarea
                required
                rows={4}
                placeholder="כתוב את התגובה שלך..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="glass rounded-xl px-4 py-3 text-beige placeholder-beige-dim outline-none focus:border-gold/40 transition-all bg-transparent w-full resize-none"
              />
              <GoldButton type="submit">
                <Send className="w-4 h-4" /> שלח תגובה
              </GoldButton>
            </form>
          </GlassCard>
        ) : (
          <GlassCard variant="gold" className="p-6 mb-8 text-center">
            <Check className="w-10 h-10 text-status-success mx-auto mb-3" />
            <p className="text-beige font-semibold">תגובתך התקבלה ותפורסם לאחר בדיקה!</p>
          </GlassCard>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {comments.map(c => (
            <GlassCard key={c.id} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-slate-canvas font-bold text-xs">
                  {c.author_name[0]}
                </div>
                <div>
                  <div className="font-semibold text-beige text-sm">{c.author_name}</div>
                  <div className="text-xs text-beige-muted font-num">{formatDateHe(c.created_at)}</div>
                </div>
              </div>
              <p className="text-beige-muted text-sm leading-relaxed">{c.content}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowOrderModal(false)}>
          <GlassCard className="w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            {orderSuccess ? (
              <div className="text-center py-8">
                <Check className="w-12 h-12 text-status-success mx-auto mb-4" />
                <h3 className="text-xl font-bold text-beige mb-2">הזמנתך התקבלה!</h3>
                <p className="text-beige-muted">ניצור איתך קשר בהקדם להמשך טיפול.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-beige mb-4 text-center">הזמנת מוצר: {product.title}</h3>
                <form onSubmit={handleOrder} className="space-y-4">
                  <input required placeholder="שם מלא *" value={orderForm.name} onChange={e => setOrderForm({ ...orderForm, name: e.target.value })} className="w-full glass rounded-xl px-4 py-3 text-sm text-beige placeholder-beige-dim outline-none border border-white/10 focus:border-gold/50" />
                  <input required type="tel" placeholder="מספר טלפון *" value={orderForm.phone} onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })} className="w-full glass rounded-xl px-4 py-3 text-sm text-beige placeholder-beige-dim outline-none border border-white/10 focus:border-gold/50" />
                  <input type="email" placeholder="אימייל" value={orderForm.email} onChange={e => setOrderForm({ ...orderForm, email: e.target.value })} className="w-full glass rounded-xl px-4 py-3 text-sm text-beige placeholder-beige-dim outline-none border border-white/10 focus:border-gold/50" />
                  <textarea rows={3} placeholder="הערות מיוחדות להזמנה..." value={orderForm.notes} onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })} className="w-full glass rounded-xl px-4 py-3 text-sm text-beige placeholder-beige-dim outline-none border border-white/10 focus:border-gold/50 resize-none" />
                  
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowOrderModal(false)} className="flex-1 py-3 text-beige-muted hover:text-beige transition-colors">ביטול</button>
                    <GoldButton type="submit" loading={ordering} className="flex-1">
                      שלח הזמנה
                    </GoldButton>
                  </div>
                </form>
              </>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  )
}
