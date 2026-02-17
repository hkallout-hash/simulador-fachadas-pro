import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = getSupabaseClient()

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          nome: string
          whatsapp: string
          cidade: string
          cep: string
          segmento: string
          prazo: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          whatsapp: string
          cidade: string
          cep: string
          segmento: string
          prazo: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          whatsapp?: string
          cidade?: string
          cep?: string
          segmento?: string
          prazo?: string
          created_at?: string
        }
      }
      simulations: {
        Row: {
          id: string
          token: string
          lead_id: string | null
          protocol: string | null
          original_image_url: string
          result_urls: string[]
          bbox: {
            x: number
            y: number
            width: number
            height: number
          }
          reference_box: {
            x: number
            y: number
            width: number
            height: number
          } | null
          reference_real_width_m: number | null
          derived_width_m: number
          derived_height_m: number
          derived_area_m2: number
          confidence: string
          validation_urls: string[]
          validation_video_url: string | null
          acm_config: {
            cor: string
            acabamento: string
          }
          letreiro_config: {
            texto: string
            cor: string
            material: string
            espessura: string
          }
          iluminacao_config: {
            tipo: string
            cor: string
            intensidade: string
            modo_noturno: boolean
          }
          logo_url: string | null
          acm_m2: number
          perimeter_m: number
          letters_linear_m: number
          led_m: number
          spots_qty: number
          price_economico: number
          price_intermediario: number
          price_premium: number
          summary_text: string
          created_at: string
        }
        Insert: any
        Update: any
      }
      pricing_config: {
        Row: {
          id: string
          acm_m2: number
          estrutura_m2: number
          letra_linear_m: number
          led_m: number
          spot_unit: number
          instalacao_base: number
          frete_km: number
          markup_economico: number
          markup_intermediario: number
          markup_premium: number
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
      protocol_counter: {
        Row: {
          id: string
          counter: number
          updated_at: string
        }
        Insert: any
        Update: any
      }
    }
  }
}
