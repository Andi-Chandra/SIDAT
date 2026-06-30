# Rencana Implementasi: Full-Stack Integration SIDAT

Dokumen ini merupakan panduan dan rencana integrasi full-stack untuk proyek SIDAT (Sistem Informasi Disposisi Surat). Rencana ini disimpan agar dapat dilanjutkan kapan saja.

## Tujuan Utama
Menyelesaikan integrasi antara antarmuka pengguna (Frontend Next.js), sistem pengolahan data (API Routes), dan manajemen basis data (Supabase) untuk memastikan sistem berjalan secara *end-to-end*.

## Poin yang Membutuhkan Konfirmasi (User Review Required)
> **Penting**: Mohon tinjau struktur integrasi di bawah ini. Anda dapat menambahkan detail spesifik mengenai fitur mana yang ingin diprioritaskan setelah Anda kembali bekerja.

## Pertanyaan Terbuka (Open Questions)
1. Apakah ada skema database khusus di Supabase (seperti tabel `surat_masuk`, `disposisi`, `users`) yang perlu disiapkan atau diubah?
2. Untuk fitur Ekstraksi PDF dengan AI (Gemini), apakah alur penyimpanannya akan langsung masuk ke Supabase setelah diekstrak, atau ada tahap validasi manual dari user?
3. Apakah Anda ingin mengimplementasikan Authentication (Login/Role based access) menggunakan Supabase Auth sebagai langkah pertama?

## Rencana Implementasi

### 1. Integrasi Authentication & Manajemen Sesi (Supabase Auth)
- Konfigurasi `@supabase/ssr` untuk middleware Next.js agar *route* terlindungi (Private routes).
- Membuat halaman Login dan integrasi dengan skema validasi `loginSchema`.

### 2. Integrasi Fitur Ekstraksi Surat (PDF to AI to DB)
- **Frontend**: Membuat UI Drag-and-Drop (`react-dropzone`) untuk mengunggah file PDF.
- **Backend**: Melanjutkan endpoint `/api/extract` menggunakan `pdf-parse` dan Gemini AI.
- **Database**: Menyimpan hasil ekstraksi berformat JSON ke tabel Supabase terkait.

### 3. Integrasi Sistem Disposisi dan Absensi
- **API Routes & Server Actions**: Membuat fungsi untuk membaca (GET) dan membuat (POST) data disposisi serta absensi (sesuai `absensiApelSchema`).
- **State Management & UI**: Memastikan *feedback* yang baik bagi pengguna (menggunakan komponen Radix UI / Toast) saat aksi berhasil atau gagal.

---

## Rencana Verifikasi

### Pengujian Otomatis (Automated Tests)
- Menjalankan `npx tsc --noEmit` dan `npm run lint` untuk memastikan tidak ada kesalahan tipe data.
- Unit test sederhana untuk memastikan Supabase Client terhubung dengan benar.

### Pengujian Manual (Manual Verification)
- Uji coba Login dan Logout menggunakan akun percobaan.
- Uji coba proses unggah dokumen PDF hingga hasil ekstraksi Gemini AI muncul di layar dan tersimpan ke Supabase.
- Pengujian fungsionalitas *Progress Bar*, *Toast*, dan komponen antarmuka lainnya secara visual.
