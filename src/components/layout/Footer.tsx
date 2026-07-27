import Link from 'next/link'
import { Box, Camera, Share2, Send, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/10 bg-slate-canvas">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <Box className="w-5 h-5 text-slate-canvas" strokeWidth={2.5} />
              </div>
              <span className="font-brand font-bold text-xl text-beige">
                modela<span className="text-gold">.</span>
              </span>
            </Link>
            <p className="text-beige-muted text-sm leading-relaxed mb-4">
              סטודיו יצירתי להדפסת תלת מימד. מדמיון למציאות תלת-ממדית — בדיוק מרבי ובחומרים איכותיים.
            </p>
            <div className="flex gap-2">
              {[Camera, Share2].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-beige-muted hover:text-gold hover:border-gold/30 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
              <a href="https://wa.me/972500000000" target="_blank" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-beige-muted hover:text-green-400 hover:border-green-400/30 transition-all">
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-beige font-semibold mb-4">ניווט מהיר</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'דף הבית' },
                { href: '/gallery', label: 'הגלריה שלנו' },
                { href: '/about', label: 'אודות מודלה' },
                { href: '/blog', label: 'בלוג ומאמרים' },
                { href: '/quote', label: 'קבל הצעת מחיר' },
                { href: '/contact', label: 'צור קשר' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-beige-muted text-sm hover:text-gold transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-beige font-semibold mb-4">שירותים</h4>
            <ul className="space-y-2.5">
              {[
                'הדפסת PLA / PETG',
                'הדפסת שרף (Resin)',
                'מידול תלת-מימדי',
                'אבות טיפוס',
                'מתנות מותאמות אישית',
                'פתרונות רפואיים',
              ].map((s) => (
                <li key={s} className="text-beige-muted text-sm">{s}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-beige font-semibold mb-4">צור קשר</h4>
            <ul className="space-y-3">
              {[
                { icon: Phone, text: '050-0000000', href: 'tel:+972500000000' },
                { icon: Mail, text: 'info@modela3d.co.il', href: 'mailto:info@modela3d.co.il' },
                { icon: MapPin, text: 'ביתר עילית', href: '#' },
              ].map(({ icon: Icon, text, href }) => (
                <li key={text}>
                  <a href={href} className="flex items-center gap-2.5 text-beige-muted text-sm hover:text-gold transition-colors">
                    <Icon className="w-4 h-4 text-gold/60 flex-shrink-0" />
                    {text}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/972500000000"
              target="_blank"
              className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all"
            >
              <Send className="w-4 h-4" />
              שלח הודעה ב-WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-beige-dim">
          <span>© {year} מודלה — כל הזכויות שמורות</span>
          <Link href="/admin" className="hover:text-gold transition-colors opacity-50 hover:opacity-100">
            כניסת מנהל
          </Link>
        </div>
      </div>
    </footer>
  )
}
