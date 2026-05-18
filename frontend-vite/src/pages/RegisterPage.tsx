
import { useState, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {  useNavigate, useSearchParams  } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

function RegisterForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'PEMILIK';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Daftar di Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      try {
        // 2. Sinkronisasi ke Backend Node.js
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.session?.access_token}`
          },
          body: JSON.stringify({ name, role, phoneNumber })
        });

        if (!res.ok) {
          throw new Error('Gagal sinkronisasi profil');
        }

        navigate('/dashboard');
      } catch (err: unknown) {
        const e = err as Error;
        setError(e.message || 'Terjadi kesalahan saat menyimpan profil');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-sm border">
      <div className="flex justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-xl flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary">Trashure</span>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-center mb-2">Buat Akun Baru</h1>
      <p className="text-center text-muted-foreground mb-8">Bergabung dan mulai ubah sampah jadi rupiah</p>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Nama Lengkap</label>
          <input 
            type="text"
            required
            className="w-full h-11 rounded-lg border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email</label>
          <input 
            type="email"
            required
            className="w-full h-11 rounded-lg border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Nomor WhatsApp</label>
          <input 
            type="tel"
            required
            placeholder="Contoh: 08123456789"
            className="w-full h-11 rounded-lg border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Password</label>
          <input 
            type="password"
            required
            minLength={6}
            className="w-full h-11 rounded-lg border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Daftar Sebagai</label>
          <div className="grid grid-cols-2 gap-3">
            <div 
              className={`border rounded-lg p-3 text-center cursor-pointer transition ${role === 'PEMILIK' ? 'border-primary bg-primary/5 text-primary font-medium' : 'hover:border-primary/50 text-muted-foreground'}`}
              onClick={() => setRole('PEMILIK')}
            >
              Pemilik Sampah
            </div>
            <div 
              className={`border rounded-lg p-3 text-center cursor-pointer transition ${role === 'PENGEPUL' ? 'border-primary bg-primary/5 text-primary font-medium' : 'hover:border-primary/50 text-muted-foreground'}`}
              onClick={() => setRole('PENGEPUL')}
            >
              Mitra Pengepul
            </div>
          </div>
        </div>
        <Button type="submit" className="w-full h-11 mt-4" disabled={loading}>
          {loading ? 'Memproses...' : 'Daftar Sekarang'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Masuk
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-12">
      <Suspense fallback={<div className="w-full max-w-md text-center text-muted-foreground">Memuat form pendaftaran...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
