import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      gastos: {
        Row: {
          id: number
          descripcion: string
          monto: number
          categoria: string
          pagado_por: string
          fecha: string
          created_at: string
        }
        Insert: {
          descripcion: string
          monto: number
          categoria: string
          pagado_por: string
          fecha: string
        }
        Update: {
          descripcion?: string
          monto?: number
          categoria?: string
          pagado_por?: string
          fecha?: string
        }
      }
      objetivos: {
        Row: {
          id: number
          nombre: string
          monto_total: number
          monto_ahorrado: number
          fecha_objetivo: string
          completado: boolean
          created_at: string
          descripcion: string
        }
        Insert: {
          nombre: string
          monto_total: number
          monto_ahorrado?: number
          fecha_objetivo: string
          completado?: boolean
          descripcion?: string
        }
        Update: {
          nombre?: string
          monto_total?: number
          monto_ahorrado?: number
          fecha_objetivo?: string
          completado?: boolean
          descripcion?: string
        }
      }
      lugares: {
        Row: {
          id: number
          nombre: string
          categoria: string
          ciudad: string
          notas: string
          puntaje: number
          visitado: boolean
          created_at: string
        }
        Insert: {
          nombre: string
          categoria: string
          ciudad: string
          notas?: string
          puntaje: number
          visitado: boolean
        }
        Update: {
          nombre?: string
          categoria?: string
          ciudad?: string
          notas?: string
          puntaje?: number
          visitado?: boolean
        }
      }
      eventos_calendario: {
        Row: {
          id: number
          titulo: string
          descripcion: string
          tipo: string
          persona: string
          fecha_inicio: string
          fecha_fin?: string
          hora_inicio?: string
          hora_fin?: string
          ubicacion: string
          notas: string
          color: string
          created_at: string
        }
        Insert: {
          titulo: string
          descripcion?: string
          tipo: string
          persona: string
          fecha_inicio: string
          fecha_fin?: string
          hora_inicio?: string
          hora_fin?: string
          ubicacion?: string
          notas?: string
          color?: string
        }
        Update: {
          titulo?: string
          descripcion?: string
          tipo?: string
          persona?: string
          fecha_inicio?: string
          fecha_fin?: string
          hora_inicio?: string
          hora_fin?: string
          ubicacion?: string
          notas?: string
          color?: string
        }
      }
    }
  }
}
