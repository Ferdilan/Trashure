
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, Scale, DollarSign } from 'lucide-react';

export default function AdminDashboardPage() {
  interface StatsData {
    totalUsers: number;
    totalTransactions: number;
    totalVolume: number;
    totalRevenue: number;
  }

  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setStats(data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Ringkasan aktivitas platform Trashure.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi Selesai</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume (Kg)</CardTitle>
            <Scale className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVolume.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai Transaksi</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-card border rounded-xl p-6 h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Grafik Volume Sampah per Bulan (Placeholder)</p>
        </div>
        <div className="bg-card border rounded-xl p-6 h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Log Aktivitas Terbaru (Placeholder)</p>
        </div>
      </div>
    </div>
  );
}
