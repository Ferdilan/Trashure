'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, MapPin, Scale, Calendar, User, 
  Phone, Tag, Clock, Package, Image as ImageIcon 
} from 'lucide-react';

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  estimatedWeight: number;
  status: string;
  images: string[];
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    phoneNumber: string | null;
  };
  category: {
    id: string;
    name: string;
  };
  offers: Array<{
    id: string;
    pricePerKg: number;
    status: string;
    createdAt: string;
    pengepul: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  }>;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    if (!listingId) return;

    const fetchListing = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const res = await fetch(`http://localhost:5000/api/listings/${listingId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        const json = await res.json();
        if (json.status === 'success') {
          setListing(json.data);
        } else {
          throw new Error(json.message || 'Gagal memuat listing');
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan jaringan');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl inline-block mb-4">
          {error || 'Listing tidak ditemukan'}
        </div>
        <div>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    TERSEDIA: 'bg-green-100 text-green-800 border-green-200',
    PENAWARAN: 'bg-blue-100 text-blue-800 border-blue-200',
    TRANSAKSI: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    SELESAI: 'bg-gray-100 text-gray-800 border-gray-200',
    BATAL: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Button 
        onClick={() => router.back()} 
        variant="ghost" 
        className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Kiri: Foto */}
        <div className="space-y-4">
          <div className="bg-muted rounded-2xl overflow-hidden aspect-square relative border flex items-center justify-center">
            {listing.images && listing.images.length > 0 ? (
              <img 
                src={listing.images[currentImageIdx]} 
                alt={listing.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center">
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <span>Tidak ada foto</span>
              </div>
            )}
            
            {/* Status Badge */}
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[listing.status] || 'bg-secondary'}`}>
              {listing.status}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {listing.images && listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 ${currentImageIdx === idx ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Detail Informasi */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{listing.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {new Date(listing.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center"><Tag className="w-4 h-4 mr-1.5" /> {listing.category.name}</span>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary" /> Detail Sampah
            </h3>
            
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Estimasi Berat</div>
                <div className="font-medium flex items-center">
                  <Scale className="w-4 h-4 mr-1.5 text-muted-foreground" /> {listing.estimatedWeight} Kg
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Kategori</div>
                <div className="font-medium">{listing.category.name}</div>
              </div>
            </div>

            <div className="pt-2 border-t mt-2">
              <div className="text-sm text-muted-foreground mb-1">Deskripsi & Kondisi</div>
              <p className="text-sm leading-relaxed">{listing.description || 'Tidak ada deskripsi tambahan.'}</p>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Informasi Pengguna</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {listing.user.avatarUrl ? (
                  <img src={listing.user.avatarUrl} alt={listing.user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <div className="font-medium">{listing.user.name}</div>
                <div className="text-sm text-muted-foreground flex items-center mt-0.5">
                  <Phone className="w-3.5 h-3.5 mr-1" /> {listing.user.phoneNumber || 'Tidak ada nomor'}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 mt-4 pt-4 border-t">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Lokasi Penjemputan</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {listing.latitude && listing.longitude 
                    ? `Lat: ${listing.latitude}, Lng: ${listing.longitude} (Titik GPS)`
                    : 'Menggunakan alamat profil pengguna'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Penawaran (Offers) */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Penawaran Masuk ({listing.offers.length})</h2>
        
        {listing.offers.length === 0 ? (
          <div className="bg-muted/50 border border-dashed rounded-2xl p-12 text-center">
            <div className="inline-flex bg-background p-4 rounded-full shadow-sm mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Belum ada penawaran</h3>
            <p className="text-muted-foreground text-sm">Pengepul belum memberikan penawaran harga untuk listing ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listing.offers.map((offer) => (
              <div key={offer.id} className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{offer.pengepul.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(offer.createdAt).toLocaleDateString('id-ID')}</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                    {offer.status}
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="text-sm text-muted-foreground mb-1">Penawaran Harga</div>
                  <div className="text-lg font-bold text-primary">Rp {offer.pricePerKg.toLocaleString('id-ID')} <span className="text-sm font-normal text-muted-foreground">/ Kg</span></div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Estimasi Total: Rp {(offer.pricePerKg * listing.estimatedWeight).toLocaleString('id-ID')}
                  </div>
                </div>
                
                {listing.status === 'TERSEDIA' && offer.status === 'MENUNGGU' && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">Tolak</Button>
                    <Button size="sm" className="w-full text-xs h-8">Terima</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
