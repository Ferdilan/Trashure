# Rencana Implementasi: Trashure (Marketplace Sampah)

Berdasarkan dokumen Product Requirements Document (PRD) dan arsitektur yang telah dijabarkan, berikut adalah rencana implementasi langkah demi langkah untuk membangun platform Trashure. Pengembangan dibagi menjadi beberapa fase terstruktur (Agile/Iterative) agar MVP (Minimum Viable Product) dapat dirilis lebih cepat dan fitur tambahan dapat disempurnakan pada fase berikutnya.

## Fase 1: Setup & Infrastruktur (Minggu 1)
Fokus pada inisialisasi proyek, pengaturan arsitektur dasar, dan penyusunan skema database.

*   **1.1 Inisialisasi Proyek**
    *   Setup repository Git (Monorepo atau Multi-repo terpisah untuk Frontend dan Backend).
    *   Inisialisasi Frontend: `Next.js` (App Router) + `Tailwind CSS`. Setup komponen UI dasar, desain sistem (warna, tipografi modern), dan `shadcn/ui` (atau library komponen setara).
    *   Inisialisasi Backend: `Node.js` + `Express` menggunakan `TypeScript`. Setup linter, formatter (Prettier), dan struktur folder (Controllers, Services, Routes, Models).
*   **1.2 Setup Database & Autentikasi**
    *   Setup database PostgreSQL menggunakan **Neon DB**.
    *   Implementasi migrasi database (menggunakan Prisma ORM, Drizzle, atau TypeORM) sesuai skema entitas di PRD.
    *   Integrasi **Supabase Auth** untuk autentikasi user (Register, Login, Manajemen Sesi, Role based access).
*   **1.3 Setup Storage & Environment**
    *   Setup Supabase Storage (atau AWS S3) untuk menyimpan aset gambar (KTP, foto sampah, bukti timbangan).
    *   Konfigurasi environment variables (.env) untuk dev, staging, dan production.

## Fase 2: Backend Development & Core APIs (Minggu 2 - 3)
Membangun fondasi logika bisnis, API endpoints, dan integrasi database.

*   **2.1 Manajemen Pengguna (Users & Auth)**
    *   API Endpoint untuk registrasi/login (menghubungkan Supabase Auth dengan tabel `users` di DB).
    *   API endpoint untuk profil user, upload KTP, dan manajemen alamat (geocoding).
*   **2.2 Manajemen Listing Sampah**
    *   API CRUD untuk `waste_categories` (Admin only).
    *   API CRUD untuk `listings` (Pemilik Sampah: buat, edit, hapus, list).
    *   Implementasi fitur filter dan pencarian berbasis radius (menggunakan ekstensi PostGIS `GEOGRAPHY` di PostgreSQL).
*   **2.3 Penawaran (Offers) & Transaksi (Transactions)**
    *   API untuk Pengepul membuat penawaran (`offers`) ke suatu listing.
    *   API untuk Pemilik Sampah menyetujui/menolak penawaran.
    *   Pembuatan state machine untuk `transactions` (Deal -> Jadwal Pickup -> Transit -> Verifikasi -> Selesai).
*   **2.4 Integrasi Wallet Sederhana**
    *   API untuk mutasi saldo `wallets` (Top up, pemotongan saat transaksi, penarikan dana).

## Fase 3: Frontend Development (Core Features) (Minggu 4 - 5)
Mengembangkan antarmuka pengguna untuk dua role utama: Pemilik Sampah dan Pengepul.

*   **3.1 Autentikasi & Profil (Semua Role)**
    *   Halaman Landing, Login, Registrasi (dengan pilihan role).
    *   Halaman Pengaturan Profil dan unggah dokumen verifikasi (KTP/NIB).
*   **3.2 Dashboard Pemilik Sampah**
    *   Halaman "Buat Listing" (Form upload foto, kategori, berat, pin lokasi peta).
    *   Halaman "Listing Aktif" dan "Menunggu Tawaran".
    *   Halaman detail listing untuk melihat dan menerima tawaran (Offer Inbox).
*   **3.3 Dashboard Pengepul / Recycler**
    *   Halaman "Feed Listing" (Tampilan daftar sampah di sekitar dengan map view/card view).
    *   Fitur filter berdasarkan radius, kategori, dan harga.
    *   Halaman "Manajemen Pickup" (Melihat tugas pickup yang sudah deal, kontak pemilik).
*   **3.4 Flow Verifikasi & Checkout**
    *   PWA/Mobile view untuk Pengepul: Form Verifikasi Lapangan (input berat asli, unggah foto bukti timbangan).
    *   Flow persetujuan perubahan harga (Jika berat/jenis berbeda dari deskripsi awal).

## Fase 4: Fitur Realtime & Komunikasi (Minggu 6)
Menambahkan pengalaman yang dinamis untuk negosiasi dan notifikasi.

*   **4.1 Notifikasi Realtime**
    *   Setup **Socket.io** atau **Supabase Realtime**.
    *   Implementasi in-app notification saat ada tawaran masuk, tawaran diterima, atau status pickup berubah.
*   **4.2 Chat Internal / Negosiasi**
    *   Fitur chat sederhana antara Pemilik Sampah dan Pengepul setelah/saat proses penawaran.
*   **4.3 Tracking Pickup Sederhana**
    *   Update status secara live. Pemilik sampah bisa melihat bahwa status telah berubah menjadi "On the Way" atau "Tiba di lokasi".

## Fase 5: Admin Dashboard & Penyempurnaan (Minggu 7)
Membangun alat untuk mengelola platform secara mandiri.

*   **5.1 Admin Dashboard**
    *   Manajemen user: View daftar user, verifikasi KTP/NIB (Approve/Reject).
    *   Moderasi Listing: Menghapus konten ilegal/B3 yang tidak sesuai.
    *   Manajemen Sengketa (Dispute Resolution): Antarmuka untuk melihat keluhan antara pemilik dan pengepul.
*   **5.2 Keuangan & Reporting**
    *   Halaman rekonsiliasi pembayaran dan pencairan dana (Withdrawal approval).
    *   Tampilan grafik statistik dasar (Volume sampah, Total Transaksi, Pendapatan Platform).

## Fase 6: QA, UAT, dan Deployment (Minggu 8)
Memastikan stabilitas dan meluncurkan sistem ke production.

*   **6.1 Testing**
    *   Unit Testing untuk service backend kritikal (kalkulasi harga, update dompet).
    *   End-to-End Testing (contoh menggunakan Cypress) untuk flow transaksi.
*   **6.2 User Acceptance Testing (UAT)**
    *   Internal testing, memperbaiki bug, dan mengoptimalkan performa halaman.
*   **6.3 Deployment**
    *   Deploy Frontend ke Vercel (optimal untuk Next.js).
    *   Deploy Backend ke platform seperti Render, Railway, atau DigitalOcean App Platform.
    *   Setup CI/CD pipeline menggunakan GitHub Actions.
    *   Pemantauan error (contoh integrasi Sentry).

---

### Langkah Selanjutnya (Next Steps)
Jika rencana ini sesuai, kita dapat memulai **Fase 1**. Apakah Anda ingin saya langsung membuatkan kerangka project (scaffolding) untuk Next.js dan Node.js di direktori ini?
