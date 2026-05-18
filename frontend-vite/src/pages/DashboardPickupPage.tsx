
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, CheckCircle2, Navigation } from 'lucide-react';

export default function PickupManagementPage() {
  interface PickupData {
    id: string;
    listing?: {
      title: string;
      user?: {
        name: string;
        phoneNumber?: string;
      }
    };
    status: string;
    totalPrice?: number;
    updatedAt?: string;
  }

  const [pickups, setPickups] = useState<PickupData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPickups = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        // Filter out completed ones, keep only active pickups
        const activePickups = data.data.filter((t: PickupData) => t.status !== 'SELESAI' && t.status !== 'BATAL');
        setPickups(activePickups);
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setPickups([
        {
          id: '1',
          listing: {
            title: 'Botol Plastik Air Mineral 10 Kg',
            user: { name: 'Budi Santoso', phoneNumber: '08123456789' }
          },
          status: 'JADWAL_PICKUP',
          totalPrice: 35000,
          updatedAt: new Date().toISOString()
        }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPickups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      // Refresh
      fetchPickups();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Pickup</h1>
        <p className="text-muted-foreground mt-1">Daftar lokasi sampah yang siap untuk Anda jemput hari ini.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Card className="animate-pulse h-32 bg-muted" />
        </div>
      ) : pickups.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed rounded-2xl">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold mb-2">Tidak ada jadwal pickup</h3>
          <p className="text-muted-foreground">Anda belum memiliki tugas penjemputan sampah yang aktif.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pickups.map((pickup) => (
            <Card key={pickup.id} className="overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">
                      {pickup.status === 'DEAL' ? 'Siap Dijemput' : pickup.status === 'TRANSIT' ? 'Dalam Perjalanan' : 'Verifikasi'}
                    </div>
                    <h3 className="font-semibold text-lg">{pickup.listing?.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Nilai Transaksi</div>
                    <div className="font-bold">Rp {pickup.totalPrice?.toLocaleString('id-ID') || '-'}</div>
                  </div>
                </div>

                <div className="space-y-3 bg-muted/50 p-4 rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-full border shadow-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{pickup.listing?.user?.name}</p>
                      <p className="text-muted-foreground">Jalan Sudirman No. 1, Jakarta</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-full border shadow-sm">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{pickup.listing?.user?.phoneNumber || 'Tidak ada nomor'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Navigation className="h-4 w-4" /> Arahkan
                  </Button>
                  
                  {pickup.status === 'DEAL' && (
                    <Button className="flex-1" onClick={() => handleUpdateStatus(pickup.id, 'TRANSIT')}>
                      Mulai Jalan
                    </Button>
                  )}
                  {pickup.status === 'TRANSIT' && (
                    <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white" onClick={() => handleUpdateStatus(pickup.id, 'VERIFIKASI')}>
                      Tiba di Lokasi
                    </Button>
                  )}
                  {pickup.status === 'VERIFIKASI' && (
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(pickup.id, 'SELESAI')}>
                      Selesaikan Pickup
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
