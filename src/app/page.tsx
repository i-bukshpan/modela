'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Sparkles, Grid3X3, MessageSquare, Award, Layers, PenTool,
  ChevronLeft, Star, Box, Palette, Dna, Gift, Cpu
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { StatCard } from '@/components/ui/StatCard'
import { SectionHeader } from '@/components/ui/StatCard'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Product, Testimonial, BlogPost, Category } from '@/types/database'
import { getProductCover, formatDateHe } from '@/lib/utils'

const ICON_MAP: Record<string, React.ElementType> = {
  box: Box, palette: Palette, dna: Dna, gift: Gift, cpu: Cpu, grid: Grid3X3,
}

const PROCESS_STEPS = [
  { num: 1, title: 'הרעיון', desc: 'שולחים לנו סקיצה, קובץ או פשוט מסבירים את הרעיון', color: '#C97E2A' },
  { num: 2, title: 'התכנון', desc: 'אנחנו מעצבים מודל דיגיטלי ושולחים לאישורך', color: '#E8B366' },
  { num: 3, title: 'ההדפסה', desc: 'המדפסות שלנו נכנסות לעבודה בדיוק מקסימלי', color: '#C97E2A' },
  { num: 4, title: 'המשלוח', desc: 'המוצר המוכן מגיע אליך ארוז ומוכן לשימוש', color: '#E8B366' },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.from('products').select('*,product_media(url,is_cover,type)').eq('featured', true).limit(6),
      sb.from('testimonials').select('*').eq('featured', true).limit(3),
      sb.from('blog_posts').select('id,title,slug,excerpt,cover_image,created_at,tags').eq('status', 'published').order('created_at', { ascending: false }).limit(3),
      sb.from('categories').select('*').is('parent_id', null).order('sort_order', { ascending: true }).limit(6),
    ]).then(([p, t, b, c]) => {
      if (p.data) setProducts(p.data as Product[])
      if (t.data) setTestimonials(t.data as Testimonial[])
      if (b.data) setPosts(b.data as BlogPost[])
      if (c.data) setCategories(c.data as Category[])
      
      // Load homepage stats
      sb.from('site_settings').select('value').eq('key', 'homepage_stats').maybeSingle().then(({ data }) => {
        if (data && data.value) {
          setStats(data.value)
        }
      })
    })
  }, [])

  const [stats, setStats] = useState({
    projects: 500, customers: 200, satisfaction: 99, printers: 8
  })

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-[#201c18] via-slate-card to-slate-canvas" />

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-cyber-violet/5 blur-3xl animate-float-slow pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass-gold rounded-full text-gold text-sm font-semibold border border-gold/20"
          >
            <Sparkles className="w-4 h-4" />
            סטודיו יצירתי להדפסת תלת מימד בטכנולוגיה מתקדמת
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-beige leading-tight mb-6"
          >
            מדמיון
            <br />
            <span className="gradient-text">למוצר תלת-ממדי מושלם</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-beige-muted text-lg md:text-xl max-w-2xl mx-auto mb-10"
          >
            מודלה הופכת כל רעיון למוצר מוחשי — בהתאמה אישית, בדיוק מרבי, ובתהליך מלא משלבי הקונספט ועד להדפסה הסופית.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/gallery">
              <GoldButton size="lg" variant="primary">
                <Grid3X3 className="w-5 h-5" />
                צפייה בפרויקטים
              </GoldButton>
            </Link>
            <Link href="/contact">
              <GoldButton size="lg" variant="secondary">
                <MessageSquare className="w-5 h-5" />
                התייעצות מקצועית
              </GoldButton>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mt-14"
          >
            {[
              { icon: Award, label: 'איכות ללא פשרות' },
              { icon: Layers, label: 'חומרים מתקדמים' },
              { icon: PenTool, label: 'התאמה אישית' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-beige-muted text-sm">
                <Icon className="w-4 h-4 text-gold" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-5 h-8 rounded-full border-2 border-gold/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-gold/60" />
          </div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 bg-slate-surface/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'פרויקטים מוצלחים', value: stats.projects, suffix: '+' },
              { label: 'לקוחות מרוצים', value: stats.customers, suffix: '+' },
              { label: 'שביעות רצון', value: stats.satisfaction, suffix: '%' },
              { label: 'מדפסות פעילות', value: stats.printers, suffix: '' },
            ].map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader
            label="הקטגוריות שלנו"
            title="מה אנחנו"
            titleHighlight="יוצרים?"
            subtitle="הדפסת תלת-מימד היא עולם שלם של אפשרויות. הנה הקטגוריות העיקריות:"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(categories.length > 0 ? categories : [
              { id: '1', slug: 'prototype', name: 'אב טיפוס', description: 'פיתוח מהיר', icon: 'box' },
              { id: '2', slug: 'gifts', name: 'מתנות', description: 'עיצוב אישי', icon: 'gift' },
              { id: '3', slug: 'figures', name: 'דמויות', description: 'פיגורינות', icon: 'palette' },
              { id: '4', slug: 'gadgets', name: 'גאדג׳טים', description: 'אביזרים', icon: 'cpu' },
              { id: '5', slug: 'medical', name: 'רפואי', description: 'פתרונות', icon: 'dna' },
              { id: '6', slug: 'custom', name: 'מותאם', description: 'לפי דרישה', icon: 'palette' },
            ] as Category[]).map((cat, i) => {
              const Icon = ICON_MAP[(cat.icon as string) || 'box'] || Box
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/gallery?cat=${cat.slug}`}>
                    <GlassCard className="p-5 text-center group hover:border-gold/30 hover:glass-gold">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-all">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-beige text-sm mb-1">{cat.name}</h3>
                      <p className="text-beige-muted text-xs truncate">{cat.description}</p>
                    </GlassCard>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="py-24 bg-slate-surface/30">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader
            label="תהליך העבודה"
            title="איך זה"
            titleHighlight="עובד?"
            subtitle="הדרך מהרעיון שלך ועד למוצר המודפס פשוטה ומהירה"
          />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 right-[12.5%] left-[12.5%] h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30" />
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 relative">
                  <div className="absolute -top-4 right-6 w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-slate-canvas font-bold text-sm font-num shadow-gold-sm">
                    {step.num}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-bold text-beige text-lg mb-2">{step.title}</h3>
                    <p className="text-beige-muted text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <SectionHeader
              centered={false}
              label="נבחרים"
              title="פרויקטים"
              titleHighlight="נבחרים"
              subtitle="הצצה אל חלק מהעבודות שביצענו לאחרונה"
            />
            <Link href="/gallery">
              <GoldButton variant="secondary" size="sm">
                כל הפרויקטים
                <ChevronLeft className="w-4 h-4" />
              </GoldButton>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/product/${product.slug}`}>
                  <GlassCard className="overflow-hidden group cursor-pointer">
                    <div className="relative h-52 bg-slate-surface overflow-hidden">
                      <img
                        src={getProductCover(product.product_media || [])}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.sale_price && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-status-danger/90 text-white text-xs font-bold">
                          מבצע!
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-beige mb-1 truncate">{product.title}</h3>
                      <div className="flex items-center gap-2">
                        {product.sale_price ? (
                          <>
                            <span className="text-gold font-bold font-num">₪{product.sale_price}</span>
                            <span className="text-beige-muted text-sm line-through font-num">₪{product.price}</span>
                          </>
                        ) : product.price ? (
                          <span className="text-gold font-bold font-num">₪{product.price}</span>
                        ) : null}
                        {product.material && (
                          <span className="mr-auto text-xs text-beige-muted bg-white/5 px-2 py-0.5 rounded-full">
                            {product.material}
                          </span>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            )) : (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-64 rounded-2xl" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-slate-surface/30">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader
              label="לקוחות מרוצים"
              title="מה אומרים"
              titleHighlight="עלינו?"
              subtitle="הלקוחות שלנו הם השגרירים הכי טובים שלנו"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  viewport={{ once: true }}
                >
                  <GlassCard className="p-6 flex flex-col gap-4 h-full">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-gold fill-gold" />
                      ))}
                    </div>
                    <p className="text-beige-muted text-sm leading-relaxed flex-1">&ldquo;{t.content}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-slate-canvas font-bold font-num">
                        {t.author_avatar_init || t.author_name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-beige text-sm">{t.author_name}</div>
                        {t.author_info && <div className="text-beige-muted text-xs">{t.author_info}</div>}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BLOG ── */}
      {posts.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <SectionHeader
                centered={false}
                label="בלוג"
                title="מהחדש"
                titleHighlight="בבלוג"
                subtitle="עדכונים, טיפים וסיפורים מעניינים מעולם התלת-מימד"
              />
              <Link href="/blog">
                <GoldButton variant="secondary" size="sm">
                  לכל הכתבות <ChevronLeft className="w-4 h-4" />
                </GoldButton>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <GlassCard className="overflow-hidden group cursor-pointer h-full flex flex-col">
                      <div className="h-44 bg-slate-surface overflow-hidden">
                        <img
                          src={post.cover_image || '/images/blog-fallback.jpg'}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        {post.tags && post.tags.length > 0 && (
                          <span className="text-xs text-gold/80 mb-2">{post.tags[0]}</span>
                        )}
                        <h3 className="font-semibold text-beige mb-2 line-clamp-2">{post.title}</h3>
                        {post.excerpt && (
                          <p className="text-beige-muted text-sm line-clamp-2 flex-1">{post.excerpt}</p>
                        )}
                        <div className="text-beige-dim text-xs mt-3 font-num">{formatDateHe(post.created_at)}</div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <GlassCard variant="gold" className="p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-40" />
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-gold mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-beige mb-4">
                מוכן להפוך את הרעיון{' '}
                <span className="gradient-text">למציאות?</span>
              </h2>
              <p className="text-beige-muted text-lg mb-8 max-w-xl mx-auto">
                שלח לנו את הקובץ שלך ותקבל הצעת מחיר מדויקת תוך דקות.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/quote">
                  <GoldButton size="lg">
                    קבל הצעת מחיר חינם
                  </GoldButton>
                </Link>
                <Link href="/contact">
                  <GoldButton size="lg" variant="ghost">
                    דבר עם מומחה
                  </GoldButton>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </>
  )
}
