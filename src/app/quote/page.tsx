'use client'
import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { GoldButton } from '@/components/ui/GoldButton'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/StatCard'
import {
  Upload, Zap, Calculator, ChevronDown, Check, Send, Box, Layers
} from 'lucide-react'
import { calculatePrintCost, formatPrice, MATERIAL_DENSITY } from '@/lib/utils'

const ThreeModelViewer = dynamic(() => import('@/components/3d/ThreeModelViewer').then(m => m.ThreeModelViewer), { ssr: false })

const MATERIALS = [
  { value: 'PLA',  label: 'PLA',   priceKg: 85,  color: '#52C87A' },
  { value: 'PETG', label: 'PETG',  priceKg: 95,  color: '#3B82F6' },
  { value: 'TPU',  label: 'TPU',   priceKg: 140, color: '#8B5CF6' },
  { value: 'ABS',  label: 'ABS',   priceKg: 90,  color: '#F59E0B' },
  { value: 'Resin',label: 'Resin', priceKg: 250, color: '#EC4899' },
]

interface ModelData {
  volume_cm3: number
  surface_cm2: number
  bounding_x: number
  bounding_y: number
  bounding_z: number
  blob_url: string
  filename: string
}

export default function QuotePage() {
  const [model, setModel] = useState<ModelData | null>(null)
  const [fileObj, setFileObj] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [material, setMaterial] = useState('PLA')
  const [infill, setInfill] = useState(20)
  const [layerHeight, setLayerHeight] = useState(0.20)
  const [preset, setPreset] = useState({
    electricity_kwh_rate: 0.65,
    printer_wattage: 200,
    hourly_labor_rate: 60,
    failure_margin_pct: 10,
    default_profit_margin: 30,
  })
  const [sentForm, setSentForm] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    async function loadPreset() {
      const sb = createClient()
      const { data } = await sb.from('cost_presets').select('*').eq('is_default', true).single()
      if (data) setPreset(data)
    }
    loadPreset()
  }, [])

  const parseSTL = async (file: File): Promise<ModelData> => {
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

          // Volume via signed tetrahedra
          const pos = geometry.attributes.position
          let volume = 0
          for (let i = 0; i < pos.count; i += 3) {
            const v1 = new THREE.Vector3().fromBufferAttribute(pos, i)
            const v2 = new THREE.Vector3().fromBufferAttribute(pos, i + 1)
            const v3 = new THREE.Vector3().fromBufferAttribute(pos, i + 2)
            volume += v1.dot(v2.cross(v3)) / 6
          }

          const scaleFactor = 0.001 // mm³ → cm³
          const volume_cm3 = Math.abs(volume) * scaleFactor
          const surface_cm2 = 0 // Could compute if needed

          resolve({
            volume_cm3: +volume_cm3.toFixed(3),
            surface_cm2,
            bounding_x: +size.x.toFixed(1),
            bounding_y: +size.y.toFixed(1),
            bounding_z: +size.z.toFixed(1),
            blob_url: URL.createObjectURL(file),
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
      setFileObj(file)
    } catch (e) {
      alert('שגיאה בקריאת הקובץ — נסה קובץ STL תקני')
    }
    setLoading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'model/stl': ['.stl'], 'model/obj': ['.obj'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  })

  const selectedMat = MATERIALS.find(m => m.value === material)!
  const density = MATERIAL_DENSITY[material] || 1.24
  const solidPercentage = model ? Math.min(1.0, 0.45 + (infill / 100) * 0.55) : 0
  const effectiveVolume = model ? model.volume_cm3 * solidPercentage : 0
  const weight_g = effectiveVolume * density
  const printTimeHours = model ? (weight_g * 1.7 * (0.2 / layerHeight)) / 60 * 1.2 : 0

  const calc = calculatePrintCost({
    filament_cost_per_kg: selectedMat.priceKg,
    material_weight_g: weight_g,
    printer_wattage: preset.printer_wattage,
    electricity_kwh_rate: preset.electricity_kwh_rate,
    print_time_hours: printTimeHours,
    hourly_labor_rate: preset.hourly_labor_rate,
    failure_margin_pct: preset.failure_margin_pct,
    profit_margin_pct: preset.default_profit_margin,
  })

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!model) return
    const sb = createClient()
    
    let uploadedFileUrl = null
    if (fileObj) {
      const ext = fileObj.name.split('.').pop()
      const fileName = `quote-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { data: uploadData } = await sb.storage.from('products').upload(`quotes/${fileName}`, fileObj)
      if (uploadData) {
        const { data: publicUrlData } = sb.storage.from('products').getPublicUrl(`quotes/${fileName}`)
        uploadedFileUrl = publicUrlData.publicUrl
      }
    }

    await sb.from('print_jobs').insert({
      customer_name: contactForm.name,
      customer_email: contactForm.email,
      customer_phone: contactForm.phone,
      is_custom_quote: true,
      original_filename: model.filename,
      uploaded_file_url: uploadedFileUrl,
      calculated_volume_cm3: model.volume_cm3,
      estimated_weight_g: weight_g,
      material_requested: material,
      infill_percent: infill,
      layer_height_mm: layerHeight,
      estimated_print_time_min: Math.round(printTimeHours * 60),
      status: 'pending_quote',
      quoted_price: calc.suggested_price,
    })
    setSentForm(true)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <SectionHeader
        label="הצעת מחיר"
        title="קבל הצעת מחיר"
        titleHighlight="מיידית"
        subtitle="העלה קובץ STL/OBJ ותקבל הערכת עלות אוטומטית תוך שניות"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Upload Zone ── */}
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`p-10 text-center cursor-pointer transition-all glass rounded-2xl border ${isDragActive ? 'border-gold/60 bg-gold/5' : 'border-white/10 hover:border-gold/30'}`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              {loading ? (
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-gold" />
              )}
            </div>
            <h3 className="text-beige font-semibold mb-2">
              {isDragActive ? 'שחרר כאן!' : loading ? 'מנתח קובץ...' : 'גרור קובץ STL/OBJ'}
            </h3>
            <p className="text-beige-muted text-sm">או לחץ לבחירת קובץ — עד 50MB</p>
            {model && (
              <div className="mt-4 text-xs text-status-success flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" /> {model.filename}
              </div>
            )}
          </div>

          {/* 3D Preview */}
          {model && (
            <ThreeModelViewer
              fileUrl={model.blob_url}
              fileType="stl"
              className="h-64"
            />
          )}

          {/* Model dimensions */}
          {model && (
            <GlassCard className="p-4">
              <h4 className="text-sm font-semibold text-beige mb-3 flex items-center gap-2">
                <Box className="w-4 h-4 text-gold" /> נתוני המודל
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'רוחב', value: `${model.bounding_x}mm` },
                  { label: 'עומק', value: `${model.bounding_y}mm` },
                  { label: 'גובה', value: `${model.bounding_z}mm` },
                ].map(({ label, value }) => (
                  <div key={label} className="glass rounded-lg p-2">
                    <div className="text-xs text-beige-muted">{label}</div>
                    <div className="font-bold text-beige font-num">{value}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 text-center">
                <div className="glass rounded-lg p-2">
                  <div className="text-xs text-beige-muted">נפח</div>
                  <div className="font-bold text-gold font-num">{model.volume_cm3} cm³</div>
                </div>
                <div className="glass rounded-lg p-2">
                  <div className="text-xs text-beige-muted">משקל משוער</div>
                  <div className="font-bold text-gold font-num">{weight_g.toFixed(1)}g</div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* ── Settings & Calculator ── */}
        <div className="space-y-6">
          {/* Material */}
          <GlassCard className="p-5">
            <h4 className="text-sm font-semibold text-beige mb-3">בחר חומר</h4>
            <div className="grid grid-cols-5 gap-2">
              {MATERIALS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMaterial(m.value)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    material === m.value
                      ? 'bg-gold/20 border-2 border-gold text-gold'
                      : 'glass border border-white/10 text-beige-muted hover:border-white/20'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-beige-muted">
              מחיר לק"ג: <span className="text-gold font-bold font-num">₪{selectedMat.priceKg}</span>
            </div>
          </GlassCard>

          {/* Settings */}
          <GlassCard className="p-5 space-y-4">
            <h4 className="text-sm font-semibold text-beige">הגדרות הדפסה</h4>

            {/* Infill */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-beige-muted">אחוז מילוי</span>
                <span className="text-gold font-bold font-num">{infill}%</span>
              </div>
              <input
                type="range" min={10} max={100} step={5} value={infill}
                onChange={e => setInfill(+e.target.value)}
                className="w-full accent-gold"
              />
              <div className="flex justify-between text-xs text-beige-dim mt-1">
                <span>10% (חלול)</span><span>100% (מוצק)</span>
              </div>
            </div>

            {/* Layer height */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-beige-muted">גובה שכבה</span>
                <span className="text-gold font-bold font-num">{layerHeight}mm</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0.12, 0.20, 0.28].map(h => (
                  <button
                    key={h}
                    onClick={() => setLayerHeight(h)}
                    className={`py-1.5 rounded-lg text-xs transition-all ${
                      layerHeight === h ? 'bg-gold/20 border border-gold/40 text-gold' : 'glass text-beige-muted'
                    }`}
                  >
                    {h}mm {h === 0.12 ? '(עדין)' : h === 0.20 ? '(רגיל)' : '(מהיר)'}
                  </button>
                ))}
              </div>
            </div>

          </GlassCard>

          {/* Result */}
          <AnimatePresence>
            {model && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard variant="gold" className="p-5">
                  <h4 className="text-sm font-semibold text-gold mb-4 flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> הערכת מחיר
                  </h4>

                  <div className="glass-gold rounded-xl p-4 text-center">
                    <div className="text-xs text-beige-muted mb-1">מחיר משוער ללקוח</div>
                    <div className="text-3xl font-bold gradient-text-static font-num">₪{calc.suggested_price}</div>

                  </div>
                </GlassCard>

                {/* Send request form */}
                {!sentForm ? (
                  <GlassCard className="p-5 mt-4">
                    <h4 className="text-sm font-semibold text-beige mb-3">שלח בקשת הדפסה</h4>
                    <form onSubmit={handleSendRequest} className="space-y-3">
                      {[
                        { key: 'name', placeholder: 'שם מלא *', required: true, type: 'text' },
                        { key: 'email', placeholder: 'אימייל *', required: true, type: 'email' },
                        { key: 'phone', placeholder: 'טלפון', required: false, type: 'tel' },
                      ].map(f => (
                        <input
                          key={f.key}
                          type={f.type}
                          required={f.required}
                          placeholder={f.placeholder}
                          value={contactForm[f.key as keyof typeof contactForm]}
                          onChange={e => setContactForm({ ...contactForm, [f.key]: e.target.value })}
                          className="w-full glass rounded-xl px-4 py-2.5 text-sm text-beige placeholder-beige-dim outline-none bg-transparent"
                        />
                      ))}
                      <GoldButton type="submit" className="w-full">
                        <Send className="w-4 h-4" /> שלח בקשה
                      </GoldButton>
                    </form>
                  </GlassCard>
                ) : (
                  <GlassCard variant="gold" className="p-5 mt-4 text-center">
                    <Check className="w-8 h-8 text-status-success mx-auto mb-2" />
                    <p className="text-beige font-semibold">הבקשה נשלחה! נחזור אליך בהקדם.</p>
                  </GlassCard>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
