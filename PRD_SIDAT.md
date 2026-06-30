# Product Requirements Document (PRD)
## Sistem Informasi Disposisi Cerdas & Evaluasi Kinerja (SIDAT)
**Dokumen Laporan & Perancangan Sistem Tingkat Lanjut**

---

### 1. Pendahuluan
**Latar Belakang:**  
Pengelolaan dokumen disposisi surat seringkali memakan waktu, terutama dalam mengelompokkan instruksi dan melacak tindak lanjut dari staf yang ditugaskan. Selain itu, evaluasi kinerja bulanan staf memerlukan sistem yang objektif dan terukur.

**Tujuan:**  
Mengembangkan aplikasi cerdas berbasis web dan seluler (SIDAT) yang dapat mengekstrak informasi surat secara otomatis menggunakan Kecerdasan Buatan (AI), mendistribusikan tugas dengan tepat, serta memberikan penilaian kinerja akhir bulan secara terkomputasi menggunakan metode *Analytical Hierarchy Process* (AHP).

---

### 2. Gambaran Umum Sistem
SIDAT adalah aplikasi modern *Progressive Web App* (PWA) yang memadukan manajemen dokumen dengan *Decision Support System* (Sistem Pengambil Keputusan). Sistem ini melayani dua peran (aktor) utama:
1. **Admin / Pimpinan:** Mengunggah surat, memvalidasi hasil ekstraksi AI, menugaskan staf, memantau absensi, dan melihat papan peringkat (Leaderboard) kinerja AHP.
2. **Staf (Pegawai):** Menerima instruksi, mengunggah dokumen bukti penyelesaian, dan melakukan absensi apel harian. Divisi staf dibagi menjadi "Seksi Operasional" dan "Seksi Pendataan" dengan opsi absensi yang disesuaikan.

---

### 3. Arsitektur Sistem (*Architecture Diagram*)

Berikut adalah diagram arsitektur tingkat tinggi (*High-Level Architecture*) yang membangun SIDAT:

![Architecture Diagram](https://mermaid.ink/img/Z3JhcGggVEQKICAgIHN1YmdyYXBoIENsaWVudCBbIkNsaWVudCAvIEZyb250ZW5kIl0KICAgICAgICBVSVsiQW50YXJtdWthIFBlbmdndW5hIChOZXh0LmpzKSJdCiAgICAgICAgUFdBWyJBcGxpa2FzaSBQV0EgKE1vYmlsZSAvIERlc2t0b3ApIl0KICAgIGVuZAogICAgCiAgICBzdWJncmFwaCBCYWNrZW5kIFsiQmFja2VuZCAmIExheWFuYW4iXQogICAgICAgIE5leHRBUElbIk5leHQuanMgQVBJIFJvdXRlcyJdCiAgICAgICAgQUlbIkFJIEVuZ2luZSAoRWtzdHJha3NpIFN1cmF0KSJdCiAgICAgICAgQUhQWyJBSFAgQ2FsY3VsYXRpb24gRW5naW5lIl0KICAgIGVuZAogICAgCiAgICBzdWJncmFwaCBEYXRhYmFzZSBbIlBlbnlpbXBhbmFuIChTdXBhYmFzZSkiXQogICAgICAgIEF1dGhbIkF1dGVudGlrYXNpIFVzZXIiXQogICAgICAgIERCWygiUG9zdGdyZVNRTCBEYXRhYmFzZSIpXQogICAgICAgIFN0b3JhZ2VbIlN0b3JhZ2UgKFBERiAmIEJ1a3RpKSJdCiAgICBlbmQKCiAgICBVSSAtLT58SFRUUC9SRVNUfCBOZXh0QVBJCiAgICBQV0EgLS0+fEhUVFAvUkVTVHwgTmV4dEFQSQogICAgTmV4dEFQSSAtLT58TWVuZ2FuYWxpc2lzIFBERnwgQUkKICAgIE5leHRBUEkgLS0+fEhpdHVuZyBQZXJpbmdrYXR8IEFIUAogICAgTmV4dEFQSSAtLT58UXVlcnkgJiBNdXRhc2l8IEF1dGgKICAgIE5leHRBUEkgLS0+fFNpbXBhbiBEYXRhfCBEQgogICAgTmV4dEFQSSAtLT58TWFuYWplbWVuIEZpbGV8IFN0b3JhZ2U=)

**Penjelasan Arsitektur:**
- **Client/Frontend:** Dibangun menggunakan kerangka kerja (framework) **Next.js** dan disajikan dalam bentuk antarmuka web modern yang responsif. Karena mendukung arsitektur PWA, aplikasi ini dapat diinstal di desktop maupun perangkat seluler dengan pengalaman selayaknya aplikasi *native*.
- **Backend & Layanan:** Menggunakan *API Routes* bawaan Next.js untuk menghubungkan antarmuka dengan pengolahan data cerdas (*AI Engine* untuk membaca PDF dan *AHP Engine* untuk komputasi peringkat).
- **Database (Supabase):** Bertindak sebagai basis data PostgreSQL tangguh yang mengelola autentikasi pengguna, penyimpanan berkas PDF & gambar, serta rekam jejak status disposisi surat.

---

### 4. Diagram Interaksi dan Alur Kerja
#### 4.1 Use Case Diagram (Hak Akses Pengguna)

![Use Case Diagram](https://mermaid.ink/img/Zmxvd2NoYXJ0IExSCiAgICBBZG1pbihbIkFkbWluIC8gUGltcGluYW4iXSkKICAgIFN0YWZmKFsiU3RhZiAoUGVnYXdhaSkiXSkKICAgIHN1YmdyYXBoICJTaXN0ZW0gU0lEQVQiCiAgICAgICAgZGlyZWN0aW9uIFRCCiAgICAgICAgVUMxKFsiTG9naW4ga2UgU2lzdGVtIl0pCiAgICAgICAgVUMyKFsiVXBsb2FkICYgRWtzdHJhayBTdXJhdCAoQUkpIl0pCiAgICAgICAgVUMzKFsiVmFsaWRhc2kgJiBEaXN0cmlidXNpIFN1cmF0Il0pCiAgICAgICAgVUM0KFsiTWVsaWhhdCBEYXNoYm9hcmQgU3VyYXQiXSkKICAgICAgICBVQzUoWyJNZW5naXNpIEFic2VuIEFwZWwiXSkKICAgICAgICBVQzYoWyJVcGxvYWQgQnVrdGkgVGluZGFrIExhbmp1dCJdKQogICAgICAgIFVDNyhbIk1lbWFudGF1IExhcG9yYW4gQWJzZW5zaSJdKQogICAgICAgIFVDOChbIk1lbGloYXQgUGVyaW5na2F0IEtpbmVyamEgKEFIUCkiXSkKICAgIGVuZAogICAgQWRtaW4gLS0+IFVDMQogICAgQWRtaW4gLS0+IFVDMgogICAgQWRtaW4gLS0+IFVDMwogICAgQWRtaW4gLS0+IFVDNAogICAgQWRtaW4gLS0+IFVDNwogICAgQWRtaW4gLS0+IFVDOAogICAgU3RhZmYgLS0+IFVDMQogICAgU3RhZmYgLS0+IFVDNAogICAgU3RhZmYgLS0+IFVDNQogICAgU3RhZmYgLS0+IFVDNgogICAgVUMyIC0uICI8PGluY2x1ZGU+PiIgLi0+IFVDMw==)

<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>

#### 4.2 Sequence Diagram (Alur Disposisi & Ekstraksi AI)

![Sequence Diagram](https://mermaid.ink/img/c2VxdWVuY2VEaWFncmFtCiAgICBhY3RvciBBZG1pbgogICAgcGFydGljaXBhbnQgRnJvbnRlbmQgYXMgU0lEQVQgKE5leHQuanMpCiAgICBwYXJ0aWNpcGFudCBBSSBhcyBBSSBFbmdpbmUgLyBCYWNrZW5kCiAgICBwYXJ0aWNpcGFudCBEQiBhcyBEYXRhYmFzZSAoU3VwYWJhc2UpCiAgICBhY3RvciBTdGFmCiAgICBBZG1pbi0+PkZyb250ZW5kOiAxLiBVcGxvYWQgU3VyYXQgKFBERikKICAgIEZyb250ZW5kLT4+QUk6IDIuIEtpcmltIFBERiB1bnR1ayBFa3N0cmFrc2kKICAgIGFjdGl2YXRlIEFJCiAgICBBSS0tPj5Gcm9udGVuZDogMy4gS2VtYmFsaWthbiBFa3N0cmFrc2kgSlNPTiAoTmFtYSwgSW5zdHJ1a3NpKQogICAgZGVhY3RpdmF0ZSBBSQogICAgRnJvbnRlbmQtLT4+QWRtaW46IDQuIFRhbXBpbGthbiAiUmV2aWV3IEZvcm0iCiAgICBBZG1pbi0+PkZyb250ZW5kOiA1LiBWYWxpZGFzaSBEYXRhICYgS2xpayAiU2ltcGFuICYgRGlzdHJpYnVzaSIKICAgIEZyb250ZW5kLT4+REI6IDYuIFNpbXBhbiBEYXRhIFN1cmF0ICYgVGFyZ2V0IFN0YWYKICAgIGFjdGl2YXRlIERCCiAgICBEQi0tPj5TdGFmOiA3LiBTdXJhdCBNdW5jdWwgZGkgRGFzaGJvYXJkIFN0YWYKICAgIGRlYWN0aXZhdGUgREIKICAgIFN0YWYtPj5Gcm9udGVuZDogOC4gTGloYXQgRGV0YWlsICYgQmFjYSBJbnN0cnVrc2kKICAgIFN0YWYtPj5Gcm9udGVuZDogOS4gVXBsb2FkIERva3VtZW4gQnVrdGkgVGluZGFrIExhbmp1dAogICAgRnJvbnRlbmQtPj5EQjogMTAuIFVwZGF0ZSBTdGF0dXMgRGlzcG9zaXNpIGtlICJDb21wbGV0ZWQiCiAgICBEQi0tPj5BZG1pbjogMTEuIFN0YXR1cyBCZXJ1YmFoIGRpIERhc2hib2FyZCBBZG1pbg==)

**Penjelasan Alur Sequence:**
Admin mengunggah dokumen PDF surat. Sistem (via AI Engine) membaca PDF tersebut dan mengembalikan abstraksi JSON berisi nomor surat, perihal, dan nama-nama penerima. Data tersebut lalu disajikan ke Admin dalam sebuah "Review Form" untuk divalidasi dan dikoreksi sebelum didistribusikan. Setelah dikonfirmasi, surat masuk ke papan (*dashboard*) masing-masing staf. Staf kemudian merespons dengan mengunggah bukti penyelesaian. Jika semua staf telah menyelesaikan tugasnya, status disposisi utama secara otomatis berubah dari *Pending* menjadi *Completed*.

---

### 5. Kebutuhan Fitur Pendukung Utama
- **Modul Absensi Apel (Harian):** Sistem mengakomodasi presensi harian layaknya sistem grup komunikasi. Poling dibedakan atas Divisi Operasional (Hadir, Cuti Tahunan, Dinas Luar, Off, Telat) dan Divisi Pendataan (Hadir di apel, Hadir di lapangan, Cuti, Off, Telat). Tingkat partisipasi absensi ini memengaruhi kriteria penilaian AHP (K4).

<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>

### 6. Pembahasan Lengkap Sistem Pengambil Keputusan (SPK) AHP

Pada akhir periode (bulanan), sistem wajib memberikan laporan pemeringkatan (ranking) kinerja staf secara objektif untuk mendukung pengambilan keputusan *reward* dan *punishment*. Oleh karena itu, diterapkan algoritma *Analytical Hierarchy Process* (AHP). AHP merupakan metode multi-kriteria untuk merasionalkan struktur masalah kompleks menjadi hierarki perhitungan matematis.

#### A. Penetapan Kriteria Penilaian
Empat kriteria strategis ditetapkan oleh manajemen, beserta dengan target optimasinya:

| Kode | Nama Kriteria | Keterangan & Asal Data | Sifat Kriteria |
|---|---|---|---|
| **K1** | Kecepatan Respon | Rata-rata durasi penyelesaian tugas (dihitung sejak surat didisposisikan hingga bukti terunggah). | **Cost** (Nilai lebih kecil berarti lebih cepat/baik) |
| **K2** | Kualitas AI | Dinilai secara objektif (1-5 bintang) oleh Modul AI yang menilai seberapa relevan/tepat dokumen bukti yang diunggah staf dengan instruksi surat pimpinan. | **Benefit** (Nilai lebih besar lebih baik) |
| **K3** | Tingkat Penyelesaian | Persentase seluruh beban kerja/disposisi yang diselesaikan (0-100%). | **Benefit** (Nilai lebih besar lebih baik) |
| **K4** | Kedisiplinan Apel | Persentase akumulasi kehadiran apel pagi harian (0-100%). | **Benefit** (Nilai lebih besar lebih baik) |

#### B. Matriks Perbandingan Berpasangan (*Pairwise Comparison Matrix*)
Sistem menggunakan Skala Thomas L. Saaty (1-9) untuk membandingkan seberapa penting suatu kriteria terhadap kriteria lainnya. Tabel di bawah ini menunjukkan matriks ketetapan yang diimplementasikan pada SIDAT:

| Kriteria | K1 (Kecepatan) | K2 (Kualitas) | K3 (Penyelesaian) | K4 (Disiplin) |
|---|---|---|---|---|
| **K1** | 1 | 2 | 3 | 4 |
| **K2** | 0.50 (1/2) | 1 | 2 | 3 |
| **K3** | 0.33 (1/3) | 0.50 (1/2) | 1 | 2 |
| **K4** | 0.25 (1/4) | 0.33 (1/3) | 0.50 (1/2) | 1 |

*Interpretasi: Kecepatan (K1) dianggap 2 kali lipat lebih penting dari Kualitas (K2) karena penyelesaian dokumen adalah hal krusial.*

#### C. *Eigen Vector*, Bobot Akhir, & Rasio Konsistensi (CR)
Melalui komputasi Engine AHP terhadap matriks di atas, sistem akan menghitung *Eigen Vector* untuk menemukan bobot persentase akhir masing-masing kriteria. Hasil perhitungan tetap dari matriks ini adalah:

- **Bobot K1 (Kecepatan):** ~46.7%
- **Bobot K2 (Kualitas AI):** ~27.7%
- **Bobot K3 (Penyelesaian):** ~16.0%
- **Bobot K4 (Kedisiplinan):** ~9.5%

Validasi dilakukan dengan mengukur *Consistency Ratio* (CR). Matriks di atas menghasilkan nilai **CR = 1.62%** (0.0162). Mengacu pada teori AHP, nilai **CR < 10% (0.1)** bermakna perbandingan berpasangan ini **sangat konsisten**, valid, dan rasional untuk digunakan secara permanen pada sistem evaluasi.

#### D. Algoritma Perhitungan Skor & Normalisasi Aktual
Saat mengevaluasi seluruh staf, SIDAT menjalankan algoritma normalisasi berikut:
1. **Normalisasi Sifat Cost (Berlaku untuk K1):**
   `Nilai Normalisasi = Nilai Minimum Seluruh Staf / Nilai Aktual Staf`
   *(Karena semakin kecil waktunya, staf akan mendapatkan porsi angka yang semakin utuh).*
2. **Normalisasi Sifat Benefit (Berlaku untuk K2, K3, K4):**
   `Nilai Normalisasi = Nilai Aktual Staf / Nilai Maksimum Seluruh Staf`
3. **Kalkulasi Nilai Akhir (*Final Score*):**
   `Skor Akhir = (Norm_K1 × Bobot_K1) + (Norm_K2 × Bobot_K2) + (Norm_K3 × Bobot_K3) + (Norm_K4 × Bobot_K4)`

Sistem lalu merangkum semua skor staf, meranking dari skor terbesar ke terkecil, dan menampilkannya secara langsung *(real-time)* pada Dashboard Peringkat Kinerja Pimpinan.

---

### 7. Kebutuhan Non-Fungsional (Estetika & Skalabilitas)
- **Desain Premium:** Antarmuka dibangun dengan balutan *Sleek Dark Mode* modern berpadu efek kaca (*glassmorphism*), tipografi profesional, dan palet warna terstruktur untuk kesan eksklusif dan mewah di tingkat manajemen.
- **Responsivitas:** Kompatibel 100% dari perangkat komputasi terkecil (smartphone) hingga bentang monitor ultra-lebar.
- **Keamanan Lapis Tinggi:** Komunikasi dienkripsi menggunakan protokol aman (HTTPS) dengan manajemen sisi server mematuhi *Row Level Security* (RLS) PostgreSQL untuk membatasi akses data lintas divisi.

**Dokumen Selesai.**
