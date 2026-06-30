-- SIDAT Database Schema
-- Run this script in your Supabase SQL Editor

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  nip VARCHAR(50),
  jabatan TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create Surat Masuk Table
CREATE TABLE IF NOT EXISTS public.surat_masuk (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nomor_surat VARCHAR NOT NULL,
  judul_surat TEXT NOT NULL,
  tanggal_surat DATE NOT NULL,
  file_url_asli TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for surat_masuk
ALTER TABLE public.surat_masuk ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Semua orang yang login bisa melihat surat masuk" ON public.surat_masuk FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hanya admin yang bisa insert surat masuk" ON public.surat_masuk FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 3. Create Disposisi Table
CREATE TABLE IF NOT EXISTS public.disposisi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  surat_id UUID REFERENCES public.surat_masuk(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  catatan_instruksi TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for disposisi
ALTER TABLE public.disposisi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staf bisa melihat disposisinya sendiri dan admin bisa melihat semua" ON public.disposisi FOR SELECT TO authenticated USING (
  staff_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin bisa membuat disposisi" ON public.disposisi FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Staf bisa mengupdate status disposisinya sendiri" ON public.disposisi FOR UPDATE TO authenticated USING (
  staff_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 4. Create Dokumen Balasan Table
CREATE TABLE IF NOT EXISTS public.dokumen_balasan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  disposisi_id UUID REFERENCES public.disposisi(id) ON DELETE CASCADE UNIQUE,
  file_url_balasan TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for dokumen_balasan
ALTER TABLE public.dokumen_balasan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Semua otentikasi bisa melihat dokumen balasan" ON public.dokumen_balasan FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staf bisa upload dokumen balasan untuk disposisinya" ON public.dokumen_balasan FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.disposisi WHERE disposisi.id = disposisi_id AND disposisi.staff_id = auth.uid())
);

-- 5. Storage Buckets (Optional, can also be created via UI)
-- Make sure to create buckets 'pdf-surat' and 'bukti-balasan' in Supabase Storage UI.
