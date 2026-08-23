import { supabase } from './supabase'
import { createAuditLog } from './audit'
import type {
  Profile, Property, Message, PropertyUnit, RentalApplication, DataRequest, ConsentRecord,
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
    let query = supabase.from('properties').select('*, images:property_images(*), reviews(*), videos:property_videos(*)')
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return
        // Handle bedrooms "5+" as gte(5) — eq("5+") is invalid for integer column and causes 400
        if (key === 'bedrooms' && String(value) === '5+') {
          query = query.gte(key, 5)
        } else if (['province', 'district', 'sector', 'cell', 'village', 'category', 'property_type'].includes(key)) {
          // Use case-insensitive contains to match DB values like "Western Province" vs filter "western", "Rent" vs "rent"
          query = query.ilike(key, `%${value}%`)
        } else {
          query = query.eq(key, value)
        }
      })
    }
    // explicit limit to avoid silent 1000-row truncation
    const { data, error } = await query.order('created_at', { ascending: false }).limit(1000)
    if (error) throw error
    return (data || []) as unknown as Property[]
  },
  get: async (id: string) => {
    const safeProfileCols = 'id, user_id, full_name, avatar_url, is_verified, province, district, sector, created_at'
    const { data, error } = await supabase
      .from('properties')
      .select(`*, images:property_images(*), videos:property_videos(*), reviews(*, user:profiles(${safeProfileCols}))`)
      .eq('id', id)
      .single()
    if (error) throw error
    const property = data as unknown as Property
    if (property.owner_id) {
      const { data: owner } = await supabase.from('profiles').select(safeProfileCols).eq('user_id', property.owner_id).single()
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
