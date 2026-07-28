import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDateHe } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { BookOpen, Calendar, Eye } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const unwrapped = await params
  const slug = decodeURIComponent(unwrapped.slug)
  const sb = await createClient()
  const { data } = await sb.from('blog_posts').select('title,excerpt,cover_image').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: data.title,
    description: data.excerpt || undefined,
    openGraph: {
      title: data.title,
      description: data.excerpt || undefined,
      images: data.cover_image ? [data.cover_image] : []
    }
  }
}

export default async function BlogPostPage({ params }: Props) {
  const unwrapped = await params
  const slug = decodeURIComponent(unwrapped.slug)
  const sb = await createClient()
  const { data: post } = await sb
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return notFound()

  // Increment views (fire and forget)
  sb.rpc('increment_blog_view', { b_id: post.id })

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      {/* Cover */}
      {post.cover_image && (
        <div className="h-72 rounded-2xl overflow-hidden mb-8">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag: string) => <Badge key={tag} variant="gold" label={tag} />)}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-beige leading-tight mb-4">{post.title}</h1>

      {/* Meta */}
      <div className="flex items-center gap-5 text-sm text-beige-muted mb-8 pb-4 border-b border-white/10">
        <span className="flex items-center gap-1.5 font-num"><Calendar className="w-4 h-4" /> {formatDateHe(post.created_at)}</span>
        <span className="flex items-center gap-1.5 font-num"><Eye className="w-4 h-4" /> {post.view_count} צפיות</span>
      </div>

      {/* Content */}
      <div
        className="prose-modela"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}
