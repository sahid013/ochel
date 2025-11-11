export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          id: string
          name: string
          slug: string
          email: string
          phone: string
          owner_id: string
          logo_url: string | null
          primary_color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email: string
          phone: string
          owner_id: string
          logo_url?: string | null
          primary_color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string
          phone?: string
          owner_id?: string
          logo_url?: string | null
          primary_color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      closed_dates: {
        Row: {
          id: string
          date: string
          is_closed: boolean
          reason: string | null
          opening_time: string
          closing_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          is_closed?: boolean
          reason?: string | null
          opening_time?: string
          closing_time?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          is_closed?: boolean
          reason?: string | null
          opening_time?: string
          closing_time?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          reservation_date: string
          reservation_time: string
          guests: number
          special_requests: string | null
          status: 'confirmed' | 'cancelled' | 'completed' | 'pending'
          requires_confirmation: boolean
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          reservation_date: string
          reservation_time: string
          guests: number
          special_requests?: string | null
          status?: 'confirmed' | 'cancelled' | 'completed' | 'pending'
          requires_confirmation?: boolean
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          reservation_date?: string
          reservation_time?: string
          guests?: number
          special_requests?: string | null
          status?: 'confirmed' | 'cancelled' | 'completed' | 'pending'
          requires_confirmation?: boolean
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          title: string
          title_en: string | null
          title_it: string | null
          title_es: string | null
          text: string | null
          text_en: string | null
          text_it: string | null
          text_es: string | null
          order: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          id?: number
          title: string
          title_en?: string | null
          title_it?: string | null
          title_es?: string | null
          text?: string | null
          text_en?: string | null
          text_it?: string | null
          text_es?: string | null
          order?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          id?: number
          title?: string
          title_en?: string | null
          title_it?: string | null
          title_es?: string | null
          text?: string | null
          text_en?: string | null
          text_it?: string | null
          text_es?: string | null
          order?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
          created_by?: number | null
          updated_by?: number | null
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          id: number
          category_id: number
          title: string
          title_en: string | null
          title_it: string | null
          title_es: string | null
          text: string | null
          text_en: string | null
          text_it: string | null
          text_es: string | null
          order: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          id?: number
          category_id: number
          title: string
          title_en?: string | null
          title_it?: string | null
          title_es?: string | null
          text?: string | null
          text_en?: string | null
          text_it?: string | null
          text_es?: string | null
          order?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          id?: number
          category_id?: number
          title?: string
          title_en?: string | null
          title_it?: string | null
          title_es?: string | null
          text?: string | null
          text_en?: string | null
          text_it?: string | null
          text_es?: string | null
          order?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
          created_by?: number | null
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_items: {
        Row: {
          id: number
          title: string
          title_en: string | null
          title_it: string | null
          title_es: string | null
          text: string | null
          text_en: string | null
          text_it: string | null
          text_es: string | null
          description: string
          description_en: string | null
          description_it: string | null
          description_es: string | null
          image_path: string | null
          model_3d_url: string | null
          redirect_3d_url: string | null
          additional_image_url: string | null
          is_special: boolean
          price: number
          subcategory_id: number
          order: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          id?: number
          title: string
          title_en?: string | null
          title_it?: string | null
          title_es?: string | null
          text?: string | null
          text_en?: string | null
          text_it?: string | null
          text_es?: string | null
          description: string
          description_en?: string | null
          description_it?: string | null
          description_es?: string | null
          image_path?: string | null
          model_3d_url?: string | null
          redirect_3d_url?: string | null
          additional_image_url?: string | null
          is_special?: boolean
          price: number
          subcategory_id: number
          order?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          id?: number
          title?: string
          title_en?: string | null
          title_it?: string | null
          title_es?: string | null
          text?: string | null
          text_en?: string | null
          text_it?: string | null
          text_es?: string | null
          description?: string
          description_en?: string | null
          description_it?: string | null
          description_es?: string | null
          image_path?: string | null
          model_3d_url?: string | null
          redirect_3d_url?: string | null
          additional_image_url?: string | null
          is_special?: boolean
          price?: number
          subcategory_id?: number
          order?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
          created_by?: number | null
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_subcategory_id_fkey"
            columns: ["subcategory_id"]
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          }
        ]
      }
      addons: {
        Row: {
          id: number
          title: string
          title_en: string | null
          title_it: string | null
          title_es: string | null
          description: string | null
          description_en: string | null
          description_it: string | null
          description_es: string | null
          image_path: string | null
          price: number
          category_id: number | null
          subcategory_id: number | null
          order: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
          created_by: number | null
          updated_by: number | null
        }
        Insert: {
          id?: number
          title: string
          title_en?: string | null
          title_it?: string | null
          title_es?: string | null
          description?: string | null
          description_en?: string | null
          description_it?: string | null
          description_es?: string | null
          image_path?: string | null
          price: number
          category_id?: number | null
          subcategory_id?: number | null
          order?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
          created_by?: number | null
          updated_by?: number | null
        }
        Update: {
          id?: number
          title?: string
          title_en?: string | null
          title_it?: string | null
          title_es?: string | null
          description?: string | null
          description_en?: string | null
          description_it?: string | null
          description_es?: string | null
          image_path?: string | null
          price?: number
          category_id?: number | null
          subcategory_id?: number | null
          order?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
          created_by?: number | null
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "addons_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addons_subcategory_id_fkey"
            columns: ["subcategory_id"]
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
