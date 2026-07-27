'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { Box, Lock, Mail } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const sb = createClient()
    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) {
      setError('אימייל או סיסמה שגויים')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-canvas flex items-center justify-center px-4" dir="rtl">
      {/* Background orbs */}
      <div className="fixed top-1/3 right-1/3 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 left-1/3 w-64 h-64 bg-cyber-violet/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto mb-4 shadow-gold-md">
            <Box className="w-8 h-8 text-slate-canvas" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-beige">Modela <span className="gradient-text">OS</span></h1>
          <p className="text-beige-muted text-sm mt-1">כניסת מנהל</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-beige-muted mb-1.5">אימייל</label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full glass rounded-xl pr-10 pl-4 py-3 text-beige placeholder-beige-dim outline-none focus:border-gold/40 transition-all bg-transparent"
                  placeholder="admin@modela.co.il"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-beige-muted mb-1.5">סיסמה</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full glass rounded-xl pr-10 pl-4 py-3 text-beige placeholder-beige-dim outline-none focus:border-gold/40 transition-all bg-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-status-danger bg-status-danger/10 border border-status-danger/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <GoldButton type="submit" size="lg" loading={loading} className="w-full">
              <Lock className="w-4 h-4" /> כניסה
            </GoldButton>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
