'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import * as THREE from 'three'
import { parseSTL, estimatePrintParameters } from '@/lib/stl'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { Upload, Calculator, Save, ChevronRight, Check, Trash2 } from 'lucide-react'
import { calculatePrintCost, MATERIAL_DENSITY } from '@/lib/utils'
import { processImageFiles } from '@/lib/imageUtils'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Product data
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    material: 'PLA',
    infill: 20,
    layerHeight: 0.20,
    featured: false
  })

  const [models, setModels] = useState<any[]>([])
  const [stlFileObjs, setStlFileObjs] = useState<File[]>([])
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [preset, setPreset] = useState<any>(null)

  useEffect(() => {
    async function loadPreset() {
      const sb = createClient()
      const { data, error } = await sb.from('cost_presets').select('*').eq('is_default', true).maybeSingle()
      if (data) setPreset(data)
      else if (error) console.error("Error loading preset:", error)
      else {
        setPreset({
          printer_wattage: 200, electricity_kwh_rate: 0.65, hourly_labor_rate: 60,
          failure_margin_pct: 10, default_profit_margin: 30
        })
      }
    }
    loadPreset()
  }, [])


  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const processed = await processImageFiles(files)
    setGalleryFiles(processed)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    setLoading(true)
    try {
      const newModels: any[] = []
      const newFiles: File[] = []
      for (const file of acceptedFiles) {
        const data = await parseSTL(file)
        newModels.push(data)
        newFiles.push(file)
      }
      setModels(prev => [...prev, ...newModels])
      setStlFileObjs(prev => [...prev, ...newFiles])
    } catch (e) {
      alert('שגיאה בניתוח אחד או יותר מהקבצים')
    }
    setLoading(false)
  }, [])

  const removeStl = (index: number) => {
    setModels(prev => prev.filter((_, i) => i !== index))
    setStlFileObjs(prev => prev.filter((_, i) => i !== index))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'model/stl': ['.stl'] }, maxFiles: 0 })

  const density = MATERIAL_DENSITY[form.material] || 1.24
  const totalVolume = models.reduce((acc, m) => acc + m.volume_cm3, 0)
  const totalSurface = models.reduce((acc, m) => acc + (m.surface_cm2 || 0), 0)

  const estimated = models.length > 0 
    ? estimatePrintParameters(totalVolume, totalSurface, form.infill, form.layerHeight, density)
    : { estimated_weight_g: 0, estimated_print_time_hours: 0 }
    
  const weight_g = estimated.estimated_weight_g
  const printTimeHours = estimated.estimated_print_time_hours

  let calc = null
  if (preset && models.length > 0) {
    calc = calculatePrintCost({
      filament_cost_per_kg: 85, // Could be dynamic based on material later
      material_weight_g: weight_g,
      printer_wattage: preset.printer_wattage,
      electricity_kwh_rate: preset.electricity_kwh_rate,
      print_time_hours: printTimeHours,
      hourly_labor_rate: preset.hourly_labor_rate,
      failure_margin_pct: preset.failure_margin_pct,
      profit_margin_pct: preset.default_profit_margin,
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const sb = createClient()
    
    let coverImageUrl = null
    const uploadedMediaUrls: string[] = []

    if (galleryFiles.length > 0) {
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i]
        const ext = file.name.split('.').pop()
        const fileName = `media-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
        const { data: imgData } = await sb.storage.from('products').upload(fileName, file)
        if (imgData) {
          const { data: publicUrlData } = sb.storage.from('products').getPublicUrl(fileName)
          if (i === 0) coverImageUrl = publicUrlData.publicUrl
          uploadedMediaUrls.push(publicUrlData.publicUrl)
        }
      }
    }

    // Save to products table
    const { data: product, error } = await sb.from('products').insert([{
      title: form.title,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      featured: form.featured,
      material: form.material,
      infill_percent: form.infill,
      layer_height_mm: form.layerHeight,
      material_weight_g: weight_g,
      print_time_min: Math.round(printTimeHours * 60),
      estimated_cost: calc ? calc.total_cost : null,
      cover_image: coverImageUrl
    }]).select().single()

    if (error) {
      alert('שגיאה בשמירת המוצר')
      setSaving(false)
      return
    }

    if (uploadedMediaUrls.length > 1) {
      const mediaInserts = uploadedMediaUrls.slice(1).map((url, idx) => ({
        product_id: product.id,
        url: url,
        type: 'image',
        sort_order: idx + 1
      }))
      await sb.from('product_media').insert(mediaInserts)
    }

    if (models.length > 0 && stlFileObjs.length > 0) {
      for (let i = 0; i < stlFileObjs.length; i++) {
        const file = stlFileObjs[i]
        const m = models[i]
        const ext = file.name.split('.').pop()
        const fileName = `stl-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
        const { data: uploadData } = await sb.storage.from('products').upload(fileName, file)
        
        let stlFileUrl = 'uploaded_via_admin'
        if (uploadData) {
          const { data: publicUrlData } = sb.storage.from('products').getPublicUrl(fileName)
          stlFileUrl = publicUrlData.publicUrl
        }

        await sb.from('product_files').insert([{
          product_id: product.id,
          filename: m.filename,
          file_url: stlFileUrl,
          mesh_volume_cm3: m.volume_cm3,
          bounding_x_mm: m.bounding_x,
          bounding_y_mm: m.bounding_y,
          bounding_z_mm: m.bounding_z,
          file_type: 'stl'
        }])
      }
    }

    router.push('/admin/products')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4 text-beige-muted">
        <Link href="/admin/products" className="hover:text-beige transition-colors">מוצרים</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-beige font-semibold">הוספת מוצר חדש</span>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col - Product Info */}
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-semibold text-beige text-lg mb-2">פרטי המוצר</h3>
            <div>
              <label className="block text-sm text-beige-muted mb-1">שם המוצר</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-sm text-beige-muted mb-1">מזהה (Slug)</label>
              <input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-sm text-beige-muted mb-1">תיאור</label>
              <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-sm text-beige-muted mb-1">תמונות מוצר (ניתן לבחור מספר קבצים)</label>
              <input type="file" multiple accept="image/*,.heic" onChange={handleGalleryChange} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/20 file:text-gold hover:file:bg-gold/30" />
              {galleryFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {galleryFiles.map((f, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                      <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                      {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-gold/90 text-black text-[10px] text-center font-bold">ראשי</div>}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                <input 
                  type="checkbox" 
                  id="featured"
                  checked={form.featured} 
                  onChange={e => setForm({...form, featured: e.target.checked})} 
                  className="w-5 h-5 accent-gold" 
                />
                <label htmlFor="featured" className="text-sm text-beige font-medium">הצג ב'פרויקטים נבחרים' בעמוד הראשי</label>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-semibold text-beige text-lg mb-4">העלאת קובץ להערכת מחיר</h3>
            <div {...getRootProps()} className={`p-8 text-center cursor-pointer transition-all glass rounded-2xl border ${isDragActive ? 'border-gold/60 bg-gold/5' : 'border-white/10 hover:border-gold/30'}`}>
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="text-beige font-semibold mb-2">{loading ? 'מנתח...' : 'גרור קבצי STL לכאן'}</h3>
            </div>
            {models.length > 0 && (
              <div className="mt-4 space-y-2">
                {models.map((m, idx) => (
                  <div key={idx} className="text-xs flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 text-status-success">
                      <Check className="w-3.5 h-3.5" /> 
                      <span className="truncate max-w-[200px]">{m.filename}</span>
                      <span className="text-beige-muted">({m.volume_cm3} cm³)</span>
                    </div>
                    <button type="button" onClick={() => removeStl(idx)} className="text-status-danger hover:text-red-400 p-1 bg-status-danger/10 rounded transition-colors" title="מחק קובץ">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Col - Calc & Price */}
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-semibold text-beige text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-gold" /> חישוב עלות ותמחור
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-beige-muted mb-1">חומר</label>
                <select value={form.material} onChange={e=>setForm({...form, material: e.target.value})} className="w-full glass rounded-lg px-2 py-2 text-sm text-beige outline-none [&>option]:bg-slate-900">
                  <option value="PLA">PLA</option>
                  <option value="PETG">PETG</option>
                  <option value="TPU">TPU</option>
                  <option value="ABS">ABS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-beige-muted mb-1">מילוי (%)</label>
                <input type="number" value={form.infill} onChange={e=>setForm({...form, infill: +e.target.value})} className="w-full glass rounded-lg px-2 py-2 text-sm text-beige outline-none" />
              </div>
              <div>
                <label className="block text-xs text-beige-muted mb-1">גובה שכבה</label>
                <input type="number" step="0.04" value={form.layerHeight} onChange={e=>setForm({...form, layerHeight: +e.target.value})} className="w-full glass rounded-lg px-2 py-2 text-sm text-beige outline-none" />
              </div>
            </div>

            {calc && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-beige-muted">עלות חומר פועל</span><span className="font-num text-beige">₪{calc.material_cost}</span></div>
                <div className="flex justify-between"><span className="text-beige-muted">עלות חשמל פועל</span><span className="font-num text-beige">₪{calc.electricity_cost}</span></div>
                <div className="flex justify-between"><span className="text-beige-muted">עלות עבודה</span><span className="font-num text-beige">₪{calc.labor_cost}</span></div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-beige">עלות כוללת (טרום רווח)</span><span className="font-num text-status-warning">₪{calc.total_cost}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="text-gold font-bold">מחיר מומלץ ללקוח (לפי הגדרות)</span><span className="font-num text-gold font-bold text-lg">₪{calc.suggested_price}</span>
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <label className="block text-sm text-beige mb-2 font-semibold">מחיר סופי בחנות (₪)</label>
              <input required type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full glass-gold rounded-xl px-4 py-3 text-gold text-lg font-bold outline-none border border-gold/30 focus:border-gold" placeholder="למשל: 149.90" />
            </div>
          </GlassCard>

          <GoldButton type="submit" disabled={saving} className="w-full h-12 text-lg">
            {saving ? 'שומר במערכת...' : 'הוסף מוצר לקטלוג'}
          </GoldButton>
        </div>
      </form>
    </div>
  )
}
