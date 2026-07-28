'use client'
import { Share2 } from 'lucide-react'

export function ShareButton({ title, text }: { title?: string, text?: string }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: window.location.href,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('הקישור הועתק ללוח!')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 hover:text-gold transition-colors"
    >
      <Share2 className="w-4 h-4" /> שיתוף
    </button>
  )
}
