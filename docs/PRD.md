# Uangku — Product Requirement Document (PRD)

## 1. Ringkasan
- **Tujuan:** Mencatat dan menganalisis keuangan pribadi dengan cepat, ringan, dan mobile-first.
- **Target Pengguna:** Mahasiswa, pekerja muda, freelancer yang ingin kontrol pengeluaran.
- **Nilai Utama:** Pencatatan cepat, insight otomatis, bebas iklan.

## 2. Masalah & Solusi
- Masalah: Sulit konsisten mencatat, minim insight, aplikasi lain sering berat/beriklan.
- Solusi: UI super-cepat (bottom-nav + tombol tambah mengambang), kategori personal, laporan otomatis.

## 3. Sasaran Produk (MVP)
1) Auth dengan Clerk  
2) Dashboard ringkas (saldo, income, expense, grafik mingguan)  
3) CRUD Transaksi (income/expense, kategori, tanggal, catatan)  
4) CRUD Kategori (scoped per user)  
5) Insight otomatis sederhana (tren mingguan/bulanan)

## 4. Out of Scope (MVP)
- Multi-currency otomatis, OCR struk, koneksi bank, budgeting envelope kompleks.

## 5. Persona & Use Cases
- **June (24, dev junior):** input transaksi harian < 10 detik; lihat tren mingguan.
- **Freelancer:** pisahkan income project; lihat total bersih bulanan.

## 6. KPI
- D1 Retention ≥ 50%, Metrik: jumlah transaksi per minggu, waktu input median < 8 detik.
- Crash-free session ≥ 99.5%, TTI < 2.5s di koneksi 3G cepat.

## 7. Risiko
- Vendor lock-in (Clerk, Supabase) → antisipasi dengan lapisan adapter.
- Peningkatan biaya jika skala besar → monitoring metrik & rencana upgrade.
- Limitasi domain development di Clerk (tidak mendukung vercel.app untuk production).

## 8. Deployment
- Dideploy di Vercel dengan basis domain sendiri (bukan vercel.app) untuk production.
- Untuk testing/staging, bisa menggunakan domain vercel.app dengan development keys Clerk.

## 9. Acceptance Criteria (MVP)
- Login/Sign up/Logout berjalan
- Buat/ubah/hapus transaksi & kategori
- Dashboard tampil metrik + chart sederhana
- API dilindungi (user hanya akses datanya)
- Aplikasi bisa build dan deploy di Vercel tanpa error
- Type safety terpenuhi sesuai dengan TypeScript strict mode
