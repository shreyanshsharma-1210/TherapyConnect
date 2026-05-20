export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_name: string
          category: string
          content: string
          cover_image_url: string | null
          created_at: string
          deleted_at: string | null
          excerpt: string
          id: string
          is_featured: boolean
          published_at: string | null
          read_time: string | null
          slug: string
          status: Database['public']['Enums']['publish_status']
          tags: string[]
          title: string
          updated_at: string
          views: number
        }
      }
      bookings: {
        Row: {
          amount_inr: number
          booking_ref: string
          cancellation_reason: string | null
          cancelled_at: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          deleted_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: Database['public']['Enums']['payment_status']
          reason: string | null
          rescheduled_from: string | null
          service_duration: string
          service_id: string | null
          service_title: string
          session_date: string
          session_datetime: string | null
          session_mode: Database['public']['Enums']['session_mode']
          session_time: string
          status: Database['public']['Enums']['booking_status']
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
      }
      payments: {
        Row: {
          amount_inr: number
          booking_id: string
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          method: string | null
          paid_at: string | null
          provider: string | null
          provider_txn_id: string | null
          raw_response: Json | null
          receipt_url: string | null
          status: Database['public']['Enums']['payment_status']
          updated_at: string
          user_id: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database['public']['Enums']['app_role']
          timezone: string
          updated_at: string
        }
      }
      services: {
        Row: {
          created_at: string
          deleted_at: string | null
          display_order: number
          duration: string
          duration_minutes: number
          format: string[]
          full_description: string
          icon: string
          id: string
          is_active: boolean
          is_featured: boolean
          short_description: string
          slug: string
          title: string
          updated_at: string
        }
      }
      testimonials: {
        Row: {
          author_avatar: string | null
          author_name: string
          author_role: string | null
          content: string
          created_at: string
          deleted_at: string | null
          display_order: number
          id: string
          is_approved: boolean
          is_featured: boolean
          is_visible: boolean
          rating: number
          service_title: string | null
          updated_at: string
        }
      }
      therapist_availability: {
        Row: {
          available_date: string
          booked_slots: number
          created_at: string
          id: string
          level: string
          max_slots: number
          notes: string | null
          updated_at: string
        }
      }
    }
    Enums: {
      app_role: 'user' | 'admin'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled' | 'no_show'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'waived'
      publish_status: 'draft' | 'published' | 'archived'
      session_mode: 'video' | 'in_person' | 'phone'
    }
  }
}
