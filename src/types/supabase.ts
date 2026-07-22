export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          phone: string | null
          role: string
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
        Insert: {
          id: string
          user_id: string
          full_name: string
          email: string
          phone?: string | null
          role?: string
          avatar_url?: string | null
          national_id?: string | null
          province?: string | null
          district?: string | null
          sector?: string | null
          cell?: string | null
          village?: string | null
          address?: string | null
          bio?: string | null
          is_verified?: boolean
          is_suspended?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          role?: string
          avatar_url?: string | null
          national_id?: string | null
          province?: string | null
          district?: string | null
          sector?: string | null
          cell?: string | null
          village?: string | null
          address?: string | null
          bio?: string | null
          is_verified?: boolean
          is_suspended?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
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
          province: string | null
          district: string | null
          sector: string | null
          cell: string | null
          village: string | null
          latitude: number | null
          longitude: number | null
          status: string
          is_featured: boolean
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          category?: string
          property_type: string
          bedrooms?: number
          bathrooms?: number
          kitchen?: number
          parking?: boolean
          balcony?: boolean
          garden?: boolean
          swimming_pool?: boolean
          security?: boolean
          internet?: boolean
          water?: boolean
          electricity?: boolean
          furnished?: boolean
          price: number
          deposit?: number | null
          province?: string | null
          district?: string | null
          sector?: string | null
          cell?: string | null
          village?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: string
          is_featured?: boolean
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          category?: string
          property_type?: string
          bedrooms?: number
          bathrooms?: number
          kitchen?: number
          parking?: boolean
          balcony?: boolean
          garden?: boolean
          swimming_pool?: boolean
          security?: boolean
          internet?: boolean
          water?: boolean
          electricity?: boolean
          furnished?: boolean
          price?: number
          deposit?: number | null
          province?: string | null
          district?: string | null
          sector?: string | null
          cell?: string | null
          village?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: string
          is_featured?: boolean
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'properties_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          url: string
          is_floor_plan: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          is_floor_plan?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          is_floor_plan?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'property_images_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          }
        ]
      }
      property_videos: {
        Row: {
          id: string
          property_id: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'property_videos_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          }
        ]
      }
      amenities: {
        Row: {
          id: string
          property_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'amenities_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          tenant_id: string
          owner_id: string
          status: string
          visit_date: string | null
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          tenant_id: string
          owner_id: string
          status?: string
          visit_date?: string | null
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          tenant_id?: string
          owner_id?: string
          status?: string
          visit_date?: string | null
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      payments: {
        Row: {
          id: string
          booking_id: string | null
          payer_id: string
          payee_id: string
          amount: number
          currency: string
          method: string
          status: string
          transaction_id: string | null
          receipt_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          payer_id: string
          payee_id: string
          amount: number
          currency?: string
          method: string
          status?: string
          transaction_id?: string | null
          receipt_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          payer_id?: string
          payee_id?: string
          amount?: number
          currency?: string
          method?: string
          status?: string
          transaction_id?: string | null
          receipt_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_payer_id_fkey'
            columns: ['payer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_payee_id_fkey'
            columns: ['payee_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          property_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'favorites_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'favorites_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          }
        ]
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          property_id: string | null
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          property_id?: string | null
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          property_id?: string | null
          content?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_receiver_id_fkey'
            columns: ['receiver_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string | null
          type: string
          is_read: boolean
          data: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body?: string | null
          type?: string
          is_read?: boolean
          data?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string | null
          type?: string
          is_read?: boolean
          data?: Record<string, unknown> | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      maintenance_requests: {
        Row: {
          id: string
          property_id: string
          tenant_id: string
          title: string
          description: string | null
          priority: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          tenant_id: string
          title: string
          description?: string | null
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          tenant_id?: string
          title?: string
          description?: string | null
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'maintenance_requests_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'maintenance_requests_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      complaints: {
        Row: {
          id: string
          user_id: string
          subject: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'complaints_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      contracts: {
        Row: {
          id: string
          booking_id: string | null
          tenant_id: string
          owner_id: string
          property_id: string
          start_date: string
          end_date: string
          monthly_rent: number
          deposit_amount: number
          status: string
          document_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          tenant_id: string
          owner_id: string
          property_id: string
          start_date: string
          end_date: string
          monthly_rent: number
          deposit_amount: number
          status?: string
          document_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          tenant_id?: string
          owner_id?: string
          property_id?: string
          start_date?: string
          end_date?: string
          monthly_rent?: number
          deposit_amount?: number
          status?: string
          document_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contracts_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contracts_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contracts_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contracts_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          }
        ]
      }
      cms_pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: string | null
          meta_title: string | null
          meta_description: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content?: string | null
          meta_title?: string | null
          meta_description?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string | null
          meta_title?: string | null
          meta_description?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          id: string
          email: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Record<string, unknown> | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Record<string, unknown> | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Record<string, unknown> | null
          ip_address?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
