
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Recycle, TrendingUp, ShieldCheck, Leaf, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [weight, setWeight] = useState('');
  const [estimate, setEstimate] = useState<number | null>(null);

  const calculateEstimate = () => {
    // Mock calculation
    const prices: Record<string, number> = { plastik: 3000, kardus: 2000, logam: 8000 };
    if (selectedCategory && weight) {
      setEstimate(prices[selectedCategory] * Number(weight));
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Menampilkan gambar logo Anda dari folder public */}
            <img src="/logo.png" alt="Logo Trashure" className="h-10 w-auto" />

            {/* Opsional: Teks ini bisa dihapus jika gambar logo Anda sudah mengandung teks */}
            <span className="font-bold text-xl tracking-tight text-primary">Trashure</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#fitur" onClick={(e) => scrollToSection(e, 'fitur')} className="hover:text-foreground transition cursor-pointer">Fitur</a>
            <a href="#harga" onClick={(e) => scrollToSection(e, 'harga')} className="hover:text-foreground transition cursor-pointer">Cek Harga</a>
            <a href="#tentang" onClick={(e) => scrollToSection(e, 'tentang')} className="hover:text-foreground transition cursor-pointer">Tentang Kami</a>
            <Link to="/panduan" className="hover:text-foreground transition">Panduan Pengguna</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Daftar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            Platform Marketplace Sampah #1 di Indonesia
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Ubah Sampah Jadi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Rupiah & Dampak Nyata
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Jual sampah daur ulang Anda langsung ke pengepul terdekat.
            Dapatkan harga terbaik, jemput di tempat, dan bantu selamatkan bumi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link to="/register?role=PEMILIK">
              <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto shadow-lg shadow-primary/25">
                Jual Sampah Sekarang <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register?role=PENGEPUL">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base w-full sm:w-auto border-2">
                Jadi Mitra Pengepul
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Estimator Section */}
      <section id="harga" className="py-20 bg-muted/50 border-y">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cek Estimasi Harga</h2>
            <p className="text-muted-foreground">Hitung perkiraan pendapatan dari sampah yang Anda miliki sebelum menjualnya.</p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Jenis Sampah</label>
                <select
                  className="w-full h-12 rounded-lg border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Pilih Jenis</option>
                  <option value="plastik">Plastik (Botol, Gelas)</option>
                  <option value="kardus">Kertas & Kardus</option>
                  <option value="logam">Logam & Besi</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Perkiraan Berat (Kg)</label>
                <input
                  type="number"
                  placeholder="Contoh: 5"
                  className="w-full h-12 rounded-lg border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <Button onClick={calculateEstimate} className="w-full h-12 text-base">
                Hitung Estimasi
              </Button>
            </div>

            <div className="flex-1 w-full flex flex-col items-center justify-center p-8 bg-primary/5 rounded-xl border border-primary/10 min-h-[200px]">
              <Coins className="h-10 w-10 text-primary mb-4" />
              <div className="text-sm text-muted-foreground mb-1">Perkiraan Pendapatan</div>
              <div className="text-4xl font-bold text-foreground">
                {estimate !== null ? `Rp ${estimate.toLocaleString('id-ID')}` : 'Rp 0'}
              </div>
              {estimate !== null && (
                <div className="text-xs text-primary mt-2 bg-primary/10 px-2 py-1 rounded-full">
                  Harga dapat bervariasi sesuai negosiasi
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Harga Kompetitif</h3>
              <p className="text-muted-foreground leading-relaxed">Sistem marketplace memungkinkan Pengepul saling menawar memberikan harga terbaik untuk Anda.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Recycle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Jemput di Tempat</h3>
              <p className="text-muted-foreground leading-relaxed">Tidak perlu repot membawa sampah. Pengepul akan datang langsung ke lokasi yang Anda tentukan.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transaksi Aman</h3>
              <p className="text-muted-foreground leading-relaxed">Verifikasi berat langsung di tempat dengan bukti foto timbangan untuk menghindari kecurangan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Kami Section */}
      <section id="tentang" className="py-24 bg-muted/30 border-t">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16 animate-in fade-in duration-700">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">Tentang Kami</span>
            <h2 className="text-4xl font-extrabold tracking-tight mt-4 mb-4">Visi & Misi Trashure</h2>
            <div className="max-w-3xl mx-auto space-y-2">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Visi Kami</span>
              <p className="text-lg font-medium text-foreground leading-relaxed">
                "Menjadi platform digital inovatif yang menghubungkan masyarakat dan UMKM dalam pengelolaan dan jual beli sampah daur ulang secara efisien serta bernilai ekonomi."
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border shadow-sm flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                  <Recycle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Misi Pertama</h4>
                  <p className="text-sm text-muted-foreground">Menjembatani masyarakat dan UMKM dengan jaringan pengepul lokal melalui teknologi, guna mewujudkan Indonesia bersih dan berkelanjutan.</p>
                </div>
              </div>

              <div className="bg-card p-6 rounded-2xl border shadow-sm flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Misi Kedua</h4>
                  <p className="text-sm text-muted-foreground">Meningkatkan literasi, partisipasi, dan efisiensi rantai pasok daur ulang melalui edukasi, insentif digital, sistem logistik terintegrasi, serta transaksi harga transparan berbasis data real-time.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-tr from-primary/10 to-emerald-400/10 border border-primary/20 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl"></div>
              <h3 className="text-2xl font-bold mb-4">Dampak Bersama Kami 🌍</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Sejak pertama kali diluncurkan, komunitas Trashure telah berhasil mengalihkan ribuan kilogram sampah dari Tempat Pembuangan Akhir (TPA) langsung ke pabrik pengolahan daur ulang.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card/60 backdrop-blur-md p-4 rounded-xl border border-white/20">
                  <div className="text-2xl font-extrabold text-primary">10+ Ton</div>
                  <div className="text-xs text-muted-foreground">Sampah Terdaur Ulang</div>
                </div>
                <div className="bg-card/60 backdrop-blur-md p-4 rounded-xl border border-white/20">
                  <div className="text-2xl font-extrabold text-primary">500+</div>
                  <div className="text-xs text-muted-foreground">Pengguna Aktif</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDGs Section */}
      <section id="sdg" className="py-20 bg-background border-t">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">Sustainable Development Goals</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-4 mb-4">Trashure Mendukung SDGs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Kami berkomitmen penuh untuk menyelaraskan operasional platform kami dengan Tujuan Pembangunan Berkelanjutan (SDGs) yang ditetapkan oleh Perserikatan Bangsa-Bangsa (PBB).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch justify-center">
            {/* SDG 11 */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-1">
              <img src="https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-11.jpg" alt="SDG 11 - Sustainable Cities and Communities" className="w-24 h-24 object-contain rounded-xl mb-4 shadow-sm" />
              <h3 className="font-bold text-lg mb-2">Sustainable Cities</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Mengurangi dampak lingkungan perkotaan yang merugikan dengan berfokus pada manajemen pengelolaan sampah secara terpadu.</p>
            </div>

            {/* SDG 12 */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-1">
              <img src="https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-12.jpg" alt="SDG 12 - Responsible Consumption and Production" className="w-24 h-24 object-contain rounded-xl mb-4 shadow-sm" />
              <h3 className="font-bold text-lg mb-2">Responsible Consumption</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Mendorong masyarakat secara substansial mengurangi limbah melalui pencegahan, pengurangan, daur ulang, dan penggunaan kembali.</p>
            </div>

            {/* SDG 13 */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-1">
              <img src="https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-13.jpg" alt="SDG 13 - Climate Action" className="w-24 h-24 object-contain rounded-xl mb-4 shadow-sm" />
              <h3 className="font-bold text-lg mb-2">Climate Action</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Mengambil tindakan nyata terhadap perubahan iklim dengan mengurangi jejak emisi gas metana yang dihasilkan dari limbah di TPA.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">Trashure</span>
          </div>
          <p>© {new Date().getFullYear()} Trashure Indonesia. Semua Hak Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
