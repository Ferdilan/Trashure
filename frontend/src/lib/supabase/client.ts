import { createClient } from '@supabase/supabase-js'

// Memberikan nilai default ('placeholder') agar `next build` (proses prerendering)
// tidak crash saat environment variable belum tersedia (misal di CI/CD)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
