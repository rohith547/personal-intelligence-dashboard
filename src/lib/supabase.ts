/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ?? 'https://memiakngaeadoenvmxnh.supabase.co'
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
  ?? 'sb_publishable_o5fvv7D7P3fe73XLWfggtg_s5B51NpX'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)