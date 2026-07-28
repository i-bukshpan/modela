import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const unwrapped = await params
  const slug = decodeURIComponent(unwrapped.slug)
  const sb = await createClient()
  const { data } = await sb.from('products')
    .select('title,description,product_media(url,is_cover)')
    .eq('slug', slug)
    .single()
    
  if (!data) return {}
  
  const cover = data.product_media?.find((m: any) => m.is_cover) || data.product_media?.[0]
  
  return { 
    title: data.title, 
    description: data.description || undefined,
    openGraph: {
      title: data.title,
      description: data.description || undefined,
      images: cover ? [cover.url] : [],
    }
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children
}
