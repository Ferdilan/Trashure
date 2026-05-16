'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Package, Coins, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  interface UserProfile {
    name: string;
    role: string;
    wallet?: {
      balance: number;
    };
  }

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const res = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setProfile(data.data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Memuat data dashboard...</div>;
  if (!profile) return <div>Gagal memuat profil</div>;

  const isPemilik = profile.role === 'PEMILIK';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Halo, {profile.name}! 👋</h1>
        <p className="text-muted-foreground mt-1">
          {isPemilik 
            ? 'Pantau aktivitas penjualan sampah Anda hari ini.' 
            : 'Ringkasan aktivitas pengambilan sampah Anda.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Wallet</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {(profile.wallet?.balance || 0).toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bisa ditarik kapan saja
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total {isPemilik ? 'Penjualan' : 'Pembelian'}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bulan ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isPemilik ? 'Listing Aktif' : 'Tugas Selesai'}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isPemilik ? 'Menunggu tawaran' : 'Total diselesaikan'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Aksi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Perlu perhatian Anda
            </p>
          </CardContent>
        </Card>
      </div>

      {isPemilik && (
        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Punya sampah yang siap dijual?</h2>
            <p className="text-muted-foreground mt-2">
              Buat listing baru sekarang dan biarkan pengepul di sekitar Anda memberikan penawaran terbaik.
            </p>
          </div>
          <Button size="lg" className="shrink-0" onClick={() => window.location.href='/dashboard/listings/new'}>
            Buat Listing Baru
          </Button>
        </div>
      )}
    </div>
  );
}
