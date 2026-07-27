'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { SectionHeader } from '@/components/ui/StatCard'
import { Send, Phone, Mail, MapPin, Check, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const sb = createClient()
    await sb.from('contact_messages').insert({ ...form, status: 'new' })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <SectionHeader
        label="צור קשר"
        title="בואו"
        titleHighlight="נדבר!"
        subtitle="מוזמנים לפנות אלינו בכל שאלה, בקשה להצעת מחיר, או לשיתוף פעולה"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          {sent ? (
            <GlassCard variant="gold" className="p-10 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <Check className="w-16 h-16 text-status-success mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-beige mb-2">ההודעה נשלחה!</h3>
              <p className="text-beige-muted">נחזור אליך בהקדם האפשרי.</p>
            </GlassCard>
          ) : (
            <GlassCard className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { key: 'name', label: 'שם מלא *', required: true, type: 'text' },
                    { key: 'email', label: 'אימייל *', required: true, type: 'email' },
                    { key: 'phone', label: 'טלפון', required: false, type: 'tel' },
                    { key: 'subject', label: 'נושא', required: false, type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-sm text-beige-muted mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        required={f.required}
                        value={form[f.key as keyof typeof form]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full glass rounded-xl px-4 py-3 text-beige placeholder-beige-dim outline-none focus:border-gold/40 transition-all bg-transparent"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm text-beige-muted mb-1.5">תוכן ההודעה *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="ספרו לנו על הפרויקט שלכם..."
                    className="w-full glass rounded-xl px-4 py-3 text-beige placeholder-beige-dim outline-none focus:border-gold/40 transition-all bg-transparent resize-none"
                  />
                </div>
                <GoldButton type="submit" size="lg" loading={loading} className="w-full">
                  <Send className="w-5 h-5" /> שלח הודעה
                </GoldButton>
              </form>
            </GlassCard>
          )}
        </div>

        {/* Contact info */}
        <div className="lg:col-span-2 space-y-4">
          {[
            { icon: Phone, label: 'טלפון', value: '050-0000000', href: 'tel:+972500000000', color: 'text-gold' },
            { icon: Mail, label: 'אימייל', value: 'info@modela3d.co.il', href: 'mailto:info@modela3d.co.il', color: 'text-gold' },
            { icon: MapPin, label: 'כתובת', value: 'ביתר עילית', href: '#', color: 'text-gold' },
          ].map(({ icon: Icon, label, value, href, color }) => (
            <a key={label} href={href}>
              <GlassCard className="p-5 flex items-center gap-4 hover:border-gold/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <div className="text-xs text-beige-muted mb-0.5">{label}</div>
                  <div className="font-medium text-beige">{value}</div>
                </div>
              </GlassCard>
            </a>
          ))}

          {/* WhatsApp CTA */}
          <a href="https://wa.me/972500000000" target="_blank">
            <GlassCard className="p-5 bg-green-500/5 border-green-500/20 hover:bg-green-500/10 transition-all text-center">
              <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="font-semibold text-green-400 mb-1">שלח ב-WhatsApp</div>
              <div className="text-xs text-beige-muted">לשליחת קבצים מהירה ושאלות דחופות</div>
            </GlassCard>
          </a>
        </div>
      </div>
    </div>
  )
}
