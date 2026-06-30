# Sidat - Aplikasi Manajemen & Pembaca Disposisi Surat

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript)

**Sidat** adalah aplikasi berbasis web yang dirancang untuk mengotomatisasi proses input data dari dokumen surat disposisi berbentuk PDF ke dalam sistem database. Sistem ini menggunakan teknologi PDF Parsing/AI untuk membaca informasi penting secara otomatis, dan mendistribusikannya ke staf terkait. 

Sistem ini memastikan akuntabilitas melalui pelacakan status disposisi yang jelas serta efisiensi dokumen melalui wadah terpusat untuk surat masuk dan balasan tindak lanjut.

---

## 🎯 Fitur Utama

- **Autentikasi & Role Berbasis Supabase**
  - Pemisahan hak akses antara **Admin/Sekretariat** dan **Staf (Penerima)**.
  - Keamanan akses data dengan Row Level Security (RLS).
- **Ekstraksi Otomatis Dokumen PDF (OCR/AI Parsing)**
  - Mengunggah PDF surat disposisi.
  - Membaca metadata surat secara otomatis: Nomor, Tanggal, Tujuan, Catatan/Instruksi.
  - Form verifikasi/review untuk admin sebelum menyimpan data.
- **Dashboard Real-Time**
  - **Sisi Staf:** Melihat daftar disposisi (Pending / Completed).
  - Mengunduh/Melihat pratinjau surat langsung dari aplikasi.
- **Tindak Lanjut & Upload Balasan**
  - Staf dapat mengunggah file bukti/balasan (PDF/Gambar) ke Supabase Storage.
  - Status disposisi otomatis berubah (Tracking status).

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Shadcn UI
- **Backend/API:** Next.js Route Handlers / Node.js
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage)

---

## 🚀 Cara Menjalankan Proyek (Local Development)

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/en/) (Disarankan versi LTS, v18/v20)
- npm, yarn, pnpm, atau bun (package manager)
- Akun [Supabase](https://supabase.com) (Untuk setup database & auth)

### 2. Kloning Repositori
```bash
git clone https://github.com/username/Sidat.git
cd Sidat
```

### 3. Instalasi Dependensi
```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 4. Konfigurasi Environment Variables
Buat file `.env.local` di root proyek dan tambahkan credentials dari Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Jalankan Development Server
```bash
npm run dev
# atau
yarn dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat aplikasi.

---

## 🗄️ Skema Database (Supabase)

Proyek ini memerlukan beberapa tabel utama di Supabase PostgreSQL. File migrasi/skema lengkap ada di `schema.sql`:

1. **`profiles`** - Menyimpan data tambahan pengguna dan role (`admin`, `staff`).
2. **`surat_masuk`** - Data master surat masuk beserta URL PDF aslinya.
3. **`disposisi`** - Relasi surat dan staf penerima beserta status dan catatan.
4. **`dokumen_balasan`** - Bukti upload file hasil tindak lanjut dari staf.

---

## 👥 User Roles & Akses

| Role | Kredensial Default (Testing) | Kemampuan |
|---|---|---|
| **Admin** | `admin@pps-belawan.go.id` / `admin123` | Manajemen user, Upload PDF, Verifikasi hasil parsing, Pantau seluruh disposisi. |
| **Staf** | `suci@pps-belawan.go.id` / `staff123` | Melihat disposisi pribadi, membaca PDF, Upload file tindak lanjut/balasan. |

---

## 📄 Lisensi
[MIT License](LICENSE)
