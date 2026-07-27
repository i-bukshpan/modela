// ============================================================
// DATABASE TYPES — Modela 3D Print Shop v3.0
// Generated from Supabase schema_v3.sql
// ============================================================

export type MaterialType =
  | 'PLA' | 'PETG' | 'TPU' | 'ABS' | 'Resin'
  | 'ASA' | 'HIPS' | 'Nylon' | 'PLA+' | 'PETG-CF' | 'PLA-CF'

export type PrintJobStatus =
  | 'pending_quote' | 'quoted' | 'in_queue'
  | 'printing' | 'post_processing' | 'ready' | 'shipped' | 'cancelled'

export type ExpenseCategory =
  | 'materials' | 'maintenance' | 'nozzle_replacement'
  | 'power' | 'software' | 'shipping' | 'equipment' | 'general'

export type RevenueCategory =
  | 'print_job' | 'design_service' | 'product_sale' | 'consultation' | 'other'

export type BlogStatus = 'draft' | 'published'
export type MessageStatus = 'new' | 'read' | 'replied' | 'archived'
export type FileType = 'stl' | 'obj' | '3mf' | 'step'
export type MediaType = 'image' | 'video'

// ── Core Store ──

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string
  parent_id: string | null
  sort_order: number
  created_at: string
  subcategories?: Category[]
}

export interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  category_id: string | null
  // Pricing
  price: number | null
  sale_price: number | null
  // Technical specs
  material: string | null
  material_color: string | null
  material_color_hex: string
  print_time: string | null
  print_time_min: number | null
  dimensions: string | null
  finish_type: string | null
  printer_model: string | null
  // Advanced specs
  material_weight_g: number | null
  infill_percent: number | null
  layer_height_mm: number | null
  supports_used: boolean
  post_processing: string | null
  print_date: string | null
  quantity_printed: number
  default_filament_id: string | null
  // Engagement
  featured: boolean
  view_count: number
  like_count: number
  // Timestamps
  created_at: string
  updated_at: string
  // Relations (joined)
  category?: Category
  product_media?: ProductMedia[]
  product_files?: ProductFile[]
}

export interface ProductMedia {
  id: string
  product_id: string
  url: string
  type: MediaType
  is_cover: boolean
  sort_order: number
  created_at: string
}

export interface ProductFile {
  id: string
  product_id: string
  filename: string
  file_url: string
  file_size_bytes: number
  file_type: FileType | string
  mesh_volume_cm3: number | null
  mesh_surface_cm2: number | null
  bounding_x_mm: number | null
  bounding_y_mm: number | null
  bounding_z_mm: number | null
  download_count: number
  created_at: string
}

export interface Comment {
  id: string
  product_id: string
  author_name: string
  author_email: string | null
  content: string
  approved: boolean
  created_at: string
}

// ── Inventory ──

export interface Filament {
  id: string
  brand: string
  material: MaterialType
  color_name: string
  color_hex: string
  spool_weight_g: number
  remaining_weight_g: number
  cost_per_kg: number
  low_stock_threshold_g: number
  purchase_date: string | null
  barcode: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Computed
  remaining_pct?: number
  is_low_stock?: boolean
}

// ── Print Jobs ──

export interface PrintJob {
  id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  product_id: string | null
  is_custom_quote: boolean
  uploaded_file_url: string | null
  original_filename: string | null
  calculated_volume_cm3: number | null
  estimated_weight_g: number | null
  material_requested: string | null
  infill_percent: number
  layer_height_mm: number
  assigned_printer: string | null
  filament_id: string | null
  estimated_print_time_min: number | null
  started_at: string | null
  completed_at: string | null
  status: PrintJobStatus
  quoted_price: number | null
  actual_material_cost: number | null
  actual_electricity_cost: number | null
  actual_total_cost: number | null
  profit_margin_pct: number | null
  paid: boolean
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  filament?: Filament
  product?: Product
}

// ── Finance ──

export interface Expense {
  id: string
  title: string
  category: ExpenseCategory
  amount: number
  date: string
  receipt_url: string | null
  notes: string | null
  created_at: string
}

export interface RevenueEntry {
  id: string
  title: string
  category: RevenueCategory
  amount: number
  date: string
  job_id: string | null
  notes: string | null
  created_at: string
}

export interface CostPreset {
  id: string
  name: string
  electricity_kwh_rate: number
  printer_wattage: number
  hourly_labor_rate: number
  failure_margin_pct: number
  default_profit_margin: number
  is_default: boolean
  created_at: string
}

// ── Cost Calculator ──

export interface CostCalcInput {
  filament_cost_per_kg: number
  material_weight_g: number
  printer_wattage: number
  electricity_kwh_rate: number
  print_time_hours: number
  hourly_labor_rate: number
  failure_margin_pct: number
  profit_margin_pct: number
}

export interface CostCalcResult {
  material_cost: number
  electricity_cost: number
  labor_cost: number
  failure_buffer: number
  total_cost: number
  suggested_price: number
  profit_amount: number
  actual_margin_pct: number
}

// ── Blog ──

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image: string | null
  author_id: string | null
  status: BlogStatus
  tags: string[] | null
  view_count: number
  created_at: string
  updated_at: string
}

export interface BlogComment {
  id: string
  post_id: string
  author_name: string
  author_email: string | null
  content: string
  approved: boolean
  created_at: string
}

// ── CRM ──

export interface ContactMessage {
  id: string
  name: string
  email: string | null
  phone: string | null
  subject: string | null
  message: string
  status: MessageStatus
  created_at: string
}

export interface Testimonial {
  id: string
  author_name: string
  author_info: string | null
  author_avatar_url: string | null
  author_avatar_init: string | null
  content: string
  rating: number
  featured: boolean
  created_at: string
}

// ── Site Settings ──

export interface SiteSetting {
  key: string
  value: string
  updated_at: string
}

export type SiteSettings = Record<string, string>

// ── Quote Estimator ──

export interface QuoteEstimate {
  volume_cm3: number
  surface_cm2: number
  bounding_x_mm: number
  bounding_y_mm: number
  bounding_z_mm: number
  estimated_weight_g: number
  material: MaterialType
  infill_percent: number
  layer_height_mm: number
  estimated_price: number
  estimated_print_time_min: number
}

// ── Analytics ──

export interface MonthlyFinancials {
  month: string
  materials_cost: number
  power_cost: number
  maintenance_cost: number
  other_cost: number
  total_expenses: number
}

export interface MonthlyRevenue {
  month: string
  total_revenue: number
  transaction_count: number
}
