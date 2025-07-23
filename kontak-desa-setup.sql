-- Setup untuk tabel kontak_desa
-- Jalankan script ini di Supabase SQL Editor

-- 1. Update tabel kontak_desa yang sudah ada
-- Tambahkan kolom yang diperlukan jika belum ada
ALTER TABLE kontak_desa 
ADD COLUMN IF NOT EXISTS jenis_kontak TEXT,
ADD COLUMN IF NOT EXISTS label TEXT,
ADD COLUMN IF NOT EXISTS nilai TEXT,
ADD COLUMN IF NOT EXISTS aktif BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS urutan INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Buat enum untuk jenis kontak (jika belum ada)
DO $$ BEGIN
    CREATE TYPE jenis_kontak_enum AS ENUM ('whatsapp', 'telepon', 'email', 'alamat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Buat index untuk performance
CREATE INDEX IF NOT EXISTS idx_kontak_desa_jenis ON kontak_desa(jenis_kontak);
CREATE INDEX IF NOT EXISTS idx_kontak_desa_aktif ON kontak_desa(aktif);
CREATE INDEX IF NOT EXISTS idx_kontak_desa_urutan ON kontak_desa(urutan);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE kontak_desa ENABLE ROW LEVEL SECURITY;

-- 5. Buat RLS policies
-- Policy untuk SELECT (public dapat membaca)
CREATE POLICY "Public can view kontak desa" ON kontak_desa
    FOR SELECT USING (true);

-- Policy untuk INSERT (hanya admin)
CREATE POLICY "Admin can insert kontak desa" ON kontak_desa
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy untuk UPDATE (hanya admin)
CREATE POLICY "Admin can update kontak desa" ON kontak_desa
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy untuk DELETE (hanya admin)
CREATE POLICY "Admin can delete kontak desa" ON kontak_desa
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 6. Buat trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kontak_desa_updated_at 
    BEFORE UPDATE ON kontak_desa 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Migrasi data dari kolom lama ke struktur baru (jika ada data)
UPDATE kontak_desa SET 
    jenis_kontak = 'whatsapp',
    label = 'WhatsApp Desa',
    nilai = nomor_wa,
    aktif = true,
    urutan = 1
WHERE nomor_wa IS NOT NULL AND nomor_wa != '' AND jenis_kontak IS NULL;

UPDATE kontak_desa SET 
    jenis_kontak = 'telepon',
    label = 'Telepon Kantor Desa',
    nilai = nomor_telepon,
    aktif = true,
    urutan = 2
WHERE nomor_telepon IS NOT NULL AND nomor_telepon != '' AND jenis_kontak IS NULL;

UPDATE kontak_desa SET 
    jenis_kontak = 'email',
    label = 'Email Desa',
    nilai = email,
    aktif = true,
    urutan = 3
WHERE email IS NOT NULL AND email != '' AND jenis_kontak IS NULL;

UPDATE kontak_desa SET 
    jenis_kontak = 'alamat',
    label = 'Alamat Kantor Desa',
    nilai = alamat,
    aktif = true,
    urutan = 4
WHERE alamat IS NOT NULL AND alamat != '' AND jenis_kontak IS NULL;

-- 8. Insert data contoh jika tabel kosong
INSERT INTO kontak_desa (jenis_kontak, label, nilai, aktif, urutan) 
SELECT 'whatsapp', 'WhatsApp Desa', '081234567890', true, 1
WHERE NOT EXISTS (SELECT 1 FROM kontak_desa WHERE jenis_kontak = 'whatsapp');

INSERT INTO kontak_desa (jenis_kontak, label, nilai, aktif, urutan) 
SELECT 'telepon', 'Telepon Kantor Desa', '0274-123456', true, 2
WHERE NOT EXISTS (SELECT 1 FROM kontak_desa WHERE jenis_kontak = 'telepon');

INSERT INTO kontak_desa (jenis_kontak, label, nilai, aktif, urutan) 
SELECT 'email', 'Email Desa', 'info@bukitpamewa.desa.id', true, 3
WHERE NOT EXISTS (SELECT 1 FROM kontak_desa WHERE jenis_kontak = 'email');

INSERT INTO kontak_desa (jenis_kontak, label, nilai, aktif, urutan) 
SELECT 'alamat', 'Alamat Kantor Desa', 'Jl. Raya Bukit Pamewa No. 1, Kec. Pamewa, Kab. Sumba Barat Daya, NTT', true, 4
WHERE NOT EXISTS (SELECT 1 FROM kontak_desa WHERE jenis_kontak = 'alamat');

-- Script selesai
-- Tabel kontak_desa siap digunakan!
