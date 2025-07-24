-- Script Perbaikan Cepat untuk Tabel Peta Desa
-- Jalankan script ini di Supabase SQL Editor

-- 1. Cek struktur tabel yang ada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'peta_desa' 
ORDER BY ordinal_position;

-- 2. Jika tabel sudah ada tapi struktur berbeda, drop dan buat ulang
-- HATI-HATI: Ini akan menghapus data yang ada!
DROP TABLE IF EXISTS peta_desa CASCADE;

-- 3. Buat tabel baru dengan struktur yang benar
CREATE TABLE peta_desa (
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

-- 4. Enable RLS
ALTER TABLE peta_desa ENABLE ROW LEVEL SECURITY;

-- 5. Buat policies
CREATE POLICY "Allow public read access" ON peta_desa
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert" ON peta_desa
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin update" ON peta_desa
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin delete" ON peta_desa
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 6. Buat storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('peta-desa', 'peta-desa', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage policies
CREATE POLICY "Allow public read peta-desa" ON storage.objects
    FOR SELECT USING (bucket_id = 'peta-desa');

CREATE POLICY "Allow admin upload peta-desa" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'peta-desa' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin delete peta-desa" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'peta-desa' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 8. Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Trigger untuk auto-update timestamp
CREATE TRIGGER update_peta_desa_updated_at
    BEFORE UPDATE ON peta_desa
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Index untuk performance
CREATE INDEX idx_peta_desa_created_at ON peta_desa(created_at DESC);

-- 11. Verifikasi hasil
SELECT 'Tabel peta_desa berhasil dibuat!' as status;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'peta_desa';
