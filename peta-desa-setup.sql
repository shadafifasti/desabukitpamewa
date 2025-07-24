-- Setup untuk fitur Peta Desa
-- Jalankan script ini di Supabase SQL Editor

-- 1. Buat tabel peta_desa
CREATE TABLE IF NOT EXISTS peta_desa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  gambar_url TEXT,
  gambar_filename VARCHAR(255),
  koordinat_lat DECIMAL(10, 8),
  koordinat_lng DECIMAL(11, 8),
  zoom_level INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE peta_desa ENABLE ROW LEVEL SECURITY;

-- 3. Policies untuk peta_desa
-- Public dapat melihat
CREATE POLICY "Semua orang dapat melihat peta desa" ON peta_desa
  FOR SELECT USING (true);

-- Hanya admin yang dapat insert/update/delete
CREATE POLICY "Hanya admin dapat mengelola peta desa" ON peta_desa
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 4. Storage bucket untuk peta (jika belum ada)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('peta-desa', 'peta-desa', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies untuk bucket peta-desa
-- Public dapat melihat
CREATE POLICY "Semua orang dapat melihat gambar peta" ON storage.objects
  FOR SELECT USING (bucket_id = 'peta-desa');

-- Hanya admin yang dapat upload
CREATE POLICY "Hanya admin dapat upload gambar peta" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'peta-desa' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Hanya admin yang dapat delete
CREATE POLICY "Hanya admin dapat hapus gambar peta" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'peta-desa' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 6. Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Trigger untuk auto-update timestamp
CREATE TRIGGER update_peta_desa_updated_at 
    BEFORE UPDATE ON peta_desa 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Index untuk performance
CREATE INDEX IF NOT EXISTS idx_peta_desa_created_at ON peta_desa(created_at DESC);

-- 9. Insert data contoh (opsional)
INSERT INTO peta_desa (judul, deskripsi, koordinat_lat, koordinat_lng, zoom_level) 
VALUES (
  'Peta Wilayah Desa Bukit Pamewa',
  'Peta administratif dan geografis Desa Bukit Pamewa menunjukkan batas wilayah, fasilitas umum, dan landmark penting.',
  -6.2088,  -- Koordinat contoh (sesuaikan dengan lokasi desa)
  106.8456, -- Koordinat contoh (sesuaikan dengan lokasi desa)
  14
) ON CONFLICT DO NOTHING;
