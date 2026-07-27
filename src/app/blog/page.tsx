'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { BlogPost } from '@/types/database'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/StatCard'
import { SectionHeader } from '@/components/ui/StatCard'
import { formatDateHe } from '@/lib/utils'
import { BookOpen, Clock, Eye } from 'lucide-react'

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()
    sb.from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPosts((data || []) as BlogPost[])
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <SectionHeader
        label="הבלוג שלנו"
        title="עדכונים ומאמרים"
        titleHighlight="מעולם התלת-מימד"
        subtitle="טיפים, סיפורי הצלחה ועדכוני תעשייה"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 text-beige-muted">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">עדיין אין מאמרים פורסמו</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <GlassCard className="overflow-hidden group cursor-pointer h-full flex flex-col">
                  <div className="h-48 bg-slate-surface overflow-hidden">
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/10" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="gold" label={tag} />
                        ))}
                      </div>
                    )}
                    <h2 className="font-bold text-beige text-lg mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-beige-muted text-sm line-clamp-3 flex-1">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10 text-xs text-beige-dim">
                      <span className="flex items-center gap-1 font-num">
                        <Clock className="w-3 h-3" /> {formatDateHe(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1 font-num">
                        <Eye className="w-3 h-3" /> {post.view_count}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
