import { supabase } from './supabase'
import type { Profile, Property, Booking, Review, Favorite, Message, Notification } from '@/types'

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
    const { data, error } = await supabase.from('properties').select('*, images:property_images(*), owner:profiles(*), reviews(*, user:profiles(*))').eq('id', id).single()
    if (error) throw error
    return data as unknown as Property
  },
  create: async (property: Partial<Property>) => {
    const { data, error } = await supabase.from('properties').insert(property as never).select().single()
    if (error) throw error
    return data as unknown as Property
  },
  update: async (id: string, updates: Partial<Property>) => {
    const { data, error } = await supabase.from('properties').update(updates as never).eq('id', id).select().single()
    if (error) throw error
    return data as unknown as Property
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) throw error
  },
}

export const bookingApi = {
  list: async (userId: string, role: string) => {
    const column = role === 'owner' ? 'owner_id' : 'tenant_id'
    const { data, error } = await supabase.from('bookings').select('*, property:properties(*)').eq(column, userId).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as unknown as Booking[]
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
    return data as unknown as Review
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
}
