'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ImagePlus, MapPin, Loader2 } from 'lucide-react';

export default function CreateListingPage() {
  interface CategoryData {
    id: string;
    name: string;
  }

  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedWeight, setEstimatedWeight] = useState('');

  const fetchCategories = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('http://localhost:5000/api/categories', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        // Jika DB kosong, beri data mock sementara
        setCategories(data.data.length > 0 ? data.data : [
          { id: '1', name: 'Kertas & Kardus' },
          { id: '2', name: 'Plastik (Botol, Gelas)' },
          { id: '3', name: 'Besi & Logam' },
          { id: '4', name: 'Elektronik (E-Waste)' }
        ]);
      }
    } catch (e) {
      console.error(e);
      // Mock data jika backend belum running
      setCategories([
        { id: '1', name: 'Kertas & Kardus' },
        { id: '2', name: 'Plastik (Botol, Gelas)' },
        { id: '3', name: 'Besi & Logam' }
      ]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          categoryId,
          title,
          description,
          estimatedWeight,
          // Mock lokasi
          latitude: -6.200000,
          longitude: 106.816666,
          images: []
        })
      });

      if (!res.ok) throw new Error('Gagal membuat listing');
      
      router.push('/dashboard/listings');
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Terjadi kesalahan sistem');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Buat Listing Sampah</h1>
        <p className="text-muted-foreground mt-1">Jual sampah daur ulang Anda ke pengepul terdekat.</p>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm p-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Judul Listing</label>
            <input 
              type="text" required placeholder="Contoh: 10 Kg Kardus Bekas Pindahan"
              className="w-full h-11 rounded-lg border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={title} onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Kategori Sampah</label>
              <select 
                required
                className="w-full h-11 rounded-lg border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Estimasi Berat (Kg)</label>
              <input 
                type="number" required min="1" step="0.5" placeholder="Contoh: 10"
                className="w-full h-11 rounded-lg border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={estimatedWeight} onChange={(e) => setEstimatedWeight(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Deskripsi & Kondisi</label>
            <textarea 
              rows={4} placeholder="Jelaskan kondisi sampah (misal: kardus kering, botol plastik sudah dicuci)..."
              className="w-full rounded-lg border bg-transparent p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              value={description} onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium block">Foto Sampah</label>
            <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition cursor-pointer">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <ImagePlus className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm font-medium">Klik untuk unggah foto</div>
              <div className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB (Maksimal 3 foto)</div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-foreground">Lokasi Penjemputan</div>
              <div className="text-xs text-muted-foreground mt-0.5">Jalan Jend. Sudirman No. 1, Jakarta (Sesuai profil Anda)</div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Terbitkan Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
