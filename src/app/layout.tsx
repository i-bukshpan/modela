import type { Metadata } from 'next'
import './globals.css'
import { ClientLayoutWrapper } from '@/components/layout/ClientLayoutWrapper'

export const metadata: Metadata = {
  title: {
    default: 'מודלה — הדפסת תלת מימד',
    template: '%s | מודלה',
  },
  description: 'מודלה — סטודיו יצירתי להדפסת תלת מימד. מדמיון למציאות תלת-ממדית. מוצרים בהתאמה אישית, אב טיפוס, מתנות ועוד.',
  keywords: ['הדפסת תלת מימד', '3D printing', 'מודלה', 'Modela', 'STL', 'מידול תלת מימד', 'אב טיפוס'],
  openGraph: {
    siteName: 'מודלה',
    locale: 'he_IL',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-canvas text-beige antialiased">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  )
}
