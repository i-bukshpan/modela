'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category } from '@/types/database'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { Badge, MaterialBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/StatCard'
import { SectionHeader } from '@/components/ui/StatCard'
import { getProductCover, cn } from '@/lib/utils'
import { Search, Grid3X3, LayoutGrid, Heart, Clock, Weight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const VIEW_MODES = [
  { key: 'grid', icon: Grid3X3 },
  { key: 'masonry', icon: LayoutGrid },
] as const

function GalleryContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || '')
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [view, setView] = useState<'grid' | 'masonry'>('grid')
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const saved = localStorage.getItem('modela-liked')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  const MATERIALS = ['PLA', 'PETG', 'TPU', 'ABS', 'Resin']

  useEffect(() => {
    const sb = createClient()
    sb.from('categories').select('*').is('parent_id', null).order('sort_order').then(({ data }) => {
      if (data) setCategories(data as Category[])
    })
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const sb = createClient()
    let q = sb.from('products')
      .select('*,product_media(url,is_cover,type),category:categories(name,slug)')
      .order('created_at', { ascending: false })

    if (selectedCat) {
      const cat = categories.find(c => c.slug === selectedCat)
      if (cat) q = q.eq('category_id', cat.id)
    }
    if (selectedMaterial) q = q.eq('material', selectedMaterial)

    const { data } = await q.limit(50)
    let results = (data || []) as Product[]

    if (query) {
      results = results.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      )
    }
    setProducts(results)
    setLoading(false)
  }, [selectedCat, selectedMaterial, query, categories])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const toggleLike = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    const sb = createClient()
    const isLiked = likedIds.has(product.id)
    const newLiked = new Set(likedIds)
    if (isLiked) {
      newLiked.delete(product.id)
      await sb.rpc('decrement_product_like', { p_id: product.id })
    } else {
      newLiked.add(product.id)
      await sb.rpc('increment_product_like', { p_id: product.id })
    }
    setLikedIds(newLiked)
    localStorage.setItem('modela-liked', JSON.stringify([...newLiked]))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <SectionHeader
        label="הגלריה שלנו"
        title="עשרות פרויקטים"
        titleHighlight="שכבר יצאו לאור"
        subtitle="לחץ על מוצר כלשהו לצפייה בפרטים המלאים, הורדת קבצים ויצירת קשר"
      />

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-beige-muted" />
          <input
            type="text"
            placeholder="חיפוש פרויקטים..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 glass rounded-xl text-beige placeholder-beige-dim focus:border-gold/40 transition-all outline-none bg-transparent"
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 justify-center">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCat('')}
              className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                !selectedCat ? 'bg-gold text-slate-canvas' : 'glass text-beige-muted hover:text-beige'
              )}
            >
              הכל
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(selectedCat === cat.slug ? '' : cat.slug)}
                className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  selectedCat === cat.slug ? 'bg-gold text-slate-canvas' : 'glass text-beige-muted hover:text-beige'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Material filter */}
          <div className="h-6 w-px bg-white/10 hidden sm:block" />
          <div className="flex gap-2">
            {MATERIALS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMaterial(selectedMaterial === m ? '' : m)}
                className={cn('px-2.5 py-1 rounded-full text-xs font-bold border transition-all',
                  selectedMaterial === m
                    ? 'bg-cyber-blue/20 border-cyber-blue/40 text-cyber-blue'
                    : 'border-white/10 text-beige-muted hover:border-white/20'
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="ml-auto flex gap-1 glass rounded-lg p-1">
            {VIEW_MODES.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key as 'grid' | 'masonry')}
                className={cn('p-2 rounded-md transition-all',
                  view === key ? 'bg-gold/20 text-gold' : 'text-beige-muted hover:text-beige'
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div key="skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            key="empty"
            className="text-center py-24 text-beige-muted"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-white/10" />
            <p className="text-lg">לא נמצאו פרויקטים</p>
            <p className="text-sm mt-2">נסה לשנות את מסנני החיפוש</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className={cn(
              'gap-5',
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 space-y-5'
            )}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            {products.map((product, i) => {
              const cover = getProductCover(product.product_media || [])
              const isLiked = likedIds.has(product.id)
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className={view === 'masonry' ? 'break-inside-avoid' : ''}
                >
                  <Link href={`/product/${product.slug}`}>
                    <GlassCard className="overflow-hidden group cursor-pointer">
                      {/* Image */}
                      <div className={cn('relative overflow-hidden bg-slate-surface',
                        view === 'masonry' ? 'h-auto' : 'h-52'
                      )}>
                        <img
                          src={cover}
                          alt={product.title}
                          className={cn('w-full object-cover group-hover:scale-105 transition-transform duration-500',
                            view === 'masonry' ? 'h-auto' : 'h-full'
                          )}
                        />
                        {/* Like button */}
                        <button
                          onClick={e => toggleLike(e, product)}
                          className="absolute top-3 left-3 w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-red-500/20 transition-all"
                        >
                          <Heart className={cn('w-4 h-4', isLiked ? 'fill-red-400 text-red-400' : 'text-beige-muted')} />
                        </button>
                        {/* Sale badge */}
                        {product.sale_price && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-status-danger text-white text-xs font-bold">
                            מבצע
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-beige mb-2 truncate">{product.title}</h3>

                        {/* Spec chips */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {product.material && <MaterialBadge material={product.material} />}
                          {product.print_time && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-beige-muted bg-white/5 rounded-full border border-white/10">
                              <Clock className="w-3 h-3" />{product.print_time}
                            </span>
                          )}
                          {product.material_weight_g && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-beige-muted bg-white/5 rounded-full border border-white/10">
                              <Weight className="w-3 h-3" />{product.material_weight_g}g
                            </span>
                          )}
                        </div>

                        {/* Price & likes */}
                        <div className="flex items-center justify-between">
                          <div>
                            {product.sale_price ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-gold font-bold font-num">₪{product.sale_price}</span>
                                <span className="text-beige-muted text-xs line-through font-num">₪{product.price}</span>
                              </div>
                            ) : product.price ? (
                              <span className="text-gold font-bold font-num">₪{product.price}</span>
                            ) : null}
                          </div>
                          <span className="flex items-center gap-1 text-xs text-beige-muted">
                            <Heart className="w-3 h-3" />
                            <span className="font-num">{product.like_count}</span>
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-beige-muted">טוען גלריה...</div>}>
      <GalleryContent />
    </Suspense>
  )
}
