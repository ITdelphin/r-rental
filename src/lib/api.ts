import { supabase } from './supabase'
import { createAuditLog } from './audit'
import type {
  Profile, Property, Booking, Review, Favorite, Message, Notification, Payment,
  PropertyUnit, RentalApplication, RentCharge, PaymentTransaction, PropertyReport,
  PropertyVerification, OwnerVerification, MaintenanceComment, MaintenanceAssignment,
  LeaseRenewal, DataRequest, ConsentRecord, SavedSearch, Contract,
} from '@/types'

export const authApi = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },
  register: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  },
  signInWithOAuth: async (provider: 'google', redirectTo?: string) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo || `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
    return data
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  },
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },
}

export const profileApi = {
  get: async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
    if (error) throw error
    return data as unknown as Profile
  },
  update: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase.from('profiles').update(updates as never).eq('user_id', userId).select().single()
    if (error) throw error
    return data as unknown as Profile
  },
}

export const propertyApi = {
  list: async (filters?: Record<string, string | number | boolean>) => {
    let query = supabase.from('properties').select('*, images:property_images(*), reviews(*)')
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query = query.eq(key, value)
      })
    }
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as Property[]
  },
  get: async (id: string) => {
    const { data, error } = await supabase.from('properties').select('*, images:property_images(*), reviews(*, user:profiles(*))').eq('id', id).single()
    if (error) throw error
    const property = data as unknown as Property
    if (property.owner_id) {
      const { data: owner } = await supabase.from('profiles').select('*').eq('user_id', property.owner_id).single()
      property.owner = owner as unknown as Profile | undefined
    }
    return property
  },
  create: async (property: Partial<Property>) => {
    const { data, error } = await supabase.from('properties').insert(property as never).select().single()
    if (error) throw error
    const created = data as unknown as Property
    createAuditLog('property_created', 'property', created.id, { title: created.title })
    return created
  },
  update: async (id: string, updates: Partial<Property>) => {
    const { data, error } = await supabase.from('properties').update(updates as never).eq('id', id).select().single()
    if (error) throw error
    createAuditLog('property_updated', 'property', id, { updates: Object.keys(updates) })
    return data as unknown as Property
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) throw error
    createAuditLog('property_deleted', 'property', id)
  },
  incrementViews: async (id: string) => {
    try {
      const { error } = await (supabase.rpc as any)('increment_property_views', { property_id: id })
      if (error) throw error
    } catch {
      // silently fail - views are non-critical
    }
  },
}

export const bookingApi = {
  list: async (userId: string, role: string) => {
    const column = role === 'owner' ? 'owner_id' : 'tenant_id'
    const { data, error } = await supabase.from('bookings').select('*, property:properties(*)').eq(column, userId).order('created_at', { ascending: false })
    if (error) throw error
    const raw = (data || []) as unknown as Booking[]
    const tenantIds = [...new Set(raw.map(b => b.tenant_id).filter(Boolean))]
    if (tenantIds.length > 0) {
      const { data: tenants } = await supabase.from('profiles').select('*').in('id', tenantIds)
      if (tenants) {
        const tenantMap: Record<string, Profile> = {}
        for (const t of tenants as unknown as Profile[]) tenantMap[t.id] = t
        for (const b of raw) b.tenant = tenantMap[b.tenant_id] || null
      }
    }
    return raw
  },
  create: async (booking: Partial<Booking>) => {
    const { data, error } = await supabase.from('bookings').insert(booking as never).select().single()
    if (error) throw error
    return data as unknown as Booking
  },
  update: async (id: string, updates: Partial<Booking>) => {
    const { data, error } = await supabase.from('bookings').update(updates as never).eq('id', id).select().single()
    if (error) throw error
    return data as unknown as Booking
  },
}

export const reviewApi = {
  list: async (propertyId: string) => {
    const { data, error } = await supabase.from('reviews').select('*, user:profiles(*)').eq('property_id', propertyId)
    if (error) throw error
    return (data || []) as unknown as Review[]
  },
  create: async (review: Partial<Review>) => {
    const { data, error } = await supabase.from('reviews').insert(review as never).select().single()
    if (error) throw error
    const created = data as unknown as Review
    createAuditLog('review_created', 'review', created.id, { property_id: created.property_id, rating: created.rating })
    return created
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error
    createAuditLog('review_deleted', 'review', id)
  },
}

export const favoriteApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase.from('favorites').select('*, property:properties(*)').eq('user_id', userId)
    if (error) throw error
    return (data || []) as unknown as Favorite[]
  },
  add: async (userId: string, propertyId: string) => {
    const { data, error } = await supabase.from('favorites').insert({ user_id: userId, property_id: propertyId } as never).select().single()
    if (error) throw error
    return data as unknown as Favorite
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('favorites').delete().eq('id', id)
    if (error) throw error
  },
}

export const messageApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase.from('messages').select('*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as Message[]
  },
  send: async (message: Partial<Message>) => {
    const { data, error } = await supabase.from('messages').insert(message as never).select().single()
    if (error) throw error
    return data as unknown as Message
  },
  update: async (id: string, updates: Partial<Message>) => {
    const { data, error } = await supabase.from('messages').update(updates as never).eq('id', id).select().single()
    if (error) throw error
    return data as unknown as Message
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (error) throw error
  },
  getAdminUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'super_admin'])
      .not('user_id', 'is', null)
      .limit(10)
    if (error) throw error
    return (data || []) as unknown as Profile[]
  },
  markAsRead: async (id: string) => {
    const { error } = await supabase.from('messages').update({ is_read: true } as never).eq('id', id)
    if (error) throw error
  },
}

export const notificationApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as Notification[]
  },
  markAsRead: async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true } as never).eq('id', id)
    if (error) throw error
  },
  markAllAsRead: async (userId: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true } as never).eq('user_id', userId).is('is_read', false)
    if (error) throw error
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (error) throw error
  },
}

export const paymentApi = {
  list: async (userId: string, role: string) => {
    const column = role === 'owner' || role === 'agent' ? 'payee_id' : 'payer_id'
    const { data, error } = await supabase
      .from('payments')
      .select('*, booking:bookings(id, status, property:properties(title, district, province))')
      .eq(column, userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as (Payment & { booking?: { id: string; status: string; property?: { title: string; district: string; province: string } } })[]
  },
  create: async (payment: Partial<Payment>) => {
    const { data, error } = await supabase.from('payments').insert(payment as never).select().single()
    if (error) throw error
    return data as unknown as Payment
  },
  update: async (id: string, updates: Partial<Payment>) => {
    const { data, error } = await supabase.from('payments').update(updates as never).eq('id', id).select().single()
    if (error) throw error
    return data as unknown as Payment
  },
}

export const unitApi = {
  listForProperty: async (propertyId: string) => {
    const { data, error } = await supabase.from('property_units').select('*').eq('property_id', propertyId).order('monthly_rent')
    if (error) throw error
    return (data || []) as unknown as PropertyUnit[]
  },
  create: async (unit: Partial<PropertyUnit>) => {
    const { data, error } = await supabase.from('property_units').insert(unit as never).select().single()
    if (error) throw error
    return data as unknown as PropertyUnit
  },
  update: async (id: string, updates: Partial<PropertyUnit>) => {
    const { data, error } = await supabase.from('property_units').update(updates as never).eq('id', id).select().single()
    if (error) throw error
    return data as unknown as PropertyUnit
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('property_units').delete().eq('id', id)
    if (error) throw error
  },
}

export const applicationApi = {
  listForUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('rental_applications')
      .select('*, property:properties(*), unit:property_units(*)')
      .eq('applicant_id', userId)
      .order('submitted_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as RentalApplication[]
  },
  listForOwner: async (ownerId: string) => {
    const { data, error } = await supabase
      .from('rental_applications')
      .select('*, property:properties(*), unit:property_units(*), applicant:profiles!applicant_id(*)')
      .eq('owner_id', ownerId)
      .order('submitted_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as RentalApplication[]
  },
  create: async (app: Partial<RentalApplication>) => {
    const { data, error } = await supabase.from('rental_applications').insert(app as never).select().single()
    if (error) throw error
    return data as unknown as RentalApplication
  },
  updateStatus: async (id: string, status: RentalApplication['status'], extra?: Partial<RentalApplication>) => {
    const { data, error } = await supabase
      .from('rental_applications')
      .update({ status, reviewed_at: new Date().toISOString(), ...extra } as never)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as unknown as RentalApplication
  },
  withdraw: async (id: string, applicantId: string) => {
    const { error } = await supabase.from('rental_applications').update({ status: 'withdrawn' } as never).eq('id', id).eq('applicant_id', applicantId)
    if (error) throw error
  },
}

export const chargeApi = {
  listForTenant: async (tenantId: string) => {
    const { data, error } = await supabase
      .from('rent_charges')
      .select('*, property:properties(title)')
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as (RentCharge & { property?: { title: string } })[]
  },
  listForOwner: async (ownerId: string) => {
    const { data, error } = await supabase
      .from('rent_charges')
      .select('*, property:properties(title), unit:property_units(unit_number)')
      .in('property_id', (await supabase.from('properties').select('id').eq('owner_id', ownerId)).data?.map(p => p.id) || [])
      .order('due_date', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as RentCharge[]
  },
  create: async (charge: Partial<RentCharge>) => {
    const { data, error } = await supabase.from('rent_charges').insert(charge as never).select().single()
    if (error) throw error
    return data as unknown as RentCharge
  },
}

export const transactionApi = {
  create: async (tx: Partial<PaymentTransaction>) => {
    const { data, error } = await supabase.from('payment_transactions').insert(tx as never).select().single()
    if (error) throw error
    return data as unknown as PaymentTransaction
  },
  listForPayment: async (paymentId: string) => {
    const { data, error } = await supabase.from('payment_transactions').select('*').eq('payment_id', paymentId)
    if (error) throw error
    return (data || []) as unknown as PaymentTransaction[]
  },
}

export const reportApi = {
  create: async (report: Partial<PropertyReport>) => {
    const { data, error } = await supabase.from('property_reports').insert(report as never).select().single()
    if (error) throw error
    return data as unknown as PropertyReport
  },
  listForProperty: async (propertyId: string) => {
    const { data, error } = await supabase.from('property_reports').select('*').eq('property_id', propertyId).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as PropertyReport[]
  },
  updateStatus: async (id: string, status: PropertyReport['status'], resolutionNotes?: string) => {
    const { data, error } = await supabase
      .from('property_reports')
      .update({ status, resolution_notes: resolutionNotes, resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null } as never)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as unknown as PropertyReport
  },
}

export const verificationApi = {
  getForProperty: async (propertyId: string) => {
    const { data, error } = await supabase.from('property_verifications').select('*').eq('property_id', propertyId).order('created_at', { ascending: false }).limit(1)
    if (error) throw error
    return (data?.[0] || null) as PropertyVerification | null
  },
  setPropertyStatus: async (propertyId: string, status: PropertyVerification['status'], notes?: string) => {
    const { data, error } = await supabase
      .from('property_verifications')
      .upsert({ property_id: propertyId, status, notes, verified_at: status === 'verified' ? new Date().toISOString() : null } as never, { onConflict: 'property_id' })
      .select()
      .single()
    if (error) throw error
    return data as unknown as PropertyVerification
  },
  getForOwner: async (ownerId: string) => {
    const { data, error } = await supabase.from('owner_verifications').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }).limit(1)
    if (error) throw error
    return (data?.[0] || null) as OwnerVerification | null
  },
  setOwnerStatus: async (ownerId: string, status: OwnerVerification['status'], notes?: string) => {
    const { data, error } = await supabase
      .from('owner_verifications')
      .upsert({ owner_id: ownerId, status, notes, verified_at: status === 'verified' ? new Date().toISOString() : null } as never, { onConflict: 'owner_id' })
      .select()
      .single()
    if (error) throw error
    return data as unknown as OwnerVerification
  },
}

export const maintenanceApi = {
  comment: async (comment: Partial<MaintenanceComment>) => {
    const { data, error } = await supabase.from('maintenance_comments').insert(comment as never).select().single()
    if (error) throw error
    return data as unknown as MaintenanceComment
  },
  listComments: async (requestId: string) => {
    const { data, error } = await supabase.from('maintenance_comments').select('*').eq('request_id', requestId).order('created_at')
    if (error) throw error
    return (data || []) as unknown as MaintenanceComment[]
  },
  assign: async (assignment: Partial<MaintenanceAssignment>) => {
    const { data, error } = await supabase.from('maintenance_assignments').insert(assignment as never).select().single()
    if (error) throw error
    return data as unknown as MaintenanceAssignment
  },
  listAssignments: async (requestId: string) => {
    const { data, error } = await supabase.from('maintenance_assignments').select('*').eq('request_id', requestId)
    if (error) throw error
    return (data || []) as unknown as MaintenanceAssignment[]
  },
}

export const renewalApi = {
  listForUser: async (userId: string) => {
    const { data, error } = await supabase.from('lease_renewals').select('*, contract:contracts(*)').or(`tenant_id.eq.${userId},owner_id.eq.${userId}`).order('offered_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as (LeaseRenewal & { contract?: Contract })[]
  },
  respond: async (id: string, status: LeaseRenewal['status']) => {
    const { data, error } = await supabase.from('lease_renewals').update({ status, responded_at: new Date().toISOString() } as never).eq('id', id).select().single()
    if (error) throw error
    return data as unknown as LeaseRenewal
  },
}

export const dataRequestApi = {
  create: async (req: Partial<DataRequest>) => {
    const { data, error } = await supabase.from('data_requests').insert(req as never).select().single()
    if (error) throw error
    return data as unknown as DataRequest
  },
  listForUser: async (userId: string) => {
    const { data, error } = await supabase.from('data_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as DataRequest[]
  },
}

export const consentApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase.from('consent_records').select('*').eq('user_id', userId)
    if (error) throw error
    return (data || []) as unknown as ConsentRecord[]
  },
  grant: async (userId: string, purpose: string) => {
    const { data, error } = await supabase.from('consent_records').insert({ user_id: userId, purpose, granted: true } as never).select().single()
    if (error) throw error
    return data as unknown as ConsentRecord
  },
  revoke: async (id: string) => {
    const { error } = await supabase.from('consent_records').update({ granted: false, revoked_at: new Date().toISOString() } as never).eq('id', id)
    if (error) throw error
  },
}

export const savedSearchApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase.from('saved_searches').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as SavedSearch[]
  },
  save: async (search: Partial<SavedSearch>) => {
    const { data, error } = await supabase.from('saved_searches').insert(search as never).select().single()
    if (error) throw error
    return data as unknown as SavedSearch
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('saved_searches').delete().eq('id', id)
    if (error) throw error
  },
}
