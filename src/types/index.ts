export type Role = 'super_admin' | 'admin' | 'owner' | 'tenant' | 'agent'

export type PropertyStatus = 'draft' | 'pending_approval' | 'published' | 'rejected' | 'sold' | 'rented'
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn'
export type UnitStatus = 'available' | 'reserved' | 'occupied' | 'maintenance' | 'unavailable'

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
  unit_id: string | null
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
  status: 'submitted' | 'acknowledged' | 'assigned' | 'in_progress' | 'completed' | 'verified' | 'closed'
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
  unit_id: string | null
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

export interface PropertyUnit {
  id: string
  property_id: string
  unit_number: string | null
  floor: string | null
  bedrooms: number
  bathrooms: number
  monthly_rent: number
  deposit_amount: number | null
  status: UnitStatus
  available_from: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RentalApplication {
  id: string
  property_id: string
  unit_id: string | null
  applicant_id: string
  owner_id: string | null
  status: ApplicationStatus
  message: string | null
  desired_move_in: string | null
  monthly_rent_offer: number | null
  rejection_reason: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
  property?: Property
  unit?: PropertyUnit
  applicant?: Profile
}

export interface RentCharge {
  id: string
  tenant_id: string
  property_id: string
  unit_id: string | null
  contract_id: string | null
  charge_type: 'rent' | 'deposit' | 'late_fee' | 'maintenance' | 'other'
  amount: number
  paid_amount: number
  due_date: string | null
  period_start: string | null
  period_end: string | null
  status: 'unpaid' | 'partial' | 'paid' | 'waived' | 'overdue'
  created_at: string
  updated_at: string
}

export interface PaymentTransaction {
  id: string
  payment_id: string | null
  rent_charge_id: string | null
  provider: string
  provider_transaction_id: string | null
  external_reference: string | null
  amount: number
  currency: string
  status: 'initiated' | 'pending' | 'successful' | 'failed' | 'cancelled' | 'refunded'
  created_at: string
  updated_at: string
}

export interface PropertyVerification {
  id: string
  property_id: string
  verified_by: string | null
  status: 'pending' | 'verified' | 'rejected' | 'suspended'
  notes: string | null
  verified_at: string | null
  created_at: string
}

export interface OwnerVerification {
  id: string
  owner_id: string
  verified_by: string | null
  status: 'pending' | 'verified' | 'rejected' | 'suspended'
  document_urls: string[]
  notes: string | null
  verified_at: string | null
  created_at: string
}

export interface PropertyReport {
  id: string
  property_id: string
  reported_by: string | null
  reason: string
  details: string | null
  status: 'reported' | 'investigating' | 'resolved' | 'dismissed'
  resolution_notes: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
}

export interface MaintenanceComment {
  id: string
  request_id: string
  author_id: string | null
  comment: string
  created_at: string
}

export interface MaintenanceAssignment {
  id: string
  request_id: string
  assignee_id: string
  assigned_by: string | null
  status: 'assigned' | 'started' | 'completed'
  completed_at: string | null
  created_at: string
}

export interface LeaseRenewal {
  id: string
  contract_id: string
  tenant_id: string
  owner_id: string
  status: 'offered' | 'accepted' | 'rejected' | 'renewed' | 'expired'
  new_end_date: string | null
  new_monthly_rent: number | null
  offered_at: string
  responded_at: string | null
  created_at: string
}

export interface DataRequest {
  id: string
  user_id: string
  request_type: 'access' | 'correction' | 'export' | 'deletion' | 'consent_withdrawal'
  details: string | null
  status: 'pending' | 'in_progress' | 'fulfilled' | 'rejected' | 'cancelled'
  fulfilled_at: string | null
  handled_by: string | null
  created_at: string
}

export interface ConsentRecord {
  id: string
  user_id: string
  purpose: string
  channel: string
  granted: boolean
  granted_at: string
  revoked_at: string | null
  expires_at: string | null
}

export interface SavedSearch {
  id: string
  user_id: string
  name: string | null
  filters: Record<string, unknown>
  notification_enabled: boolean
  created_at: string
  updated_at: string
}
