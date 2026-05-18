
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Weight, Clock, Search, Filter, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeedPage() {
  interface ListingData {
    id: string;
    title: string;
    estimatedWeight: number;
    status: string;
    user: { name: string };
    category: { name: string };
    createdAt: string;
    images?: string[];
  }

  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/listings?status=TERSEDIA`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setListings(data.data);
      }
    } catch (e) {
      console.error(e);
      // Fallback Mock Data for UI presentation
      setListings([
        {
          id: '1',
          title: 'Kardus Bekas Pindahan Banyak',
          estimatedWeight: 15.5,
          status: 'TERSEDIA',
          user: { name: 'Budi Santoso' },
          category: { name: 'Kertas & Kardus' },
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Botol Plastik Air Mineral',
          estimatedWeight: 5,
          status: 'TERSEDIA',
          user: { name: 'Siti Aminah' },
          category: { name: 'Plastik' },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff/60)} jam lalu`;
    return `${Math.floor(diff/1440)} hari lalu`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cari Sampah Sekitar</h1>
          <p className="text-muted-foreground mt-1">Temukan dan berikan penawaran untuk sampah daur ulang di area Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari jenis sampah..." 
              className="h-10 pl-9 pr-4 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-[250px]"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 h-10 w-10">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-xl" />
              <CardContent className="p-5 h-32" />
            </Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border">
          <p className="text-muted-foreground">Belum ada listing sampah tersedia saat ini.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:border-primary/50 transition duration-300 group">
              <div className="h-48 bg-muted relative overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title} 
                    className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm">Tanpa Foto</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                  {listing.category?.name || 'Kategori'}
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition">
                    {listing.title}
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 shrink-0" />
                    <span>Estimasi: <span className="font-medium text-foreground">{listing.estimatedWeight} kg</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">± 2.5 km dari lokasi Anda</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{timeAgo(listing.createdAt)} oleh {listing.user?.name}</span>
                  </div>
                </div>
                <Link to={`/dashboard/listings/${listing.id}`}>
                  <Button className="w-full">
                    Lihat & Berikan Penawaran
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
