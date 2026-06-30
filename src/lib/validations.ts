import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const ekstrakSuratSchema = z.object({
  nomorSurat: z.string().min(1, "Nomor surat wajib diisi"),
  perihal: z.string().min(1, "Perihal wajib diisi"),
  tanggalSurat: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format tanggal tidak valid",
  }),
  penerimaIds: z.array(z.string().uuid()).min(1, "Pilih minimal 1 penerima"),
  instruksi: z.string().optional(),
});

export const absensiApelSchema = z.object({
  status: z.enum(["hadir", "cuti", "sakit", "dinas_luar", "off", "telat"], {
    message: "Pilih status kehadiran yang valid"
  }),
  catatan: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type EkstrakSuratFormData = z.infer<typeof ekstrakSuratSchema>;
export type AbsensiApelFormData = z.infer<typeof absensiApelSchema>;
