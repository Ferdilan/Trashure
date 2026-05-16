import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("⚠️ SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env");
}

// Gunakan Service Role Key untuk operasi admin jika diperlukan,
// atau hanya untuk verifikasi token
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
