'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-sm border">
        <div className="flex justify-center mb-8">
          <div className="bg-primary/10 p-3 rounded-xl flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary">Trashure</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Selamat Datang Kembali</h1>
        <p className="text-center text-muted-foreground mb-8">Masuk ke akun Anda untuk melanjutkan</p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <input 
              type="password"
              required
              className="w-full h-11 rounded-lg border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
