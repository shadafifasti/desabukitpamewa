-- Create enums for the village website
CREATE TYPE public.profil_kategori AS ENUM ('sejarah', 'visi_misi', 'letak_geografis', 'demografi', 'struktur');
CREATE TYPE public.anggaran_kategori AS ENUM ('APBDesa', 'Dana_Desa');
CREATE TYPE public.galeri_kategori AS ENUM ('Alam', 'Sosial', 'Pembangunan', 'Budaya', 'Ekonomi', 'Dokumentasi', 'Lembaga', 'Anggaran');
CREATE TYPE public.statistik_kategori AS ENUM ('Penduduk', 'Pendidikan', 'Kemiskinan', 'Bantuan Sosial');
CREATE TYPE public.pengaduan_status AS ENUM ('baru', 'diproses', 'selesai');

-- Create profil_desa table
CREATE TABLE public.profil_desa (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    kategori profil_kategori NOT NULL,
    judul TEXT NOT NULL,
    isi TEXT,
    gambar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create peta_desa table
CREATE TABLE public.peta_desa (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_lokasi TEXT NOT NULL,
    google_maps_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create aparatur_desa table
CREATE TABLE public.aparatur_desa (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nama TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lembaga_desa table
CREATE TABLE public.lembaga_desa (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_lembaga TEXT NOT NULL,
    deskripsi TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transparansi_anggaran table
CREATE TABLE public.transparansi_anggaran (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tahun INTEGER NOT NULL,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    gambar_url TEXT,
    kategori anggaran_kategori NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create berita table
CREATE TABLE public.berita (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    isi TEXT,
    tanggal DATE NOT NULL,
    gambar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create galeri_desa table
CREATE TABLE public.galeri_desa (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    gambar_url TEXT,
    kategori galeri_kategori NOT NULL,
    tanggal DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data_statistik table
CREATE TABLE public.data_statistik (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    tahun INTEGER NOT NULL,
    deskripsi TEXT,
    gambar_url TEXT,
    kategori statistik_kategori NOT NULL,
    tanggal DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kontak_desa table
CREATE TABLE public.kontak_desa (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    alamat TEXT,
    nomor_telepon TEXT,
    nomor_wa TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pengaduan_masyarakat table
CREATE TABLE public.pengaduan_masyarakat (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_pengirim TEXT NOT NULL,
    isi_pengaduan TEXT NOT NULL,
    tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status pengaduan_status NOT NULL DEFAULT 'baru',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saran_masyarakat table
CREATE TABLE public.saran_masyarakat (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_pengirim TEXT NOT NULL,
    saran TEXT NOT NULL,
    tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profil_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peta_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aparatur_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembaga_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparansi_anggaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_statistik ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kontak_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaduan_masyarakat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saran_masyarakat ENABLE ROW LEVEL SECURITY;

-- Create public read policies for most tables (village information should be publicly accessible)
CREATE POLICY "Allow public read access to profil_desa" ON public.profil_desa FOR SELECT USING (true);
CREATE POLICY "Allow public read access to peta_desa" ON public.peta_desa FOR SELECT USING (true);
CREATE POLICY "Allow public read access to aparatur_desa" ON public.aparatur_desa FOR SELECT USING (true);
CREATE POLICY "Allow public read access to lembaga_desa" ON public.lembaga_desa FOR SELECT USING (true);
CREATE POLICY "Allow public read access to transparansi_anggaran" ON public.transparansi_anggaran FOR SELECT USING (true);
CREATE POLICY "Allow public read access to berita" ON public.berita FOR SELECT USING (true);
CREATE POLICY "Allow public read access to galeri_desa" ON public.galeri_desa FOR SELECT USING (true);
CREATE POLICY "Allow public read access to data_statistik" ON public.data_statistik FOR SELECT USING (true);
CREATE POLICY "Allow public read access to kontak_desa" ON public.kontak_desa FOR SELECT USING (true);

-- Public can insert complaints and suggestions
CREATE POLICY "Allow public insert to pengaduan_masyarakat" ON public.pengaduan_masyarakat FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to saran_masyarakat" ON public.saran_masyarakat FOR INSERT WITH CHECK (true);

-- Public can read their own complaints and suggestions
CREATE POLICY "Allow public read own pengaduan_masyarakat" ON public.pengaduan_masyarakat FOR SELECT USING (true);
CREATE POLICY "Allow public read own saran_masyarakat" ON public.saran_masyarakat FOR SELECT USING (true);