'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PrintJob, Filament } from '@/types/database'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/StatCard'
import { formatPrice, formatDateHe, JOB_STATUS_LABELS, JOB_STATUS_COLORS } from '@/lib/utils'
import { ChevronRight, ChevronLeft, X, User, Mail, Phone, Box, Layers } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUSES = [
  'pending_quote', 'quoted', 'in_queue', 'printing', 'post_processing', 'ready', 'shipped', 'cancelled'
] as const

export default function JobsPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([])
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [printers, setPrinters] = useState<{id: string, name: string, status: string}[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selected, setSelected] = useState<PrintJob | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newJob, setNewJob] = useState({
    customer_name: '',
    customer_phone: '',
    material_requested: 'PLA',
    quoted_price: '',
    notes: ''
  })
  const [newJobFile, setNewJobFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    const sb = createClient()
    const [{ data: j }, { data: f }, { data: p }] = await Promise.all([
      sb.from('print_jobs').select('*,filament:filaments(brand,color_name,color_hex),printer:printers(id,name)').order('created_at', { ascending: false }),
      sb.from('filaments').select('*').eq('is_active', true),
      sb.from('printers').select('*').eq('status', 'active')
    ])
    setJobs((j || []) as PrintJob[])
    setFilaments((f || []) as Filament[])
    setPrinters((p || []) as {id: string, name: string, status: string}[])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const advanceStatus = async (job: PrintJob) => {
    const idx = STATUSES.indexOf(job.status as any)
    if (idx >= STATUSES.length - 1) return
    const nextStatus = STATUSES[idx + 1]
    await changeJobStatus(job, nextStatus)
  }

  const revertStatus = async (job: PrintJob) => {
    const idx = STATUSES.indexOf(job.status as any)
    if (idx <= 0) return
    const prevStatus = STATUSES[idx - 1]
    await changeJobStatus(job, prevStatus)
  }

  const changeJobStatus = async (job: PrintJob, targetStatus: string) => {
    if (job.status === targetStatus) return
    const sb = createClient()
    await sb.from('print_jobs').update({ status: targetStatus, updated_at: new Date().toISOString() }).eq('id', job.id)

    // Auto-deduct filament when marked as printing → post_processing
    if (targetStatus === 'post_processing' && job.status !== 'post_processing' && job.filament_id && job.estimated_weight_g) {
      await sb.rpc('deduct_filament_weight', { f_id: job.filament_id, weight_g: job.estimated_weight_g })
    }

    fetchData()
    if (selected?.id === job.id) setSelected({ ...selected, status: targetStatus as any })
  }

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData('jobId', jobId)
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    const jobId = e.dataTransfer.getData('jobId')
    if (!jobId) return
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      await changeJobStatus(job, targetStatus)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }



  const cancelJob = async (job: PrintJob) => {
    const sb = createClient()
    await sb.from('print_jobs').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', job.id)
    fetchData()
    setSelected(null)
  }

  const deleteJob = async (job: PrintJob) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק עבודה זו לחלוטין? פעולה זו אינה הפיכה.')) return
    const sb = createClient()
    await sb.from('print_jobs').delete().eq('id', job.id)
    fetchData()
    setSelected(null)
  }

  const updateJobField = async (id: string, field: string, value: any) => {
    const sb = createClient()
    await sb.from('print_jobs').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', id)
    fetchData()
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const sb = createClient()
    
    let uploadedFileUrl = null
    let originalFilename = null
    if (newJobFile) {
      const ext = newJobFile.name.split('.').pop()
      const fileName = `manual-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { data: uploadData } = await sb.storage.from('products').upload(`quotes/${fileName}`, newJobFile)
      if (uploadData) {
        const { data: publicUrlData } = sb.storage.from('products').getPublicUrl(`quotes/${fileName}`)
        uploadedFileUrl = publicUrlData.publicUrl
        originalFilename = newJobFile.name
      }
    }

    await sb.from('print_jobs').insert([{
      customer_name: newJob.customer_name,
      customer_phone: newJob.customer_phone || null,
      material_requested: newJob.material_requested,
      quoted_price: newJob.quoted_price ? Number(newJob.quoted_price) : null,
      notes: newJob.notes || null,
      uploaded_file_url: uploadedFileUrl,
      original_filename: originalFilename,
      status: 'in_queue'
    }])
    setSaving(false)
    setShowNew(false)
    setNewJob({ customer_name: '', customer_phone: '', material_requested: 'PLA', quoted_price: '', notes: '' })
    setNewJobFile(null)
    fetchData()
  }

  const jobsByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = jobs.filter(j => j.status === s)
    return acc
  }, {} as Record<string, PrintJob[]>)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-beige">תור הדפסות</h1>
          <p className="text-beige-muted text-sm mt-1">{jobs.length} עבודות סה"כ</p>
        </div>
        <GoldButton onClick={() => setShowNew(true)}>
          + הוסף עבודה ידנית
        </GoldButton>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-3">
          {STATUSES.map(s => <Skeleton key={s} className="h-96" />)}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STATUSES.map(status => (
            <div key={status} className="flex-shrink-0 w-52">
              {/* Column header */}
              <div className={`mb-3 px-3 py-2 rounded-xl text-xs font-semibold text-center border ${JOB_STATUS_COLORS[status]}`}>
                {JOB_STATUS_LABELS[status]}
                <span className="mr-1.5 opacity-70 font-num">({jobsByStatus[status]?.length || 0})</span>
              </div>

              {/* Cards */}
              <div 
                className="space-y-2 min-h-[150px] rounded-xl transition-colors border border-transparent hover:border-white/5 pb-10"
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, status)}
              >
                {(jobsByStatus[status] || []).map(job => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    draggable
                    onDragStart={e => handleDragStart(e as unknown as React.DragEvent, job.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <GlassCard
                      className="p-3 cursor-pointer hover:border-gold/25"
                      onClick={() => setSelected(job)}
                    >
                      <div className="font-medium text-beige text-sm mb-1 truncate">{job.customer_name}</div>
                      {job.material_requested && (
                        <div className="text-xs text-beige-muted mb-1">{job.material_requested}</div>
                      )}
                      {job.quoted_price && (
                        <div className="text-xs text-gold font-bold font-num">₪{job.quoted_price}</div>
                      )}
                      <div className="text-xs text-beige-dim font-num mt-1">{formatDateHe(job.created_at)}</div>

                      <div className="flex gap-2">
                        {STATUSES.indexOf(status as any) > 0 && STATUSES.indexOf(status as any) < STATUSES.length - 1 && (
                          <button
                            onClick={e => { e.stopPropagation(); revertStatus(job) }}
                            className="mt-2 flex-1 py-1 rounded-lg glass text-xs text-beige-muted hover:text-beige hover:bg-white/5 transition-all flex items-center justify-center gap-1"
                          >
                            <ChevronRight className="w-3 h-3" />
                            אחורה
                          </button>
                        )}
                        {STATUSES.indexOf(status as any) < STATUSES.length - 1 && (
                          <button
                            onClick={e => { e.stopPropagation(); advanceStatus(job) }}
                            className="mt-2 flex-1 py-1 rounded-lg glass text-xs text-gold hover:bg-gold/10 transition-all flex items-center justify-center gap-1"
                          >
                            <ChevronLeft className="w-3 h-3" />
                            {JOB_STATUS_LABELS[STATUSES[STATUSES.indexOf(status as any) + 1]]}
                          </button>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <GlassCard className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-beige">פרטי עבודה</h3>
              <button onClick={() => setSelected(null)} className="text-beige-muted hover:text-beige">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                
                {STATUSES.indexOf(selected.status as any) > 0 && STATUSES.indexOf(selected.status as any) < STATUSES.length - 1 && (
                  <button onClick={() => revertStatus(selected)} className="text-xs text-beige-muted hover:text-beige hover:bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5" />
                    החזר אחורה
                  </button>
                )}

                {STATUSES.indexOf(selected.status as any) >= 0 && STATUSES.indexOf(selected.status as any) < STATUSES.length - 2 && (
                  <GoldButton size="sm" onClick={() => advanceStatus(selected)}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                    קדם לשלב הבא
                  </GoldButton>
                )}
                {selected.status !== 'cancelled' && (
                  <button onClick={() => cancelJob(selected)} className="text-xs text-status-danger hover:bg-status-danger/10 px-3 py-1.5 rounded-lg border border-status-danger/20 transition-colors">
                    ביטול עבודה
                  </button>
                )}
              </div>

              {/* Customer */}
              <GlassCard className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gold" />
                  <span className="text-beige font-medium">{selected.customer_name}</span>
                </div>
                {selected.customer_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gold/70" />
                    <a href={`mailto:${selected.customer_email}`} className="text-beige-muted hover:text-gold">{selected.customer_email}</a>
                  </div>
                )}
                {selected.customer_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gold/70" />
                    <a href={`tel:${selected.customer_phone}`} className="text-beige-muted hover:text-gold">{selected.customer_phone}</a>
                  </div>
                )}
              </GlassCard>

              {/* Print specs */}
              <GlassCard className="p-4">
                <h4 className="text-sm font-semibold text-beige mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gold" /> מפרט הדפסה
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['חומר', selected.material_requested],
                    ['מילוי', selected.infill_percent ? `${selected.infill_percent}%` : null],
                    ['שכבה', selected.layer_height_mm ? `${selected.layer_height_mm}mm` : null],
                    ['משקל', selected.estimated_weight_g ? `${selected.estimated_weight_g}g` : null],
                    ['נפח', selected.calculated_volume_cm3 ? `${selected.calculated_volume_cm3}cm³` : null],
                    ['זמן', selected.estimated_print_time_min ? `${Math.round(selected.estimated_print_time_min / 60)}h` : null],
                  ].filter(([_, v]) => v).map(([label, val]) => (
                    <div key={label as string} className="flex justify-between">
                      <span className="text-beige-muted">{label}</span>
                      <span className="text-beige font-num">{val}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Assign filament */}
              <div>
                <label className="block text-xs text-beige-muted mb-1.5">הקצה ספול חוט</label>
                <select
                  value={selected.filament_id || ''}
                  onChange={e => { updateJobField(selected.id, 'filament_id', e.target.value || null); setSelected({ ...selected, filament_id: e.target.value || null }) }}
                  className="w-full glass rounded-xl px-3 py-2 text-sm text-beige bg-slate-card outline-none"
                >
                  <option value="">-- ללא --</option>
                  {filaments.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.brand} · {f.color_name} ({f.material}) — {f.remaining_weight_g}g נותר
                    </option>
                  ))}
                </select>
              </div>

              {/* Assign printer */}
              <div>
                <label className="block text-xs text-beige-muted mb-1.5">מדפסת מוקצית</label>
                <select
                  value={selected.printer_id || ''}
                  onChange={e => { updateJobField(selected.id, 'printer_id', e.target.value || null); setSelected({ ...selected, printer_id: e.target.value || null }) }}
                  className="w-full glass rounded-xl px-3 py-2 text-sm text-beige bg-slate-card outline-none"
                >
                  <option value="">-- ללא מוקצית --</option>
                  {printers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Quoted price */}
              <div>
                <label className="block text-xs text-beige-muted mb-1.5">מחיר מוצע (₪)</label>
                <input
                  type="number"
                  value={selected.quoted_price || ''}
                  onChange={e => updateJobField(selected.id, 'quoted_price', +e.target.value)}
                  className="w-full glass rounded-xl px-3 py-2 text-sm text-beige bg-transparent outline-none font-num"
                />
              </div>

              {/* Files */}
              {(selected.uploaded_file_url || selected.product_id) && (
                <GlassCard className="p-4">
                  <h4 className="text-sm font-semibold text-beige mb-3 flex items-center gap-2">
                    <Box className="w-4 h-4 text-gold" /> קבצים מקושרים
                  </h4>
                  {selected.uploaded_file_url && (
                    <a href={selected.uploaded_file_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="text-sm text-beige truncate pr-2" dir="ltr">{selected.original_filename || 'קובץ מצורף'}</div>
                      <div className="text-xs text-gold px-2">הורד</div>
                    </a>
                  )}
                  {selected.product_id && (
                    <div className="text-xs text-beige-muted mt-2">
                      עבודה זו מקושרת למוצר בקטלוג. יש לבדוק את קובץ המקור בעמוד המוצר.
                    </div>
                  )}
                </GlassCard>
              )}

              {selected.notes && (
                <div className="text-sm text-beige-muted bg-white/5 rounded-xl p-3">{selected.notes}</div>
              )}
              
              <div className="pt-4 border-t border-white/10 text-left">
                <button onClick={() => deleteJob(selected)} className="text-sm text-status-danger hover:underline">
                  מחק עבודה לצמיתות
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* New Job Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowNew(false)}>
          <GlassCard className="w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-beige">עבודה חדשה</h3>
              <button onClick={() => setShowNew(false)} className="text-beige-muted hover:text-beige">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs text-beige-muted mb-1">שם הלקוח *</label>
                <input required value={newJob.customer_name} onChange={e => setNewJob({...newJob, customer_name: e.target.value})} className="w-full glass rounded-xl px-3 py-2 text-sm text-beige outline-none border border-white/10" />
              </div>
              <div>
                <label className="block text-xs text-beige-muted mb-1">טלפון</label>
                <input value={newJob.customer_phone} onChange={e => setNewJob({...newJob, customer_phone: e.target.value})} className="w-full glass rounded-xl px-3 py-2 text-sm text-beige outline-none border border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-beige-muted mb-1">חומר מבוקש</label>
                  <select value={newJob.material_requested} onChange={e => setNewJob({...newJob, material_requested: e.target.value})} className="w-full glass rounded-xl px-3 py-2 text-sm text-beige outline-none border border-white/10 [&>option]:bg-slate-900">
                    <option value="PLA">PLA</option>
                    <option value="PETG">PETG</option>
                    <option value="TPU">TPU</option>
                    <option value="ABS">ABS</option>
                    <option value="Resin">Resin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-beige-muted mb-1">הצעת מחיר (₪)</label>
                  <input type="number" value={newJob.quoted_price} onChange={e => setNewJob({...newJob, quoted_price: e.target.value})} className="w-full glass rounded-xl px-3 py-2 text-sm text-beige outline-none border border-white/10 font-num" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-beige-muted mb-1">הערות</label>
                <textarea rows={2} value={newJob.notes} onChange={e => setNewJob({...newJob, notes: e.target.value})} className="w-full glass rounded-xl px-3 py-2 text-sm text-beige outline-none border border-white/10 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-beige-muted mb-1">קובץ הדפסה (STL/OBJ/ZIP)</label>
                <input type="file" accept=".stl,.obj,.zip" onChange={e => setNewJobFile(e.target.files?.[0] || null)} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/20 file:text-gold hover:file:bg-gold/30" />
              </div>
              <GoldButton type="submit" loading={saving} className="w-full mt-2">
                צור עבודה
              </GoldButton>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
