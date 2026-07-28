'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { Package, Plus, Search, Edit2, Trash2, Calculator, Upload, Check, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { calculatePrintCost, MATERIAL_DENSITY } from '@/lib/utils'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Quick Calc Modal State
  const [showCalc, setShowCalc] = useState(false)
  const [calcLoading, setCalcLoading] = useState(false)
  const [preset, setPreset] = useState<any>(null)
  const [model, setModel] = useState<any>(null)
  const [calcForm, setCalcForm] = useState({ material: 'PLA', infill: 20, layerHeight: 0.20 })

  useEffect(() => {
    loadProducts()
    loadPreset()
  }, [])

  async function loadPreset() {
    const sb = createClient()
    const { data, error } = await sb.from('cost_presets').select('*').eq('is_default', true).maybeSingle()
    if (data) setPreset(data)
    else if (error) console.error("Error loading preset:", error)
    else {
      // Create a fallback preset if none exists yet so the calculator doesn't break
      setPreset({
        printer_wattage: 200, electricity_kwh_rate: 0.65, hourly_labor_rate: 60,
        failure_margin_pct: 10, default_profit_margin: 30
      })
    }
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
    setCalcLoading(true)
    try {
      const data = await parseSTL(file)
      setModel(data)
    } catch (e) {
      alert('שגיאה בניתוח הקובץ')
    }
    setCalcLoading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'model/stl': ['.stl'] }, maxFiles: 1 })

  // Calculations for Quick Calc
  const density = MATERIAL_DENSITY[calcForm.material] || 1.24
  // Slicers print thick solid walls (Perimeters/Top/Bottom). We assume at least 45% of the model is solid walls + infill for the rest.
  const solidPercentage = Math.min(1.0, 0.45 + (calcForm.infill / 100) * 0.55)
  const effectiveVolume = model ? model.volume_cm3 * solidPercentage : 0
  const weight_g = effectiveVolume * density
  
  // Real world FDM time is heavily tied to weight. Roughly 1.7 minutes per gram at 0.2mm layer height.
  const printTimeHours = model ? (weight_g * 1.7 * (0.2 / calcForm.layerHeight)) / 60 : 0

  let calc = null
  if (preset && model) {
    calc = calculatePrintCost({
      filament_cost_per_kg: 85,
      material_weight_g: weight_g,
      printer_wattage: preset.printer_wattage,
      electricity_kwh_rate: preset.electricity_kwh_rate,
      print_time_hours: printTimeHours,
      hourly_labor_rate: preset.hourly_labor_rate,
      failure_margin_pct: preset.failure_margin_pct,
      profit_margin_pct: preset.default_profit_margin,
    })
  }


  async function loadProducts() {
    const sb = createClient()
    const { data } = await sb.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  async function deleteProduct(id: string) {
    if (!confirm('האם אתה בטוח שברצונך למחוק מוצר זה? פעולה זו תמחוק גם את הקבצים המקושרים.')) return
    const sb = createClient()
    await sb.from('products').delete().eq('id', id)
    loadProducts()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-beige flex items-center gap-2">
            <Package className="w-6 h-6 text-gold" /> ניהול מוצרים
          </h1>
          <p className="text-beige-muted text-sm mt-1">קטלוג המוצרים, מחירים והגדרות</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setShowCalc(true); setModel(null); }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gold/50 text-gold hover:bg-gold/10 transition-all"
          >
            <Calculator className="w-5 h-5" /> מחשבון מהיר
          </button>
          <Link 
            href="/admin/products/new"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-slate-canvas font-bold hover:bg-gold-light transition-all"
          >
            <Plus className="w-5 h-5" /> הוסף מוצר חדש
          </Link>
        </div>
      </div>

      {showCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowCalc(false)}>
          <GlassCard className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-beige text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5 text-gold" /> מחשבון עלות מהיר
              </h3>
              <button onClick={() => setShowCalc(false)} className="text-beige-muted hover:text-beige">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div {...getRootProps()} className={`p-6 mb-6 text-center cursor-pointer transition-all glass rounded-2xl border ${isDragActive ? 'border-gold/60 bg-gold/5' : 'border-white/10 hover:border-gold/30'}`}>
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gold mx-auto mb-3" />
              <h3 className="text-beige font-semibold mb-1">{calcLoading ? 'מנתח קובץ...' : 'גרור קובץ STL'}</h3>
              {model && <div className="text-xs text-status-success mt-2 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> {model.filename} נטען בהצלחה ({model.volume_cm3} cm³)</div>}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs text-beige-muted mb-1">חומר</label>
                <select value={calcForm.material} onChange={e=>setCalcForm({...calcForm, material: e.target.value})} className="w-full glass rounded-lg px-2 py-2 text-sm text-beige outline-none [&>option]:bg-slate-900">
                  <option value="PLA">PLA</option>
                  <option value="PETG">PETG</option>
                  <option value="TPU">TPU</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-beige-muted mb-1">מילוי (%)</label>
                <input type="number" value={calcForm.infill} onChange={e=>setCalcForm({...calcForm, infill: +e.target.value})} className="w-full glass rounded-lg px-2 py-2 text-sm text-beige outline-none" />
              </div>
              <div>
                <label className="block text-xs text-beige-muted mb-1">גובה שכבה</label>
                <input type="number" step="0.04" value={calcForm.layerHeight} onChange={e=>setCalcForm({...calcForm, layerHeight: +e.target.value})} className="w-full glass rounded-lg px-2 py-2 text-sm text-beige outline-none" />
              </div>
            </div>

            {calc ? (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-beige-muted">משקל משוער</span><span className="font-num text-beige">{Math.round(weight_g)}g</span></div>
                <div className="flex justify-between"><span className="text-beige-muted">זמן הדפסה משוער</span><span className="font-num text-beige">{Math.round(printTimeHours * 60)} דקות</span></div>
                <div className="flex justify-between"><span className="text-beige-muted">עלות חומר</span><span className="font-num text-beige">₪{calc.material_cost}</span></div>
                <div className="flex justify-between"><span className="text-beige-muted">עלות חשמל</span><span className="font-num text-beige">₪{calc.electricity_cost}</span></div>
                <div className="flex justify-between"><span className="text-beige-muted">עלות עבודה</span><span className="font-num text-beige">₪{calc.labor_cost}</span></div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-beige">עלות כוללת (טרום רווח)</span><span className="font-num text-status-warning">₪{calc.total_cost}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="text-gold font-bold">מחיר מומלץ (רווח {preset?.default_profit_margin}%)</span><span className="font-num text-gold font-bold text-lg">₪{calc.suggested_price}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-beige-muted text-sm py-4">העלה קובץ כדי לראות הערכת עלויות</div>
            )}
          </GlassCard>
        </div>
      )}

      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-beige-muted">טוען מוצרים...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-beige-muted">אין מוצרים בקטלוג עדיין. הוסף את המוצר הראשון שלך!</div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/10 text-beige-muted bg-white/5">
                <th className="font-normal p-4">שם המוצר</th>
                <th className="font-normal p-4">קטגוריה</th>
                <th className="font-normal p-4">מחיר</th>
                <th className="font-normal p-4">מלאי מודפס</th>
                <th className="font-normal p-4 w-24">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.cover_image ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                          <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                          <Package className="w-5 h-5 text-beige-muted" />
                        </div>
                      )}
                      <span className="text-beige font-medium">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-beige-muted">{p.category_id || 'כללי'}</td>
                  <td className="p-4 text-beige font-num">₪{p.price}</td>
                  <td className="p-4 text-beige-muted font-num">{p.quantity_printed}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/edit/${p.id}`} className="p-2 text-beige-muted hover:text-gold hover:bg-gold/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 text-beige-muted hover:text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  )
}
