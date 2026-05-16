'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Wallet, BadgeCheck, ShieldAlert, Edit2, Plus } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  avatarUrl: string | null;
  isVerified: boolean;
  wallet?: {
    balance: number;
  };
  addresses?: Array<{
    id: string;
    label: string;
    fullAddress: string;
    isPrimary: boolean;
  }>;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const json = await res.json();
      if (json.status === 'success') {
        setProfile(json.data);
      } else {
        throw new Error(json.message || 'Gagal memuat profil');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl inline-block mb-4">
          {error || 'Profil tidak ditemukan'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Profil Pengguna</h1>
        <p className="text-muted-foreground mt-1">Kelola informasi akun dan pengaturan profil Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri - Kartu Utama */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden relative group">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-sm text-muted-foreground mb-3">
                <span className="capitalize">{profile.role.toLowerCase()}</span>
                <span>•</span>
                {profile.isVerified ? (
                  <span className="text-green-600 flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5" /> Terverifikasi</span>
                ) : (
                  <span className="text-yellow-600 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Belum Verifikasi</span>
                )}
              </div>
              <Button variant="outline" className="w-full">
                Edit Profil
              </Button>
            </CardContent>
          </Card>

          {/* Saldo Dompet */}
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 font-medium">
                  <Wallet className="w-5 h-5" /> Saldo Trashure
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight mb-1">
                Rp {(profile.wallet?.balance || 0).toLocaleString('id-ID')}
              </div>
              <p className="text-primary-foreground/80 text-sm">Tarik saldo kapan saja</p>
              <Button variant="secondary" className="w-full mt-4 bg-white text-primary hover:bg-gray-100">
                Tarik Saldo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan - Detail Informasi */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Kontak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Alamat Email</div>
                  <div className="font-medium">{profile.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Nomor Telepon</div>
                  <div className="font-medium">{profile.phoneNumber || 'Belum diatur'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Alamat Tersimpan</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary">
                <Plus className="w-4 h-4" /> Tambah
              </Button>
            </CardHeader>
            <CardContent>
              {!profile.addresses || profile.addresses.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-xl">
                  <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <div className="text-sm font-medium">Belum ada alamat</div>
                  <div className="text-xs text-muted-foreground mt-1">Tambahkan alamat untuk memudahkan penjemputan</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.addresses.map((addr) => (
                    <div key={addr.id} className="p-4 border rounded-xl flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{addr.label}</span>
                          {addr.isPrimary && (
                            <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                              Utama
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{addr.fullAddress}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
