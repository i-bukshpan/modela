import type { Metadata } from 'next'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionHeader } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import {
  Box, Zap, Shield, Award, Heart, Target, Users, Package
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'אודות מודלה — סטודיו הדפסת תלת מימד',
  description: 'הכירו את מודלה — הסטודיו המוביל להדפסת תלת מימד בישראל. הסיפור שלנו, הערכים שלנו, והצוות שמאחורי המוצרים.',
}

const TEAM = [
  { name: 'צוות מודלה', role: 'מעצבים ויוצרים', initial: 'מ', desc: 'אנחנו קבוצת יוצרים נלהבים שאוהבים להפוך רעיונות למוצרים מוחשיים.' },
]

const VALUES = [
  { icon: Target, title: 'דיוק מקסימלי', desc: 'כל הדפסה עוברת בקרת איכות קפדנית כדי להבטיח תוצאה מושלמת.' },
  { icon: Heart, title: 'אהבה למלאכה', desc: 'אנחנו לא רק מדפיסים — אנחנו יוצרים. כל פרויקט מקבל יחס אישי.' },
  { icon: Shield, title: 'חומרים איכותיים', desc: 'אנחנו עובדים רק עם פילמנטים ושרפים ממותגים מובילים בעולם.' },
  { icon: Zap, title: 'מהירות ויעילות', desc: 'עם טכנולוגיה מתקדמת, אנחנו מספקים זמן תגובה מהיר ואמין.' },
]

const MATERIALS_LIST = [
  { name: 'PLA', desc: 'קל להדפסה, ידידותי לסביבה, מגוון צבעים' },
  { name: 'PETG', desc: 'חזק, עמיד בטמפרטורות, מתאים לחלקים תפקודיים' },
  { name: 'TPU', desc: 'גמיש ועמיד, מתאים לרצועות ומוצרי לבישה' },
  { name: 'ABS', desc: 'עמיד, קל לעיבוד לאחר הדפסה, לחלקים מכניים' },
  { name: 'Resin', desc: 'רמת דיוק גבוהה במיוחד, מתאים לפיגורינות ותכשיטים' },
  { name: 'PLA-CF', desc: 'פחמן מחוזק — חזק מאוד עם משקל נמוך' },
]

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass-gold rounded-full text-gold text-sm font-semibold border border-gold/20">
          <Award className="w-4 h-4" />
          הסיפור שלנו
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-beige leading-tight mb-6">
          מודלה —{' '}
          <span className="gradient-text">מעבירים רעיונות</span>
          <br />
          אל העולם התלת-ממדי
        </h1>
        <p className="text-beige-muted text-lg leading-relaxed">
          מודלה נוסדה מתוך אהבה טהורה לטכנולוגיה ויצירה. אנחנו מאמינים שכל אדם יכול להיות יוצר — וכל רעיון ראוי להתממש.
          מעבודות אב-טיפוס מורכבות ועד מתנות אישיות מרגשות, אנחנו כאן כדי להפוך את הדמיון שלכם למציאות מוחשית.
        </p>
      </section>

      {/* Values */}
      <section>
        <SectionHeader
          label="הערכים שלנו"
          title="מה מנחה"
          titleHighlight="אותנו?"
          subtitle="ארבעה עקרונות שעומדים בבסיס כל עבודה שאנחנו מבצעים"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map(({ icon: Icon, title, desc }, i) => (
            <GlassCard key={title} className="p-6 text-center" hover>
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto mb-4">
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-beige text-lg mb-2">{title}</h3>
              <p className="text-beige-muted text-sm leading-relaxed">{desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Materials */}
      <section>
        <SectionHeader
          label="חומרים"
          title="החומרים"
          titleHighlight="שאנחנו עובדים איתם"
          subtitle="אנחנו מחזיקים מגוון רחב של חומרי הדפסה כדי לתת מענה לכל צורך"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MATERIALS_LIST.map(({ name, desc }) => (
            <GlassCard key={name} className="p-4 text-center">
              <div className="font-brand font-bold text-2xl text-gold mb-2">{name}</div>
              <p className="text-beige-muted text-xs leading-relaxed">{desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <GlassCard variant="gold" className="p-12 max-w-2xl mx-auto">
          <Box className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-beige mb-4">מוכן להתחיל?</h2>
          <p className="text-beige-muted mb-6">שלח לנו את הקובץ שלך ותקבל הצעת מחיר מפורטת בתוך שעות.</p>
          <a href="/quote">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-dark to-gold rounded-full text-slate-canvas font-semibold hover:shadow-gold-md transition-all">
              קבל הצעת מחיר חינם
            </span>
          </a>
        </GlassCard>
      </section>
    </div>
  )
}
