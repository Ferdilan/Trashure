
import { useState, useEffect } from 'react';
import {  useNavigate  } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ImagePlus, MapPin, Loader2, X, LocateFixed, Home } from 'lucide-react';

export default function CreateListingPage() {
  interface CategoryData {
    id: string;
    name: string;
  }

  interface Address {
    id: string;
    label: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
    isPrimary: boolean;
  }

  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Location State
  const [locationMethod, setLocationMethod] = useState<'profile' | 'current'>('profile');
  const [profileAddress, setProfileAddress] = useState<Address | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState('Memuat alamat profil Anda...');
  const [isLocating, setIsLocating] = useState(false);

  const getCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationName(`Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`);
          setLocationMethod('current');
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan pada browser/perangkat Anda.');
          setIsLocating(false);
          setLocationMethod('profile');
        }
      );
    } else {
      alert('Geolokasi tidak didukung oleh browser ini.');
      setIsLocating(false);
      setLocationMethod('profile');
    }
  };

  const useProfileLocation = () => {
    if (profileAddress) {
      setLatitude(profileAddress.latitude);
      setLongitude(profileAddress.longitude);
      setLocationName(`${profileAddress.label}: ${profileAddress.fullAddress}`);
    } else {
      setLatitude(null);
      setLongitude(null);
      setLocationName('Belum ada alamat tersimpan di profil Anda.');
    }
    setLocationMethod('profile');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(file => file.size <= 5 * 1024 * 1024); // max 5MB
      
      const newFiles = [...imageFiles, ...validFiles].slice(0, 3); // max 3 files
      setImageFiles(newFiles);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

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

  const fetchProfileAddress = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('http://localhost:5000/api/users/profile', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (data.status === 'success' && data.data.addresses && data.data.addresses.length > 0) {
        const primary = data.data.addresses.find((addr: Address) => addr.isPrimary) || data.data.addresses[0];
        setProfileAddress(primary);
        setLocationName(`${primary.label}: ${primary.fullAddress}`);
        setLatitude(primary.latitude);
        setLongitude(primary.longitude);
      } else {
        setLocationName('Belum ada alamat tersimpan di profil Anda.');
      }
    } catch (e) {
      console.error(e);
      setLocationName('Gagal memuat alamat dari profil.');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
    fetchProfileAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const imageUrls: string[] = [];
      
      // Upload images if any
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${session?.user?.id || 'guest'}/${fileName}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('listings')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Gagal mengunggah foto');
          }
          
          if (data) {
            const { data: { publicUrl } } = supabase.storage
              .from('listings')
              .getPublicUrl(filePath);
            imageUrls.push(publicUrl);
          }
        }
      }

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
          expectedPrice: expectedPrice ? parseFloat(expectedPrice) : undefined,
          latitude: latitude !== null ? latitude : undefined,
          longitude: longitude !== null ? longitude : undefined,
          images: imageUrls
        })
      });

      if (!res.ok) throw new Error('Gagal membuat listing');
      
      navigate('/dashboard/listings');
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
            <label className="text-sm font-medium mb-1.5 block flex items-center justify-between">
              <span>Harga Diharapkan (Rp/Kg) <span className="text-xs text-muted-foreground font-normal">(Opsional)</span></span>
            </label>
            <input 
              type="number" min="0" placeholder="Contoh: 3000 (Kosongkan jika ingin sistem lelang murni)"
              className="w-full h-11 rounded-lg border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={expectedPrice} onChange={(e) => setExpectedPrice(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Jika diisi, pengepul dapat langsung setuju membeli pada harga ini tanpa tawar-menawar (*Instant Deal*).
            </p>
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
            {imagePreviews.length > 0 && (
              <div className="flex gap-4 mb-4 flex-wrap">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                    <img src={preview} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {imageFiles.length < 3 && (
              <div className="relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition cursor-pointer">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  multiple 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <ImagePlus className="h-6 w-6 text-primary" />
                </div>
                <div className="text-sm font-medium">Klik atau drop untuk unggah foto</div>
                <div className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB (Maksimal 3 foto)</div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium block">Lokasi Penjemputan</label>
            <div className="flex gap-2 mb-3">
              <Button 
                type="button" 
                variant={locationMethod === 'profile' ? 'default' : 'outline'} 
                className="flex-1"
                onClick={useProfileLocation}
              >
                <Home className="w-4 h-4 mr-2" /> Alamat Profil
              </Button>
              <Button 
                type="button" 
                variant={locationMethod === 'current' ? 'default' : 'outline'} 
                className="flex-1"
                onClick={getCurrentLocation}
                disabled={isLocating}
              >
                {isLocating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LocateFixed className="w-4 h-4 mr-2" />}
                Lokasi Saat Ini
              </Button>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 items-center">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground">
                  {locationMethod === 'profile' ? 'Alamat Profil' : 'Lokasi GPS (Sesuai Perangkat)'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{locationName}</div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
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
