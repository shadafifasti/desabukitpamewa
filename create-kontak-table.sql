-- SQL untuk update tabel kontak_desa yang sudah ada
-- Jalankan di Supabase SQL Editor

-- Update tabel kontak_desa dengan kolom tambahan untuk fleksibilitas
-- Tabel kontak_desa sudah ada, kita hanya perlu menambah kolom jika belum ada

-- Tambah kolom jenis_kontak jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='kontak_desa' AND column_name='jenis_kontak') THEN
        ALTER TABLE kontak_desa ADD COLUMN jenis_kontak VARCHAR(50) DEFAULT 'telepon';
    END IF;
END $$;

-- Tambah kolom label jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='kontak_desa' AND column_name='label') THEN
        ALTER TABLE kontak_desa ADD COLUMN label VARCHAR(100) DEFAULT 'Kontak Desa';
    END IF;
END $$;

-- Tambah kolom urutan jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='kontak_desa' AND column_name='urutan') THEN
        ALTER TABLE kontak_desa ADD COLUMN urutan INTEGER DEFAULT 0;
    END IF;
END $$;

-- Tambah kolom aktif jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='kontak_desa' AND column_name='aktif') THEN
        ALTER TABLE kontak_desa ADD COLUMN aktif BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Tambah kolom updated_at jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='kontak_desa' AND column_name='updated_at') THEN
        ALTER TABLE kontak_desa ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
END $$;

-- Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_kontak_desa_jenis ON kontak_desa(jenis_kontak);
CREATE INDEX IF NOT EXISTS idx_kontak_desa_aktif ON kontak_desa(aktif);
CREATE INDEX IF NOT EXISTS idx_kontak_desa_urutan ON kontak_desa(urutan);

-- Enable RLS (Row Level Security)
ALTER TABLE kontak_desa ENABLE ROW LEVEL SECURITY;

-- Policy untuk read (semua orang bisa baca)
CREATE POLICY "Allow public read access on kontak_desa" ON kontak_desa
  FOR SELECT USING (aktif = true);

-- Policy untuk admin (insert, update, delete)
CREATE POLICY "Allow admin full access on kontak_desa" ON kontak_desa
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Update data yang sudah ada dengan informasi tambahan
UPDATE kontak_desa SET 
    jenis_kontak = 'telepon',
    label = 'Kantor Desa',
    urutan = 1,
    aktif = true
WHERE nomor_telepon IS NOT NULL AND jenis_kontak IS NULL;

UPDATE kontak_desa SET 
    jenis_kontak = 'whatsapp',
    label = 'WhatsApp Desa',
    urutan = 2,
    aktif = true
WHERE nomor_wa IS NOT NULL AND jenis_kontak IS NULL;

UPDATE kontak_desa SET 
    jenis_kontak = 'email',
    label = 'Email Resmi',
    urutan = 3,
    aktif = true
WHERE email IS NOT NULL AND jenis_kontak IS NULL;

UPDATE kontak_desa SET 
    jenis_kontak = 'alamat',
    label = 'Alamat Kantor',
    urutan = 4,
    aktif = true
WHERE alamat IS NOT NULL AND jenis_kontak IS NULL;

-- Insert data default jika tabel kosong
INSERT INTO kontak_desa (nomor_telepon, nomor_wa, email, alamat, jenis_kontak, label, urutan, aktif)
SELECT 
    '0271-123456',
    '081234567890', 
    'desa.bukitpamewa@gmail.com',
    'Jl. Raya Bukit Pamewa No. 1, Kec. Pamewa, Kab. Sumba Barat Daya',
    'kantor',
    'Kontak Kantor Desa',
    1,
    true
WHERE NOT EXISTS (SELECT 1 FROM kontak_desa);

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kontak_desa_updated_at 
    BEFORE UPDATE ON kontak_desa 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
