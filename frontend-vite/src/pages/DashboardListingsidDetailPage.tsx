
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  expectedPrice: number | null;
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

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
}

interface TransactionDetail {
  id: string;
  status: string;
  finalWeight: number | null;
  totalPrice: number | null;
  pickupDate: string | null;
  pengepulId: string;
  pengepul: {
    name: string;
    phoneNumber: string | null;
  };
  listing: {
    id: string;
  };
}

export default function ListingDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [finalWeight, setFinalWeight] = useState('');
  
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  useEffect(() => {
    if (!listingId) return;

    const fetchListing = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const [listingRes, profileRes, transRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/listings/${listingId}`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/transactions`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          })
        ]);

        const listingJson = await listingRes.json();
        const profileJson = await profileRes.json();
        const transJson = await transRes.json();

        if (listingJson.status === 'success') {
          setListing(listingJson.data);
        } else {
          throw new Error(listingJson.message || 'Gagal memuat listing');
        }

        if (profileJson.status === 'success') {
          setCurrentUser(profileJson.data);
        }

        if (transJson.status === 'success') {
          const currentTrans = transJson.data.find((t: TransactionDetail) => t.listing.id === listingId);
          if (currentTrans) setTransaction(currentTrans);
        }
      } catch (err: unknown) {
        const errorVal = err as Error;
        setError(errorVal.message || 'Terjadi kesalahan jaringan');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleMakeOffer = async () => {
    if (!offerPrice) return alert('Harga penawaran harus diisi');

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          listingId,
          pricePerKg: offerPrice,
          message: offerMessage || 'Saya tertarik untuk mengambil sampah Anda.'
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Penawaran berhasil dikirim!');
        window.location.reload();
      } else {
        alert('Gagal mengirim penawaran: ' + data.message);
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectBuy = async () => {
    if (!listing?.expectedPrice) return;
    if (!window.confirm(`Apakah Anda setuju untuk langsung membeli sampah ini seharga Rp ${listing.expectedPrice.toLocaleString('id-ID')}/Kg? (Instant Deal)`)) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          listingId,
          isDirectBuy: true
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Pembelian Langsung Berhasil! Transaksi telah dibuat, silakan koordinasikan jadwal pickup.');
        window.location.reload();
      } else {
        alert('Gagal melakukan Pembelian Langsung: ' + data.message);
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOffer = async (offerId: string, status: 'DITERIMA' | 'DITOLAK') => {
    if (!window.confirm(`Apakah Anda yakin ingin ${status.toLowerCase()} penawaran ini?`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/offers/${offerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.status === 'success') {
        window.location.reload();
      } else {
        alert('Gagal memproses penawaran: ' + data.message);
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleUpdateTransaction = async (status: string) => {
    if (!transaction) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${transaction.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.status === 'success') {
        window.location.reload();
      } else {
        alert('Gagal mengupdate transaksi: ' + data.message);
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleSetSchedule = async () => {
    if (!transaction) return;
    if (!pickupDate || !pickupTime) return alert('Pilih tanggal dan waktu jemput');
    const combinedDate = new Date(`${pickupDate}T${pickupTime}`);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${transaction.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ pickupDate: combinedDate.toISOString() })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Jadwal berhasil diatur!');
        window.location.reload();
      } else {
        alert('Gagal mengatur jadwal: ' + data.message);
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const [isPaying, setIsPaying] = useState(false);

  const handleFinishTransaction = async () => {
    if (!transaction || !finalWeight) return alert('Masukkan berat aktual timbangan.');
    const acceptedOffer = listing?.offers.find(o => o.status === 'DITERIMA');
    if (!acceptedOffer) return;

    if (isPaying) return;
    setIsPaying(true);
    
    const pricePerKg = acceptedOffer.pricePerKg;
    const totalPrice = parseFloat(finalWeight) * pricePerKg;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. Dapatkan Token Midtrans
      const tokenRes = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${transaction.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ finalWeight, totalPrice })
      });
      const tokenData = await tokenRes.json();
      
      if (tokenData.status === 'success' && tokenData.data.token) {
        // 2. Tampilkan Popup Midtrans
        type SnapType = {
          pay: (token: string, options: {
            onSuccess: () => Promise<void>;
            onPending: () => void;
            onError: () => void;
            onClose: () => void;
          }) => void;
        };
        (window as unknown as { snap: SnapType }).snap.pay(tokenData.data.token, {
          onSuccess: async function() {
             // 3. Update status transaksi jadi selesai
             await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${transaction.id}/status`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ status: 'SELESAI', finalWeight, totalPrice })
             });
             alert('Pembayaran Berhasil & Transaksi Selesai!');
             window.location.reload();
          },
          onPending: function() {
             alert('Menunggu pembayaran Anda...');
             setIsPaying(false);
          },
          onError: function() {
             alert('Pembayaran gagal!');
             setIsPaying(false);
          },
          onClose: function() {
             setIsPaying(false);
          }
        });
      } else {
        alert('Gagal mendapatkan token pembayaran: ' + (tokenData.message || JSON.stringify(tokenData)));
        setIsPaying(false);
      }
    } catch (e: unknown) {
      console.error("Full Error:", e);
      const err = e as Error;
      alert('Terjadi kesalahan sistem: ' + err.message);
      setIsPaying(false);
    }
  };

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
          <Button onClick={() => navigate(-1)} variant="outline">
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
        onClick={() => navigate(-1)}
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
              {listing.expectedPrice && (
                <div className="col-span-2 pt-3 border-t border-dashed mt-2">
                  <div className="text-sm text-muted-foreground mb-1">Harga Beli Langsung (Expected Price)</div>
                  <div className="text-xl font-bold text-primary">
                    Rp {listing.expectedPrice.toLocaleString('id-ID')} <span className="text-sm font-normal text-muted-foreground">/ Kg</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Estimasi Total: Rp {(listing.expectedPrice * listing.estimatedWeight).toLocaleString('id-ID')}
                  </div>
                </div>
              )}
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

      {/* Bagian Penawaran / Transaksi */}
      {transaction ? (
        <div className="mt-10 bg-card border rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Informasi Penjemputan</h2>
          
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${
              transaction.status === 'SELESAI' ? 'bg-green-50 border-green-200 text-green-800' :
              'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              <div className="font-bold mb-1 flex items-center">
                <Package className="w-5 h-5 mr-2" /> 
                Status Penjemputan: {transaction.status === 'DEAL' ? 'JADWAL_PICKUP' : transaction.status}
              </div>
              {(transaction.status === 'JADWAL_PICKUP' || transaction.status === 'DEAL') && <p className="text-sm mt-2">Pengepul akan segera menuju lokasi Anda. Pastikan sampah sudah siap ditimbang.</p>}
              {transaction.status === 'TRANSIT' && <p className="text-sm mt-2">Pengepul sedang dalam perjalanan (On The Way) menuju lokasi Anda!</p>}
              {transaction.status === 'SELESAI' && <p className="text-sm mt-2">Transaksi ini telah selesai dengan berat akhir {transaction.finalWeight} Kg (Total: Rp {transaction.totalPrice?.toLocaleString('id-ID')}).</p>}
            </div>

            {/* Tampilkan kontak dan alamat yang saling menyilang */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-xl border">
                <div className="text-sm font-semibold mb-2">Kontak Pemilik</div>
                <div className="flex items-center text-sm text-muted-foreground"><User className="w-4 h-4 mr-2" /> {listing.user.name}</div>
                <div className="flex items-center text-sm text-muted-foreground mt-1"><Phone className="w-4 h-4 mr-2" /> {listing.user.phoneNumber || 'Belum ditambahkan'}</div>
                <div className="flex items-center text-sm text-muted-foreground mt-1"><MapPin className="w-4 h-4 mr-2" /> Sesuai alamat profil / GPS</div>
              </div>
              <div className="bg-muted/30 p-4 rounded-xl border">
                <div className="text-sm font-semibold mb-2">Kontak Pengepul</div>
                <div className="flex items-center text-sm text-muted-foreground"><User className="w-4 h-4 mr-2" /> {transaction.pengepul.name}</div>
                <div className="flex items-center text-sm text-muted-foreground mt-1"><Phone className="w-4 h-4 mr-2" /> {transaction.pengepul.phoneNumber || 'Belum ditambahkan'}</div>
              </div>
            </div>

            {/* Jadwal Penjemputan */}
            <div className="bg-muted/30 p-4 rounded-xl border">
              <div className="flex items-center font-bold mb-3">
                <Calendar className="w-5 h-5 mr-2 text-primary" /> Jadwal Penjemputan
              </div>
              {transaction.pickupDate ? (
                <div className="text-sm font-semibold text-primary bg-primary/10 inline-block px-3 py-1.5 rounded-md">
                  {new Date(transaction.pickupDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    Belum ada jadwal pasti. Silakan hubungi nomor kontak di atas (via Telepon/WhatsApp) untuk menyepakati jadwal penjemputan, lalu simpan kesepakatan jadwal tersebut di sini.
                  </p>
                  {((currentUser?.role === 'PEMILIK' && currentUser?.id === listing.user.id) || 
                    (currentUser?.role === 'PENGEPUL' && currentUser?.id === transaction.pengepulId)) && (
                    <div className="flex gap-2">
                      <input type="date" className="flex h-9 w-full max-w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                      <input type="time" className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
                      <Button size="sm" onClick={handleSetSchedule}>Simpan Jadwal</Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Aksi Pengepul */}
            {currentUser?.role === 'PENGEPUL' && currentUser?.id === transaction.pengepulId && (
              <div className="pt-4 border-t border-dashed">
                {(transaction.status === 'JADWAL_PICKUP' || transaction.status === 'DEAL') && (
                  <Button onClick={() => handleUpdateTransaction('TRANSIT')} className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-md text-white">
                    Mulai Pickup (On The Way)
                  </Button>
                )}

                {transaction.status === 'TRANSIT' && (
                  <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-5 space-y-4">
                    <div className="flex items-center font-bold text-primary">
                      <Scale className="w-5 h-5 mr-2" /> Verifikasi Berat Aktual (Selesai Pickup)
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Masukkan berat aktual hasil timbangan di lokasi untuk menghitung total pembayaran final.
                    </p>
                    <div>
                      <label className="block text-sm font-medium mb-1">Berat Aktual Timbangan (Kg)</label>
                      <input 
                        type="number" 
                        value={finalWeight}
                        onChange={(e) => setFinalWeight(e.target.value)}
                        className="w-full flex h-11 rounded-md border-2 border-input bg-background px-3 font-semibold focus-visible:ring-primary focus-visible:border-primary"
                        placeholder="Contoh: 10.5"
                      />
                    </div>
                    <Button onClick={handleFinishTransaction} className="w-full h-11 bg-green-600 hover:bg-green-700 text-white text-base font-bold shadow-md shadow-green-600/20">
                      Konfirmasi Selesai & Bayar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : listing.status === 'TRANSAKSI' || listing.status === 'PENAWARAN' || listing.status === 'SELESAI' ? (
        <div className="mt-10 bg-card border rounded-2xl p-12 shadow-sm text-center">
          <div className="inline-flex bg-muted p-4 rounded-full mb-4">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Listing Tidak Tersedia</h2>
          <p className="text-muted-foreground">Listing sampah ini telah diambil oleh pengepul lain atau transaksi telah selesai.</p>
        </div>
      ) : currentUser?.role === 'PENGEPUL' && currentUser?.id !== listing.user.id ? (
        <div className="mt-10 bg-card border rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Berikan Penawaran</h2>
          <p className="text-muted-foreground mb-6">Ajukan harga per kilogram untuk sampah ini. Pemilik akan meninjau penawaran Anda.</p>

          {listing.offers.some(o => o.pengepul.id === currentUser.id) ? (
            <div className="bg-green-100 text-green-800 p-4 rounded-xl border border-green-200 flex items-center gap-3">
              <Package className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm">Anda sudah memberikan penawaran untuk listing ini. Menunggu respon pemilik.</span>
            </div>
          ) : (
            <div className="space-y-6">
              {listing.expectedPrice && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-2">
                  <h4 className="font-bold text-primary mb-1.5 flex items-center gap-1.5">⚡ Beli Langsung (Instant Deal)</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Pemilik mengharapkan harga *Rp {listing.expectedPrice.toLocaleString('id-ID')}/Kg*. Anda bisa menyetujuinya untuk langsung menutup transaksi tanpa tawar-menawar.
                  </p>
                  <Button 
                    onClick={handleDirectBuy} 
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90"
                  >
                    Beli Langsung seharga Rp {listing.expectedPrice.toLocaleString('id-ID')}/Kg
                  </Button>
                </div>
              )}

              <div className="pt-2">
                {listing.expectedPrice && <h4 className="font-semibold text-sm mb-3">Atau Ajukan Penawaran Lain (Nego)</h4>}
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-1">Harga per Kg (Rp)</label>
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Contoh: 3000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pesan (Opsional)</label>
                    <textarea
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Tinggalkan pesan untuk pemilik..."
                    />
                  </div>
                  <Button onClick={handleMakeOffer} disabled={isSubmitting} className="w-full" variant={listing.expectedPrice ? "outline" : "default"}>
                    {isSubmitting ? 'Mengirim...' : 'Kirim Penawaran'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listing.offers.map((offer) => (
                <div key={offer.id} className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/40 to-primary/80 rounded-t-2xl"></div>

                  <div className="flex justify-between items-start mb-5 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        {offer.pengepul.avatarUrl ? (
                          <img src={offer.pengepul.avatarUrl} alt={offer.pengepul.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-base line-clamp-1">{offer.pengepul.name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(offer.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${offer.status === 'DITERIMA' ? 'bg-green-100 text-green-700' :
                        offer.status === 'DITOLAK' ? 'bg-red-100 text-red-700' :
                          'bg-secondary text-secondary-foreground'
                      }`}>
                      {offer.status}
                    </div>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-4 mb-5 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Harga Penawaran</div>
                    <div className="text-2xl font-black text-primary mb-1">
                      Rp {offer.pricePerKg.toLocaleString('id-ID')} <span className="text-sm font-normal text-muted-foreground">/ Kg</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" /> Estimasi Total: Rp {(offer.pricePerKg * listing.estimatedWeight).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="pt-2">
                    {listing.status === 'TERSEDIA' && offer.status === 'MENUNGGU' && currentUser?.id === listing.user.id && (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 h-11 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                          onClick={() => handleUpdateOffer(offer.id, 'DITOLAK')}
                        >
                          Tolak
                        </Button>
                        <Button
                          className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
                          onClick={() => handleUpdateOffer(offer.id, 'DITERIMA')}
                        >
                          Terima
                        </Button>
                      </div>
                    )}

                    {offer.status === 'DITERIMA' && (
                      <div className="w-full py-3 px-4 bg-green-50 text-green-700 text-sm text-center font-bold rounded-xl border border-green-200">
                        Penawaran Diterima
                      </div>
                    )}
                    {offer.status === 'DITOLAK' && (
                      <div className="w-full py-3 px-4 bg-red-50 text-red-700 text-sm text-center font-bold rounded-xl border border-red-200">
                        Penawaran Ditolak
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
