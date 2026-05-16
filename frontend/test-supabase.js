require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variabel environment NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan di .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Mencoba koneksi ke Supabase...");
  try {
    // Ping Supabase dengan mencoba query ke tabel yang mungkin belum ada
    // Supabase REST API merespon jika url dan key valid
    const { data, error } = await supabase.from('User').select('id').limit(1);
    
    // Error "Could not find the table" berarti API key valid dan PostgREST merespon
    if (error && !error.message.includes('Could not find the table') && error.code !== '42P01') { 
      console.error("❌ Gagal terkoneksi ke Supabase:", error.message);
    } else {
      console.log("✅ Berhasil terkoneksi ke Supabase Project!");
    }
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat menghubungi Supabase:", error);
  }
}

main();
