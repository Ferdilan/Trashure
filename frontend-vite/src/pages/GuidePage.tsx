import { Link } from 'react-router-dom';
import { ArrowLeft, User, Truck, CheckCircle2, Coins, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo Trashure" className="h-10 w-auto" />
            <Button variant="ghost" size="sm" className="-ml-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
            </Button>
            <span className="font-bold text-lg tracking-tight text-primary">Panduan Pengguna</span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Bagaimana Cara Kerja Trashure?</h1>
          <p className="text-xl text-muted-foreground">
            Pelajari cara mudah menjual dan membeli sampah daur ulang melalui platform Trashure. Pilih peran Anda di bawah ini.
          </p>
        </div>
      </section>

      {/* Guide Content */}
      <section className="pb-24 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">

          {/* Pemilik Sampah */}
          <div className="space-y-8 relative">
            <div className="bg-card border rounded-2xl p-6 shadow-sm mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Pemilik Sampah</h2>
              </div>
              <p className="text-muted-foreground">Ubah limbah rumah tangga atau bisnis Anda menjadi saldo tambahan.</p>
            </div>

            <div className="space-y-8 pl-4 border-l-2 border-primary/20">
              <div className="relative">
                <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Lengkapi Profil & Lokasi</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Daftar sebagai Pemilik Sampah. Buka menu Profil untuk menambahkan Nomor WhatsApp dan menyetel alamat penjemputan utama Anda.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Buat Listing Baru</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Buka menu Listing Saya dan klik Buat Listing. Masukkan detail sampah, foto, serta <strong>Harga Diharapkan</strong> jika Anda ingin fitur Beli Langsung (Instant Deal).
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Terima Tawaran Pengepul</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Pengepul akan mulai menawar. Pilih tawaran terbaik dan setujui. Jika pengepul menekan Beli Langsung, transaksi otomatis disetujui.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Coins className="h-4 w-4 text-primary" /> Penjemputan & Terima Saldo</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Pengepul datang ke lokasi, memverifikasi berat, dan membayar via aplikasi. Saldo Anda akan bertambah di halaman Wallet dan dapat ditarik.
                </p>
              </div>
            </div>
          </div>

          {/* Pengepul */}
          <div className="space-y-8 relative">
            <div className="bg-card border rounded-2xl p-6 shadow-sm mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-emerald-500/10 p-3 rounded-xl">
                  <Truck className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold">Mitra Pengepul</h2>
              </div>
              <p className="text-muted-foreground">Cari suplai sampah daur ulang secara efisien dan kembangkan usaha Anda.</p>
            </div>

            <div className="space-y-8 pl-4 border-l-2 border-emerald-500/20">
              <div className="relative">
                <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-background"></div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><User className="h-4 w-4 text-emerald-600" /> Daftar & Siapkan Kontak</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Pilih peran Mitra Pengepul saat mendaftar. Isi Nomor WhatsApp di halaman Profil agar Pemilik Sampah mudah menghubungi Anda.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-background"></div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Search className="h-4 w-4 text-emerald-600" /> Cari & Beli Langsung</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Buka fitur Cari Sampah (Feed) untuk melihat barang di sekitar Anda. Anda dapat melakukan *Tawar Nego* atau menekan tombol <strong>Beli Langsung (Instant Deal)</strong>.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-background"></div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-600" /> Eksekusi Penjemputan</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sepakati jadwal, lalu klik <em>Mulai Pickup (On The Way)</em>. Sistem akan otomatis memberitahu pemilik sampah lewat WhatsApp.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-background"></div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Verifikasi & Bayar</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Timbang barang di lokasi, masukkan berat aktual ke aplikasi, lalu lakukan pembayaran instan secara digital. Sampah resmi menjadi milik Anda!
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
