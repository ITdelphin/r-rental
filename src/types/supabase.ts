export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      properties: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      property_images: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      property_videos: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      amenities: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      bookings: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      payments: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      reviews: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      favorites: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      messages: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      notifications: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      maintenance_requests: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      complaints: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      contracts: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      cms_pages: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      settings: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      newsletters: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      audit_logs: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
