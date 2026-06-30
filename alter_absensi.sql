CREATE TABLE IF NOT EXISTS public.absensi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  status TEXT NOT NULL,
  waktu_absen TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(staff_id, tanggal)
);

-- Enable RLS
ALTER TABLE public.absensi ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Semua otentikasi bisa melihat data absensi
CREATE POLICY "Semua orang yang login bisa melihat absen" ON public.absensi FOR SELECT TO authenticated USING (true);

-- 2. Staff bisa insert absen untuk dirinya sendiri
CREATE POLICY "Staff bisa insert absen sendiri" ON public.absensi FOR INSERT TO authenticated WITH CHECK (
  staff_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 3. Update data absensi (Staff bisa update sendiri, Admin bisa update semua)
CREATE POLICY "Update absen" ON public.absensi FOR UPDATE TO authenticated USING (
  staff_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

