# 🫖 Wedang Rempah Ben Berkah - POS System & Landing Page

Sistem Management POS (Point of Sale) dan Landing Page Premium yang dirancang khusus untuk bisnis minuman tradisional. Dibangun dengan Next.js 16, MySQL, dan sistem desain yang elegan khas Nusantara.

## ✨ Fitur Utama

### 🏛️ Landing Page (Untuk Pelanggan)
- **Hero Section**: Animasi megah dengan sentuhan filosofi Jawa.
- **Dynamic Menu**: Integrasi database untuk menampilkan menu unggulan secara real-time.
- **Responsive Design**: Optimal diakses dari smartphone maupun desktop.
- **Informasi Kedai**: Jam operasional dan alamat yang dapat diatur melalui dashboard.

### 📊 Admin Panel (Staff & Admin)
- **Ringkasan Bisnis**: Statistik pendapatan, total transaksi, dan menu terlaris hari ini.
- **Sistem POS**: Antarmuka kasir cepat dengan manajemen stok otomatis.
- **Manajemen Menu**: Kelola item, kategori, stok, dan harga dengan mudah.
- **Riwayat Transaksi**: Laporan penjualan lengkap dengan fitur penghapusan (untuk admin).
- **Manajemen User**: Pengaturan akun staff (Kasir) dan administrator.

## 🚀 Teknologi

- **Frontend/Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animasi**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [MySQL](https://www.mysql.com/) / MariaDB
- **Autentikasi**: [Auth.js (NextAuth)](https://authjs.dev/)

## 🛠️ Instalasi & Persiapan Produksi

### 1. Persiapan Database
Buat database baru di MySQL (misal: `wedang_rempah_pos`).

### 2. Konfigurasi Environment
Salin file `.env.example` menjadi `.env.local` (untuk development) atau `.env` (untuk produksi):
```bash
cp .env.example .env.local
```
Sesuaikan nilai-nilainya, terutama `NEXTAUTH_SECRET` (minimal 32 karakter unik).

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Inisialisasi Database
Jalankan script inisialisasi untuk membuat tabel dan user admin default:
```bash
node scripts/init-db.js
```
*Default Login: User: `admin`, Password: `password123`*

### 5. Build untuk Produksi
```bash
npm run build
npm run start
```

## 📝 Catatan Produksi
- Pastikan `NODE_ENV` diatur ke `production`.
- Gunakan SSL (HTTPS) jika di-deploy ke server publik.
- Selalu ganti password default admin segera setelah instalasi.

---

**Mugi-mugi berkah & lancar usahanipun.** 🙏
*"Wedang Rempah Ben Berkah - Tradisi Jawa yang Autentik"*
