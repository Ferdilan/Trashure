
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, FileText, ChevronRight, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function MyListingsPage() {
  interface ListingData {
    id: string;
    title: string;
    estimatedWeight: number;
    status: string;
    category?: { name: string };
    createdAt?: string;
    images?: string[];
  }

  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Asumsi backend mengambil berdasarkan user yg login karena requireAuth middleware
      // Di API getListings kita mungkin perlu memfilter berdasarkan user.id di controller
      // Untuk MVP kita abaikan jika belum ada filternya dan ambil secara umum (Mocking)

      const res = await fetch('http://localhost:5000/api/listings?mine=true', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await res.json();

      if (data.status === 'success') {
        // Mock filter milik sendiri (frontend level)
        setListings(data.data);
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setListings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMyListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus listing ini?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`HTTP Error ${res.status}: Server tidak mengembalikan format JSON.`);
      }

      if (res.ok) {
        alert('Listing berhasil dihapus!');
        fetchMyListings();
      } else {
        alert(data?.message || 'Gagal menghapus listing');
      }
    } catch (e: any) {
      console.error(e);
      alert('Gagal Menghapus Listing: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Listing Saya</h1>
          <p className="text-muted-foreground mt-1">Kelola sampah yang Anda jual dan pantau penawaran yang masuk.</p>
        </div>
        <Link to="/dashboard/listings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Buat Listing
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse h-24 bg-muted" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed rounded-2xl flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Belum ada listing</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">Anda belum membuat penawaran penjualan sampah. Mulai jual sampah Anda sekarang.</p>
          <Link to="/dashboard/listings/new">
            <Button variant="outline">Mulai Buat Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:border-primary/40 transition">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-stretch">
                  <div className="w-full sm:w-40 h-32 sm:h-auto bg-muted shrink-0 flex items-center justify-center text-xs text-muted-foreground relative overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
                        <span>Tanpa Foto</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-medium">
                            {listing.category?.name}
                          </span>
                          <span>•</span>
                          <span>{listing.estimatedWeight} kg</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${listing.status === 'TERSEDIA' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            listing.status === 'PENAWARAN' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }
                        `}>
                          {listing.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Dibuat {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('id-ID') : 'Tidak diketahui'}
                      </div>
                      <div className="flex gap-2">
                        {(listing.status === 'TERSEDIA' || listing.status === 'PENAWARAN') && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteListing(listing.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Hapus
                          </Button>
                        )}
                        <Link to={`/dashboard/listings/${listing.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1 text-primary">
                            Lihat Detail <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
