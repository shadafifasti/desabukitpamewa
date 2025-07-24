-- Migration Script untuk Peta Desa
-- Jalankan script ini di Supabase SQL Editor untuk memperbaiki struktur tabel

-- 1. Cek struktur tabel yang ada
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'peta_desa';

-- 2. Drop tabel lama jika ada (HATI-HATI: ini akan menghapus data yang ada)
-- Uncomment baris di bawah jika ingin reset tabel
-- DROP TABLE IF EXISTS peta_desa CASCADE;

-- 3. Buat tabel peta_desa dengan struktur yang benar
CREATE TABLE IF NOT EXISTS peta_desa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  gambar_url TEXT,
  gambar_filename VARCHAR(255),
  koordinat_lat DECIMAL(10, 8),
  koordinat_lng DECIMAL(11, 8),
  zoom_level INTEGER DEFAULT 14,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Jika tabel sudah ada dengan struktur berbeda, tambahkan kolom yang hilang
-- Jalankan satu per satu sesuai kebutuhan:

-- Tambah kolom judul jika belum ada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'peta_desa' AND column_name = 'judul') THEN
        ALTER TABLE peta_desa ADD COLUMN judul VARCHAR(255) NOT NULL DEFAULT 'Peta Desa';
    END IF;
END $$;

-- Tambah kolom deskripsi jika belum ada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'peta_desa' AND column_name = 'deskripsi') THEN
        ALTER TABLE peta_desa ADD COLUMN deskripsi TEXT;
    END IF;
END $$;

-- Tambah kolom gambar_url jika belum ada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'peta_desa' AND column_name = 'gambar_url') THEN
        ALTER TABLE peta_desa ADD COLUMN gambar_url TEXT;
    END IF;
END $$;

-- Tambah kolom gambar_filename jika belum ada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'peta_desa' AND column_name = 'gambar_filename') THEN
        ALTER TABLE peta_desa ADD COLUMN gambar_filename VARCHAR(255);
    END IF;
END $$;

-- Tambah kolom koordinat_lat jika belum ada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'peta_desa' AND column_name = 'koordinat_lat') THEN
        ALTER TABLE peta_desa ADD COLUMN koordinat_lat DECIMAL(10, 8);
    END IF;
END $$;

-- Tambah kolom koordinat_lng jika belum ada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'peta_desa' AND column_name = 'koordinat_lng') THEN
        ALTER TABLE peta_desa ADD COLUMN koordinat_lng DECIMAL(11, 8);
    END IF;
END $$;

-- Tambah kolom zoom_level jika belum ada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'peta_desa' AND column_name = 'zoom_level') THEN
        ALTER TABLE peta_desa ADD COLUMN zoom_level INTEGER DEFAULT 14;
    END IF;
END $$;

-- Tambah kolom updated_at jika belum ada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'peta_desa' AND column_name = 'updated_at') THEN
        ALTER TABLE peta_desa ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
    END IF;
END $$;

-- 5. Enable Row Level Security
ALTER TABLE peta_desa ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies jika ada
DROP POLICY IF EXISTS "Allow public read access" ON peta_desa;
DROP POLICY IF EXISTS "Allow admin insert" ON peta_desa;
DROP POLICY IF EXISTS "Allow admin update" ON peta_desa;
DROP POLICY IF EXISTS "Allow admin delete" ON peta_desa;

-- 7. Buat policies baru
-- Policy untuk read (semua orang bisa melihat)
CREATE POLICY "Allow public read access" ON peta_desa
    FOR SELECT USING (true);

-- Policy untuk insert (hanya admin)
CREATE POLICY "Allow admin insert" ON peta_desa
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy untuk update (hanya admin)
CREATE POLICY "Allow admin update" ON peta_desa
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy untuk delete (hanya admin)
CREATE POLICY "Allow admin delete" ON peta_desa
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 8. Buat storage bucket untuk peta-desa jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('peta-desa', 'peta-desa', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Policies untuk storage bucket
-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete" ON storage.objects;

-- Policy untuk read storage (semua orang bisa melihat)
CREATE POLICY "Allow public read peta-desa" ON storage.objects
    FOR SELECT USING (bucket_id = 'peta-desa');

-- Policy untuk upload storage (hanya admin)
CREATE POLICY "Allow admin upload peta-desa" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'peta-desa' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy untuk delete storage (hanya admin)
CREATE POLICY "Allow admin delete peta-desa" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'peta-desa' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 10. Buat function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Buat trigger untuk auto-update timestamp
DROP TRIGGER IF EXISTS update_peta_desa_updated_at ON peta_desa;
CREATE TRIGGER update_peta_desa_updated_at
    BEFORE UPDATE ON peta_desa
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Index untuk performance
CREATE INDEX IF NOT EXISTS idx_peta_desa_created_at ON peta_desa(created_at DESC);

-- 13. Verifikasi struktur tabel
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'peta_desa' 
ORDER BY ordinal_position;

-- 14. Test insert (opsional - uncomment untuk test)
/*
INSERT INTO peta_desa (judul, deskripsi, koordinat_lat, koordinat_lng, zoom_level) 
VALUES (
  'Peta Wilayah Desa Bukit Pamewa',
  'Peta administratif dan geografis Desa Bukit Pamewa menunjukkan batas wilayah, fasilitas umum, dan landmark penting.',
  -6.2088,  -- Koordinat contoh (sesuaikan dengan lokasi desa)
  106.8456, -- Koordinat contoh (sesuaikan dengan lokasi desa)
  14
) ON CONFLICT DO NOTHING;
*/
