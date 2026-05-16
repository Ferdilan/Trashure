'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Package, MapPin, Calendar, Clock, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

interface TransactionData {
  id: string;
  status: string;
  finalWeight: number | null;
  totalPrice: number | null;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    category?: { name: string };
  };
  pengepul: {
    name: string;
    phoneNumber: string | null;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch('http://localhost:5000/api/transactions', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      const json = await res.json();
      if (json.status === 'success') {
        setTransactions(json.data);
      } else {
        throw new Error(json.message || 'Gagal memuat transaksi');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan jaringan');
      // Fallback data simulasi jika API belum tersedia penuh
      setTransactions([
        {
          id: 'tx-1',
          status: 'SELESAI',
          finalWeight: 12.5,
          totalPrice: 45000,
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          listing: { id: 'ls-1', title: 'Kardus Bekas Gudang' },
          pengepul: { name: 'Pengepul Berkah', phoneNumber: '08123456789' }
        },
        {
          id: 'tx-2',
          status: 'TRANSIT',
          finalWeight: null,
          totalPrice: 35000, // estimasi awal
          updatedAt: new Date().toISOString(),
          listing: { id: 'ls-2', title: 'Botol Plastik 10 Kg' },
          pengepul: { name: 'Pengepul Maju', phoneNumber: '08987654321' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DEAL':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Deal / Menunggu Pickup</span>;
      case 'JADWAL_PICKUP':
      case 'TRANSIT':
        return <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Dalam Perjalanan</span>;
      case 'VERIFIKASI':
        return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Sedang Ditimbang</span>;
      case 'SELESAI':
        return <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Selesai</span>;
      case 'BATAL':
        return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Dibatalkan</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Transaksi</h1>
          <p className="text-muted-foreground mt-1">Pantau seluruh aktivitas jual-beli dan penjemputan sampah Anda.</p>
        </div>
        <Button onClick={fetchTransactions} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Segarkan
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-32 bg-muted" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed rounded-2xl">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold mb-2">Belum ada transaksi</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Anda belum memiliki riwayat transaksi penjualan atau penjemputan sampah.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <Card key={tx.id} className="overflow-hidden hover:border-primary/50 transition duration-200">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-stretch">
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <div className="mb-2">
                          {getStatusBadge(tx.status)}
                        </div>
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                          <Link href={`/dashboard/listings/${tx.listing.id}`}>
                            {tx.listing.title}
                          </Link>
                        </h3>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(tx.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(tx.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className="text-xs text-muted-foreground mb-1">Total {tx.status === 'SELESAI' ? 'Pendapatan' : 'Estimasi'}</div>
                        <div className={`font-bold text-lg ${tx.status === 'SELESAI' ? 'text-green-600' : 'text-primary'}`}>
                          Rp {tx.totalPrice?.toLocaleString('id-ID') || '-'}
                        </div>
                        {tx.finalWeight && (
                          <div className="text-xs text-muted-foreground mt-1 bg-secondary inline-block px-2 py-0.5 rounded">
                            Berat Akhir: {tx.finalWeight} Kg
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Pengepul</div>
                          <div className="text-sm font-medium">{tx.pengepul.name}</div>
                        </div>
                      </div>
                      <Link href={`/dashboard/listings/${tx.listing.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-primary">
                          Detail Listing <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
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
