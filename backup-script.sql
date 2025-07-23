-- SCRIPT BACKUP DATABASE DESA BUKIT PAMEWA
-- Jalankan script ini secara berkala untuk backup data

-- 1. BACKUP BERITA
SELECT 
    'BACKUP BERITA - ' || CURRENT_DATE as backup_info,
    COUNT(*) as total_berita
FROM berita;

-- Export semua berita
SELECT 
    id,
    judul,
    isi,
    tanggal,
    gambar_url,
    created_at
FROM berita 
ORDER BY tanggal DESC;

-- 2. BACKUP GALERI
SELECT 
    'BACKUP GALERI - ' || CURRENT_DATE as backup_info,
    COUNT(*) as total_foto
FROM galeri_desa;

-- Export semua galeri
SELECT 
    id,
    judul,
    deskripsi,
    kategori,
    tanggal,
    gambar_url,
    created_at
FROM galeri_desa 
ORDER BY tanggal DESC;

-- 3. BACKUP APARATUR
SELECT 
    'BACKUP APARATUR - ' || CURRENT_DATE as backup_info,
    COUNT(*) as total_aparatur
FROM aparatur_desa;

-- Export data aparatur
SELECT 
    id,
    nama,
    jabatan,
    foto_url,
    created_at
FROM aparatur_desa 
ORDER BY nama;

-- 4. BACKUP DATA STATISTIK
SELECT 
    'BACKUP STATISTIK - ' || CURRENT_DATE as backup_info,
    COUNT(*) as total_data
FROM data_statistik;

-- Export data statistik
SELECT 
    id,
    judul,
    kategori,
    tahun,
    deskripsi,
    gambar_url,
    tanggal,
    created_at
FROM data_statistik 
ORDER BY tahun DESC, tanggal DESC;

-- 5. BACKUP ANGGARAN
SELECT 
    'BACKUP ANGGARAN - ' || CURRENT_DATE as backup_info,
    COUNT(*) as total_anggaran
FROM anggaran_desa;

-- Export data anggaran
SELECT 
    id,
    judul,
    kategori,
    tahun,
    jumlah,
    deskripsi,
    gambar_url,
    created_at
FROM anggaran_desa 
ORDER BY tahun DESC;

-- 6. BACKUP USER ROLES
SELECT 
    'BACKUP USER ROLES - ' || CURRENT_DATE as backup_info,
    COUNT(*) as total_users
FROM user_roles;

-- Export user roles (tanpa data sensitif)
SELECT 
    user_id,
    role,
    created_at
FROM user_roles;

-- 7. BACKUP PENGADUAN (Data sensitif - hati-hati)
SELECT 
    'BACKUP PENGADUAN - ' || CURRENT_DATE as backup_info,
    COUNT(*) as total_pengaduan
FROM pengaduan;

-- 8. BACKUP PROFIL DESA
SELECT 
    'BACKUP PROFIL DESA - ' || CURRENT_DATE as backup_info,
    COUNT(*) as total_profil
FROM profil_desa;

-- Export profil desa
SELECT 
    id,
    kategori,
    judul,
    konten,
    gambar_url,
    created_at
FROM profil_desa 
ORDER BY kategori;

-- CARA MENGGUNAKAN:
-- 1. Login ke Supabase Dashboard
-- 2. Pilih project desa
-- 3. Masuk ke SQL Editor
-- 4. Copy-paste script ini
-- 5. Jalankan dan export hasilnya
-- 6. Simpan file backup dengan nama: backup_YYYY-MM-DD.sql
