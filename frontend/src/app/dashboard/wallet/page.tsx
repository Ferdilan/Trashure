'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, Building, CheckCircle2 } from 'lucide-react';

interface WalletData {
  balance: number;
}

// Mock Data untuk Riwayat Transaksi (karena endpoint khusus belum ada)
const MOCK_HISTORY = [
  { id: '1', type: 'IN', amount: 45000, description: 'Penjualan 15kg Kertas & Kardus', date: '2023-10-15T10:30:00Z', status: 'SUCCESS' },
  { id: '2', type: 'OUT', amount: 50000, description: 'Penarikan Saldo ke Bank Mandiri', date: '2023-10-12T08:15:00Z', status: 'SUCCESS' },
  { id: '3', type: 'IN', amount: 12500, description: 'Penjualan 5kg Plastik', date: '2023-10-05T14:20:00Z', status: 'SUCCESS' },
  { id: '4', type: 'IN', amount: 30000, description: 'Penjualan Besi & Logam', date: '2023-09-28T09:10:00Z', status: 'SUCCESS' },
];

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWalletBalance = async () => {
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
          // Fallback ke 0 jika wallet belum terbuat (meski di backend sudah kita auto-create)
          setWallet({ balance: json.data.wallet?.balance || 0 });
        } else {
          throw new Error(json.message || 'Gagal memuat saldo');
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan jaringan');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletBalance();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl inline-block mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight">Trashure Pay</h1>
        <p className="text-muted-foreground mt-1">Kelola saldo penjualan sampah dan lakukan penarikan dana.</p>
      </div>

      {/* Bagian Saldo & Aksi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kartu Saldo Utama */}
        <Card className="md:col-span-2 bg-gradient-to-br from-primary to-green-600 text-primary-foreground border-none shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Wallet className="w-48 h-48 -mr-10 -mt-10 transform rotate-12" />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center gap-2 font-medium opacity-90 mb-4">
              <Wallet className="w-5 h-5" /> Saldo Aktif
            </div>
            <div className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              Rp {(wallet?.balance || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-primary-foreground/80 text-sm max-w-sm mt-4">
              Saldo ini adalah hasil dari penjualan sampah daur ulang Anda. Anda dapat menariknya ke rekening bank atau e-wallet.
            </p>
          </CardContent>
        </Card>

        {/* Tombol Aksi Cepat */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <Card className="hover:border-primary/50 transition cursor-pointer group">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Building className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <div className="font-semibold">Tarik Bank</div>
              <div className="text-xs text-muted-foreground mt-1">Transfer rekening</div>
            </CardContent>
          </Card>
          
          <Card className="hover:border-primary/50 transition cursor-pointer group">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <CreditCard className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <div className="font-semibold">E-Wallet</div>
              <div className="text-xs text-muted-foreground mt-1">Gopay, OVO, Dana</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Riwayat Transaksi */}
      <Card className="shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">Lihat Semua</Button>
        </CardHeader>
        <CardContent className="p-0">
          {MOCK_HISTORY.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <div className="text-lg font-medium">Belum ada transaksi</div>
              <div className="text-sm text-muted-foreground">Mulai jual sampah Anda untuk mendapatkan saldo.</div>
            </div>
          ) : (
            <div className="divide-y">
              {MOCK_HISTORY.map((tx) => (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {tx.type === 'IN' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-medium">{tx.description}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>•</span>
                        <span className="flex items-center text-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> {tx.status === 'SUCCESS' ? 'Berhasil' : tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${tx.type === 'IN' ? 'text-green-600' : 'text-foreground'}`}>
                    {tx.type === 'IN' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
