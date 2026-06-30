-- 1. Buat Trigger agar setiap ada User baru, otomatis masuk ke tabel profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'staff')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hapus trigger jika sudah ada sebelumnya agar tidak error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Pasang trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Memasukkan Data Akun Default (Admin & Staf) ke auth.users
-- Extension pgcrypto dibutuhkan untuk mengenkripsi password
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hapus akun lama jika ada (agar tidak error conflict email)
DELETE FROM auth.users WHERE email IN ('admin@pps-belawan.go.id', 'suci@pps-belawan.go.id', 'andi@pps-belawan.go.id');

-- 3. Memasukkan Data Akun Default (Admin & Staf) ke auth.users
-- Insert Admin
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@pps-belawan.go.id', crypt('admin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Admin PPS", "role": "admin"}', now(), now());

-- Insert Staf Suci
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES ('b2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'suci@pps-belawan.go.id', crypt('staff123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Suci", "role": "staff"}', now(), now());

-- Insert Staf Andi
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES ('c3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'andi@pps-belawan.go.id', crypt('staff123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Andi", "role": "staff"}', now(), now());


-- 4. Insert Identities (Wajib untuk login Supabase modern agar tidak error 500)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', '{"sub":"a1111111-1111-1111-1111-111111111111","email":"admin@pps-belawan.go.id"}'::jsonb, 'email', 'a1111111-1111-1111-1111-111111111111', now(), now(), now());

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'b2222222-2222-2222-2222-222222222222', '{"sub":"b2222222-2222-2222-2222-222222222222","email":"suci@pps-belawan.go.id"}'::jsonb, 'email', 'b2222222-2222-2222-2222-222222222222', now(), now(), now());

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'c3333333-3333-3333-3333-333333333333', '{"sub":"c3333333-3333-3333-3333-333333333333","email":"andi@pps-belawan.go.id"}'::jsonb, 'email', 'c3333333-3333-3333-3333-333333333333', now(), now(), now());
