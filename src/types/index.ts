export type Role = 'super_admin' | 'admin' | 'owner' | 'tenant' | 'agent'

export type PropertyStatus = 'draft' | 'pending_approval' | 'published' | 'rejected' | 'sold' | 'rented'
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  role: Role
  avatar_url: string | null
  national_id: string | null
  province: string | null
  district: string | null
  sector: string | null
  cell: string | null
  village: string | null
  address: string | null
  bio: string | null
  is_verified: boolean
  is_suspended: boolean
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  owner_id: string
  title: string
  description: string
  category: string
  property_type: string
  bedrooms: number
  bathrooms: number
  kitchen: number
  parking: boolean
  balcony: boolean
  garden: boolean
  swimming_pool: boolean
  security: boolean
  internet: boolean
  water: boolean
  electricity: boolean
  furnished: boolean
  price: number
  deposit: number | null
  province: string
  district: string
  sector: string
  cell: string
  village: string
  latitude: number | null
  longitude: number | null
  whatsapp_number: string | null
  status: PropertyStatus
  is_featured: boolean
  views_count: number
  created_at: string
  updated_at: string
  owner?: Profile
  images?: PropertyImage[]
  videos?: PropertyVideo[]
  amenities?: Amenity[]
  reviews?: Review[]
  average_rating?: number
}

export interface PropertyImage {
  id: string
  property_id: string
  url: string
  is_floor_plan: boolean
  sort_order: number
  created_at: string
}

export interface PropertyVideo {
  id: string
  property_id: string
  url: string
  created_at: string
}

export interface Amenity {
  id: string
  property_id: string
  name: string
  created_at: string
}

export interface Booking {
  id: string
  property_id: string
  tenant_id: string
  owner_id: string
  status: BookingStatus
  check_in: string | null
  check_out: string | null
  visit_date: string | null
  message: string | null
  reply_message: string | null
  created_at: string
  updated_at: string
  property?: Property
  tenant?: Profile
}

export interface Payment {
  id: string
  booking_id: string
  payer_id: string
  payee_id: string
  amount: number
  currency: string
  method: string
  status: PaymentStatus
  transaction_id: string | null
  receipt_url: string | null
  created_at: string
}

export interface Review {
  id: string
  property_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  user?: Profile
}

export interface Favorite {
  id: string
  user_id: string
  property_id: string
  created_at: string
  property?: Property
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  property_id: string | null
  content: string
  is_read: boolean
  created_at: string
  sender?: Profile
  receiver?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: string
  is_read: boolean
  data: Record<string, string> | null
  created_at: string
}

export interface MaintenanceRequest {
  id: string
  property_id: string
  tenant_id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

export interface Complaint {
  id: string
  user_id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  booking_id: string
  tenant_id: string
  owner_id: string
  property_id: string
  start_date: string
  end_date: string
  monthly_rent: number
  deposit_amount: number
  status: 'active' | 'expired' | 'terminated'
  document_url: string | null
  created_at: string
}

export interface CmsPage {
  id: string
  slug: string
  title: string
  content: string
  meta_title: string | null
  meta_description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  created_at: string
  updated_at: string
}
