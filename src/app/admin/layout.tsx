import { AdminSidebar } from '@/components/layout/AdminSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Modela OS — Admin Dashboard' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-canvas flex" dir="rtl">
      <AdminSidebar />
      <main className="flex-1 md:mr-56 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  )
}
