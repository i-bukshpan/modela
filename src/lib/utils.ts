import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Date Formatting ──

export function formatDateHe(dateStr: string) {
  return format(new Date(dateStr), 'dd/MM/yyyy')
}

export function formatDateTimeHe(dateStr: string) {
  return format(new Date(dateStr), 'dd/MM/yyyy HH:mm')
}

export function timeAgo(dateStr: string) {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

// ── Number Formatting ──

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '—'
  return `₪${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

export function formatWeight(grams: number | null | undefined): string {
  if (grams == null) return '—'
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} ק"ג`
  return `${grams}g`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

// ── Print Job Status ──

export const JOB_STATUS_LABELS: Record<string, string> = {
  pending_quote:   'ממתין להצעה',
  quoted:          'הוצעה מחיר',
  in_queue:        'בתור',
  printing:        'בהדפסה',
  post_processing: 'גימור',
  ready:           'מוכן',
  shipped:         'נשלח',
  cancelled:       'בוטל',
}

export const JOB_STATUS_COLORS: Record<string, string> = {
  pending_quote:   'bg-beige-dim/10 text-beige-muted border-beige-dim/20',
  quoted:          'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20',
  in_queue:        'bg-status-warning/10 text-status-warning border-status-warning/20',
  printing:        'bg-gold/10 text-gold border-gold/20',
  post_processing: 'bg-cyber-violet/10 text-cyber-violet border-cyber-violet/20',
  ready:           'bg-status-success/10 text-status-success border-status-success/20',
  shipped:         'bg-status-success/20 text-status-success border-status-success/30',
  cancelled:       'bg-status-danger/10 text-status-danger border-status-danger/20',
}

// ── Material Density (g/cm³) for weight estimation ──

export const MATERIAL_DENSITY: Record<string, number> = {
  PLA:     1.24,
  'PLA+':  1.24,
  'PLA-CF':1.30,
  PETG:    1.27,
  'PETG-CF':1.35,
  TPU:     1.20,
  ABS:     1.04,
  ASA:     1.07,
  HIPS:    1.04,
  Nylon:   1.15,
  Resin:   1.10,
}

// ── Cost Calculator ──

export function calculatePrintCost({
  filament_cost_per_kg,
  material_weight_g,
  printer_wattage,
  electricity_kwh_rate,
  print_time_hours,
  hourly_labor_rate,
  failure_margin_pct,
  profit_margin_pct,
}: {
  filament_cost_per_kg: number
  material_weight_g: number
  printer_wattage: number
  electricity_kwh_rate: number
  print_time_hours: number
  hourly_labor_rate: number
  failure_margin_pct: number
  profit_margin_pct: number
}) {
  const material_cost    = (material_weight_g / 1000) * filament_cost_per_kg
  const electricity_cost = (printer_wattage / 1000) * print_time_hours * electricity_kwh_rate
  const labor_cost       = print_time_hours * hourly_labor_rate
  const subtotal         = material_cost + electricity_cost + labor_cost
  const failure_buffer   = subtotal * (failure_margin_pct / 100)
  const total_cost       = subtotal + failure_buffer
  const suggested_price  = total_cost / (1 - profit_margin_pct / 100)
  const profit_amount    = suggested_price - total_cost
  const actual_margin    = (profit_amount / suggested_price) * 100

  return {
    material_cost:    +material_cost.toFixed(2),
    electricity_cost: +electricity_cost.toFixed(2),
    labor_cost:       +labor_cost.toFixed(2),
    failure_buffer:   +failure_buffer.toFixed(2),
    total_cost:       +total_cost.toFixed(2),
    suggested_price:  +suggested_price.toFixed(2),
    profit_amount:    +profit_amount.toFixed(2),
    actual_margin_pct:+actual_margin.toFixed(1),
  }
}

// ── Slug ──

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u0590-\u05FF]/g, (c) => c)
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0590-\u05FF-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Image fallback ──

export const IMG_FALLBACK = '/images/placeholder.svg'

export function getProductCover(media: Array<{ url: string; is_cover: boolean; type: string }>): string {
  const cover = media?.find(m => m.is_cover && m.type === 'image')
  const first = media?.find(m => m.type === 'image')
  return cover?.url || first?.url || IMG_FALLBACK
}
