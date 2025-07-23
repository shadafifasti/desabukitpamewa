-- Setup untuk fitur Produk Hukum
-- Jalankan script ini di Supabase SQL Editor

-- 1. Buat enum untuk kategori produk hukum
CREATE TYPE produk_hukum_kategori AS ENUM ('perdes', 'perkades', 'surat_keputusan');

-- 2. Buat tabel produk_hukum
CREATE TABLE produk_hukum (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    kategori produk_hukum_kategori NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    tanggal_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Buat indexes untuk performance
CREATE INDEX idx_produk_hukum_kategori ON produk_hukum(kategori);
CREATE INDEX idx_produk_hukum_tanggal ON produk_hukum(tanggal_upload DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE produk_hukum ENABLE ROW LEVEL SECURITY;

-- 5. Buat RLS policies
-- Policy untuk SELECT (public dapat membaca)
CREATE POLICY "Public can view produk hukum" ON produk_hukum
    FOR SELECT USING (true);

-- Policy untuk INSERT (hanya admin)
CREATE POLICY "Admin can insert produk hukum" ON produk_hukum
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy untuk UPDATE (hanya admin)
CREATE POLICY "Admin can update produk hukum" ON produk_hukum
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy untuk DELETE (hanya admin)
CREATE POLICY "Admin can delete produk hukum" ON produk_hukum
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 6. Buat storage bucket untuk file PDF
INSERT INTO storage.buckets (id, name, public) 
VALUES ('produk-hukum', 'produk-hukum', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Buat storage policies
-- Policy untuk SELECT (public dapat download)
CREATE POLICY "Public can view produk hukum files" ON storage.objects
    FOR SELECT USING (bucket_id = 'produk-hukum');

-- Policy untuk INSERT (hanya admin dapat upload)
CREATE POLICY "Admin can upload produk hukum files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'produk-hukum' AND
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy untuk DELETE (hanya admin dapat hapus file)
CREATE POLICY "Admin can delete produk hukum files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'produk-hukum' AND
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 8. Buat trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_produk_hukum_updated_at 
    BEFORE UPDATE ON produk_hukum 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Script selesai
-- Sekarang fitur Produk Hukum siap digunakan!
