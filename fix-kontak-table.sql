-- Script untuk memperbaiki tabel kontak_desa
-- Jalankan di Supabase SQL Editor

-- Tambah kolom aktif jika belum ada
ALTER TABLE kontak_desa ADD COLUMN IF NOT EXISTS aktif BOOLEAN DEFAULT true;

-- Tambah kolom jenis_kontak jika belum ada  
ALTER TABLE kontak_desa ADD COLUMN IF NOT EXISTS jenis_kontak VARCHAR(50) DEFAULT 'telepon';

-- Tambah kolom label jika belum ada
ALTER TABLE kontak_desa ADD COLUMN IF NOT EXISTS label VARCHAR(100) DEFAULT 'Kontak Desa';

-- Tambah kolom urutan jika belum ada
ALTER TABLE kontak_desa ADD COLUMN IF NOT EXISTS urutan INTEGER DEFAULT 0;

-- Tambah kolom updated_at jika belum ada
ALTER TABLE kontak_desa ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_kontak_desa_jenis ON kontak_desa(jenis_kontak);
CREATE INDEX IF NOT EXISTS idx_kontak_desa_aktif ON kontak_desa(aktif);
CREATE INDEX IF NOT EXISTS idx_kontak_desa_urutan ON kontak_desa(urutan);

-- Enable RLS (Row Level Security) jika belum aktif
ALTER TABLE kontak_desa ENABLE ROW LEVEL SECURITY;

-- Policy untuk read (semua orang bisa baca)
DROP POLICY IF EXISTS "Allow public read access to kontak_desa" ON kontak_desa;
CREATE POLICY "Allow public read access to kontak_desa" 
ON kontak_desa FOR SELECT 
USING (true);

-- Policy untuk insert (semua orang bisa insert)
DROP POLICY IF EXISTS "Allow public insert to kontak_desa" ON kontak_desa;
CREATE POLICY "Allow public insert to kontak_desa" 
ON kontak_desa FOR INSERT 
WITH CHECK (true);

-- Policy untuk update (semua orang bisa update)
DROP POLICY IF EXISTS "Allow public update to kontak_desa" ON kontak_desa;
CREATE POLICY "Allow public update to kontak_desa" 
ON kontak_desa FOR UPDATE 
USING (true);

-- Policy untuk delete (semua orang bisa delete)
DROP POLICY IF EXISTS "Allow public delete from kontak_desa" ON kontak_desa;
CREATE POLICY "Allow public delete from kontak_desa" 
ON kontak_desa FOR DELETE 
USING (true);

-- Update data yang sudah ada untuk memiliki nilai default
UPDATE kontak_desa SET 
  aktif = true,
  jenis_kontak = CASE 
    WHEN telepon IS NOT NULL AND telepon != '' THEN 'telepon'
    WHEN whatsapp IS NOT NULL AND whatsapp != '' THEN 'whatsapp'  
    WHEN email IS NOT NULL AND email != '' THEN 'email'
    WHEN alamat IS NOT NULL AND alamat != '' THEN 'alamat'
    ELSE 'telepon'
  END,
  label = COALESCE(label, 'Kontak Desa'),
  urutan = COALESCE(urutan, 0)
WHERE aktif IS NULL OR jenis_kontak IS NULL OR label IS NULL OR urutan IS NULL;
