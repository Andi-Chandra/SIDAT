// Mock data types for the SiDisposisi application

export interface DisposisiData {
  id: string;
  tanggal_diterima: string;
  nomor_surat: string;
  tanggal_surat: string;
  sifat: string;
  untuk: string;
  hal: string;
  no_agenda: string;
  kode: string;
  penerima: PenerimaSurat[];
  dari: string;
  lampiran: string;
  instruksi: InstruksiItem[];
  status: "pending" | "completed";
  file_url?: string;
  created_at: string;
}

export interface PenerimaSurat {
  id: string;
  nama: string;
  jabatan?: string;
  status: "pending" | "completed";
}

export interface InstruksiItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface StaffProfile {
  id: string;
  full_name: string;
  jabatan: string;
  email: string;
  role: "admin" | "staff";
  avatar?: string;
  divisi?: "Operasional" | "Pendataan";
  ahpScores?: {
    k1_kecepatan: number; // hari (Cost - lower is better)
    k2_kualitas_ai: number; // 1-5 (Benefit)
    k3_penyelesaian: number; // persentase 0-100 (Benefit)
    k4_kedisiplinan: number; // persentase kehadiran 0-100 (Benefit)
  };
}

export type StatusAbsensi = 
  | "Hadir" | "Cuti tahunan" | "Dinas luar" | "Off" | "Telat"
  | "Hadir di apel" | "Hadir di lapangan" | "Cuti";

export interface AbsensiData {
  id: string;
  tanggal: string;
  staff_id: string;
  status: StatusAbsensi;
  waktu_absen?: string;
}

// Mock staff list
export const MOCK_STAFF: StaffProfile[] = [
  { id: "1", full_name: "Admin Sekretariat", jabatan: "Sekretaris", email: "admin@pps-belawan.go.id", role: "admin" },
  { id: "2", full_name: "Nursaidah", jabatan: "Kepala Seksi", email: "nursaidah@pps-belawan.go.id", role: "staff", divisi: "Operasional", ahpScores: { k1_kecepatan: 1.5, k2_kualitas_ai: 4.5, k3_penyelesaian: 90, k4_kedisiplinan: 95 } },
  { id: "3", full_name: "Suci Pratiwi Fahrina Siagian", jabatan: "Staf Administrasi", email: "suci@pps-belawan.go.id", role: "staff", divisi: "Pendataan", ahpScores: { k1_kecepatan: 0.5, k2_kualitas_ai: 4.8, k3_penyelesaian: 100, k4_kedisiplinan: 100 } },
  { id: "4", full_name: "Andi Candra", jabatan: "Staf Teknis", email: "andi@pps-belawan.go.id", role: "staff", divisi: "Operasional", ahpScores: { k1_kecepatan: 2.5, k2_kualitas_ai: 3.5, k3_penyelesaian: 75, k4_kedisiplinan: 80 } },
  { id: "5", full_name: "Dedi Surbakti", jabatan: "Staf Lapangan", email: "dedi@pps-belawan.go.id", role: "staff", divisi: "Operasional", ahpScores: { k1_kecepatan: 3.0, k2_kualitas_ai: 3.0, k3_penyelesaian: 60, k4_kedisiplinan: 70 } },
  { id: "6", full_name: "Budi Santoso", jabatan: "Staf IT", email: "budi@pps-belawan.go.id", role: "staff", divisi: "Pendataan", ahpScores: { k1_kecepatan: 1.0, k2_kualitas_ai: 4.0, k3_penyelesaian: 85, k4_kedisiplinan: 90 } },
];

export const MOCK_ABSENSI: AbsensiData[] = [
  { id: "a1", tanggal: new Date().toISOString().split("T")[0], staff_id: "2", status: "Hadir", waktu_absen: "07:30" },
  { id: "a2", tanggal: new Date().toISOString().split("T")[0], staff_id: "4", status: "Dinas luar", waktu_absen: "07:45" },
  { id: "a3", tanggal: new Date().toISOString().split("T")[0], staff_id: "5", status: "Telat", waktu_absen: "08:15" },
  { id: "a4", tanggal: new Date().toISOString().split("T")[0], staff_id: "3", status: "Hadir di apel", waktu_absen: "07:50" },
];

// Mock instruksi options
export const INSTRUKSI_OPTIONS = [
  "Info",
  "Aksi",
  "Jadwalkan/agendakan",
  "Siapkan bahan",
  "Beri saran",
  "Harap mewakili",
  "Hadir bersama saya",
  "Untuk dipelajari",
];

// Mock disposisi data
export const MOCK_DISPOSISI: DisposisiData[] = [
  {
    id: "disp-001",
    tanggal_diterima: "2026-06-22",
    nomor_surat: "B.2383/DJPT.4/PI.310/VI/2026",
    tanggal_surat: "2026-06-19",
    sifat: "Biasa",
    untuk: "-",
    hal: "Penyampaian Hasil Evaluasi Kinerja Operasional Pelabuhan Perikanan Periode Triwulan I Tahun 2026",
    no_agenda: "0311000000/332881/2026",
    kode: "",
    dari: "Direktur Kepelabuhanan Perikanan",
    lampiran: "-",
    instruksi: [
      { id: "1", label: "Info", checked: true },
      { id: "2", label: "Aksi", checked: true },
      { id: "3", label: "Jadwalkan/agendakan", checked: false },
      { id: "4", label: "Siapkan bahan", checked: false },
      { id: "5", label: "Beri saran", checked: false },
      { id: "6", label: "Harap mewakili", checked: false },
      { id: "7", label: "Hadir bersama saya", checked: false },
      { id: "8", label: "Untuk dipelajari", checked: true },
    ],
    penerima: [
      { id: "p1", nama: "Nursaidah", status: "completed" },
      { id: "p2", nama: "Suci Pratiwi Fahrina Siagian", status: "pending" },
      { id: "p3", nama: "Dedi Surbakti", status: "pending" },
    ],
    status: "pending",
    created_at: "2026-06-22T08:00:00Z",
  },
  {
    id: "disp-002",
    tanggal_diterima: "2026-06-20",
    nomor_surat: "B.1987/DJPT.3/PI.200/VI/2026",
    tanggal_surat: "2026-06-18",
    sifat: "Segera",
    untuk: "Kepala Seksi",
    hal: "Undangan Rapat Koordinasi Pengelolaan Sumber Daya Kelautan Tahun 2026",
    no_agenda: "0311000000/298001/2026",
    kode: "RA.001",
    dari: "Direktur Jenderal Perikanan Tangkap",
    lampiran: "1 berkas",
    instruksi: [
      { id: "1", label: "Info", checked: true },
      { id: "2", label: "Aksi", checked: false },
      { id: "3", label: "Jadwalkan/agendakan", checked: true },
      { id: "4", label: "Siapkan bahan", checked: true },
      { id: "5", label: "Beri saran", checked: false },
      { id: "6", label: "Harap mewakili", checked: false },
      { id: "7", label: "Hadir bersama saya", checked: false },
      { id: "8", label: "Untuk dipelajari", checked: false },
    ],
    penerima: [
      { id: "p4", nama: "Andi Candra", status: "completed" },
    ],
    status: "completed",
    created_at: "2026-06-20T09:30:00Z",
  },
  {
    id: "disp-003",
    tanggal_diterima: "2026-06-18",
    nomor_surat: "S.0451/KKP.VII/VI/2026",
    tanggal_surat: "2026-06-15",
    sifat: "Rahasia",
    untuk: "Ketua Tim Kerja",
    hal: "Laporan Hasil Pemeriksaan Fasilitas Pelabuhan Semester I 2026",
    no_agenda: "0311000000/275440/2026",
    kode: "LP.002",
    dari: "Inspektorat Jenderal KKP",
    lampiran: "3 berkas",
    instruksi: [
      { id: "1", label: "Info", checked: true },
      { id: "2", label: "Aksi", checked: true },
      { id: "3", label: "Jadwalkan/agendakan", checked: false },
      { id: "4", label: "Siapkan bahan", checked: false },
      { id: "5", label: "Beri saran", checked: true },
      { id: "6", label: "Harap mewakili", checked: false },
      { id: "7", label: "Hadir bersama saya", checked: false },
      { id: "8", label: "Untuk dipelajari", checked: false },
    ],
    penerima: [
      { id: "p5", nama: "Suci Pratiwi Fahrina Siagian", status: "pending" },
      { id: "p6", nama: "Andi Candra", status: "completed" },
    ],
    status: "pending",
    created_at: "2026-06-18T10:00:00Z",
  },
];
