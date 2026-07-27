'use client'
import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { Upload, Calculator, Save, ChevronRight, Check } from 'lucide-react'
import { calculatePrintCost, MATERIAL_DENSITY } from '@/lib/utils'
import Link from 'next/link'

export default function EditProductPage() {
  const router = useRouter()
  const { id } = useParams()
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
    layerHeight: 0.20
  })

  const [model, setModel] = useState<any>(null)
  const [stlFileObj, setStlFileObj] = useState<File | null>(null)
  const [existingMedia, setExistingMedia] = useState<any[]>([])
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
    
    async function loadProduct() {
      if (!id) return
      const sb = createClient()
      const { data } = await sb.from('products').select('*').eq('id', id).single()
      if (data) {
        setForm({
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          price: data.price ? data.price.toString() : '',
          material: data.material || 'PLA',
          infill: data.infill_percent || 20,
          layerHeight: data.layer_height_mm || 0.20
        })
      }
      
      const { data: files } = await sb.from('product_files').select('*').eq('product_id', id)
      if (files && files.length > 0) {
        const stl = files.find(f => f.file_type === 'stl' || f.file_type === 'obj' || f.filename?.toLowerCase().endsWith('.stl'))
        if (stl) {
          setModel({
            filename: stl.filename,
            volume_cm3: stl.mesh_volume_cm3 || 0,
            bounding_x: stl.bounding_x_mm || 0,
            bounding_y: stl.bounding_y_mm || 0,
            bounding_z: stl.bounding_z_mm || 0,
          })
        }
      }
      const { data: mediaFiles } = await sb.from('product_media').select('*').eq('product_id', id).order('sort_order', { ascending: true })
      if (mediaFiles) {
        setExistingMedia(mediaFiles)
      }
    }
    loadProduct()
  }, [id])

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('למחוק תמונה זו?')) return
    const sb = createClient()
    await sb.from('product_media').delete().eq('id', mediaId)
    setExistingMedia(existingMedia.filter(m => m.id !== mediaId))
  }

  const parseSTL = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const loader = new STLLoader()
          const geometry = loader.parse(e.target!.result as ArrayBuffer)
          geometry.computeBoundingBox()
          const bbox = geometry.boundingBox!
          const size = new THREE.Vector3()
          bbox.getSize(size)

          const pos = geometry.attributes.position
          let volume = 0
          for (let i = 0; i < pos.count; i += 3) {
            const v1 = new THREE.Vector3().fromBufferAttribute(pos, i)
            const v2 = new THREE.Vector3().fromBufferAttribute(pos, i + 1)
            const v3 = new THREE.Vector3().fromBufferAttribute(pos, i + 2)
            volume += v1.dot(v2.cross(v3)) / 6
          }

          const volume_cm3 = Math.abs(volume) * 0.001
          resolve({
            volume_cm3: +volume_cm3.toFixed(3),
            bounding_x: +size.x.toFixed(1),
            bounding_y: +size.y.toFixed(1),
            bounding_z: +size.z.toFixed(1),
            filename: file.name,
          })
        } catch (err) { reject(err) }
      }
      reader.readAsArrayBuffer(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setLoading(true)
    try {
      const data = await parseSTL(file)
      setModel(data)
      setStlFileObj(file)
    } catch (e) {
      alert('שגיאה בניתוח הקובץ')
    }
    setLoading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'model/stl': ['.stl'] }, maxFiles: 1 })

  // Calculations
  const density = MATERIAL_DENSITY[form.material] || 1.24
  const effectiveVolume = model ? model.volume_cm3 * (form.infill / 100) * 1.2 : 0
  const weight_g = effectiveVolume * density
  const printTimeHours = model ? (model.volume_cm3 * 0.012 * (0.2 / form.layerHeight)) : 0

  let calc = null
  if (preset && model) {
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
          uploadedMediaUrls.push(publicUrlData.publicUrl)
          // If there's no existing media and this is the first one, maybe set it as cover?
          // For simplicity, we just add them to product_media. If cover_image is missing, we could update it.
        }
      }
    }

    // Save to products table
    const updateData: any = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      material: form.material,
      infill_percent: form.infill,
      layer_height_mm: form.layerHeight,
      material_weight_g: weight_g,
      print_time_min: Math.round(printTimeHours * 60),
      estimated_cost: calc ? calc.total_cost : null,
    }

    const { data: product, error } = await sb.from('products').update(updateData).eq('id', id).select().single()

    if (error) {
      alert('שגיאה בשמירת המוצר')
      setSaving(false)
      return
    }

    if (uploadedMediaUrls.length > 0) {
      const startIndex = existingMedia.length
      const mediaInserts = uploadedMediaUrls.map((url, idx) => ({
        product_id: product.id,
        url: url,
        type: 'image',
        sort_order: startIndex + idx + 1
      }))
      await sb.from('product_media').insert(mediaInserts)
      
      // Update cover image if none existed
      if (startIndex === 0 && !product.cover_image) {
        await sb.from('products').update({ cover_image: uploadedMediaUrls[0] }).eq('id', product.id)
      }
    }

    if (model && stlFileObj) {
      let stlFileUrl = ''
      const ext = stlFileObj.name.split('.').pop()
      const fileName = `stl-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { data: uploadData } = await sb.storage.from('products').upload(fileName, stlFileObj)
      if (uploadData) {
        const { data: publicUrlData } = sb.storage.from('products').getPublicUrl(fileName)
        stlFileUrl = publicUrlData.publicUrl
      }
      
      if (stlFileUrl) {
        // Delete old STL entries for this product
        await sb.from('product_files')
          .delete()
          .eq('product_id', product.id)
          .in('file_type', ['stl', 'obj'])

        // Insert new
        await sb.from('product_files').insert([{
          product_id: product.id,
          filename: model.filename,
          file_url: stlFileUrl,
          mesh_volume_cm3: model.volume_cm3,
          bounding_x_mm: model.bounding_x,
          bounding_y_mm: model.bounding_y,
          bounding_z_mm: model.bounding_z,
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
        <span className="text-beige font-semibold">עריכת מוצר</span>
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
              <label className="block text-sm text-beige-muted mb-1">תמונות קיימות (גלריה)</label>
              {existingMedia.length > 0 ? (
                <div className="flex flex-wrap gap-3 mb-4">
                  {existingMedia.map((m) => (
                    <div key={m.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20 group">
                      <img src={m.url} alt="media" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleDeleteMedia(m.id)} className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-beige-dim mb-4">אין תמונות גלריה.</div>
              )}
              
              <label className="block text-sm text-beige-muted mb-1">הוסף תמונות חדשות</label>
              <input type="file" multiple accept="image/*" onChange={e => setGalleryFiles(Array.from(e.target.files || []))} className="w-full glass rounded-xl px-4 py-2.5 text-beige outline-none border border-white/10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/20 file:text-gold hover:file:bg-gold/30" />
              {galleryFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {galleryFiles.map((f, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gold/40">
                      <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gold/90 text-black text-[10px] text-center font-bold">חדש</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-semibold text-beige text-lg mb-4">העלאת קובץ להערכת מחיר</h3>
            <div {...getRootProps()} className={`p-8 text-center cursor-pointer transition-all glass rounded-2xl border ${isDragActive ? 'border-gold/60 bg-gold/5' : 'border-white/10 hover:border-gold/30'}`}>
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="text-beige font-semibold mb-2">{loading ? 'מנתח...' : 'גרור קובץ STL'}</h3>
              {model && <div className="text-xs text-status-success mt-2 flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> {model.filename} נטען ({model.volume_cm3} cm³)</div>}
            </div>
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
            {saving ? 'שומר שינויים...' : 'שמור שינויים'}
          </GoldButton>
        </div>
      </form>
    </div>
  )
}
