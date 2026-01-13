import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqfcfqflodpewdssicak.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2par32BiPa4FahajE_7vog_XbZ46--K'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
