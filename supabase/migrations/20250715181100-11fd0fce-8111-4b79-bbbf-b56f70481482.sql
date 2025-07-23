-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for existing tables to require authentication
-- Update berita table policies
DROP POLICY IF EXISTS "Allow public read access to berita" ON public.berita;
CREATE POLICY "Allow public read access to berita" ON public.berita FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert berita" ON public.berita FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update berita" ON public.berita FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete berita" ON public.berita FOR DELETE USING (auth.uid() IS NOT NULL);

-- Update galeri_desa table policies
DROP POLICY IF EXISTS "Allow public read access to galeri_desa" ON public.galeri_desa;
CREATE POLICY "Allow public read access to galeri_desa" ON public.galeri_desa FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert galeri_desa" ON public.galeri_desa FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update galeri_desa" ON public.galeri_desa FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete galeri_desa" ON public.galeri_desa FOR DELETE USING (auth.uid() IS NOT NULL);

-- Update lembaga_desa table policies
DROP POLICY IF EXISTS "Allow public read access to lembaga_desa" ON public.lembaga_desa;
CREATE POLICY "Allow public read access to lembaga_desa" ON public.lembaga_desa FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert lembaga_desa" ON public.lembaga_desa FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update lembaga_desa" ON public.lembaga_desa FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete lembaga_desa" ON public.lembaga_desa FOR DELETE USING (auth.uid() IS NOT NULL);

-- Update profil_desa table policies
DROP POLICY IF EXISTS "Allow public read access to profil_desa" ON public.profil_desa;
CREATE POLICY "Allow public read access to profil_desa" ON public.profil_desa FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert profil_desa" ON public.profil_desa FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update profil_desa" ON public.profil_desa FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete profil_desa" ON public.profil_desa FOR DELETE USING (auth.uid() IS NOT NULL);

-- Update data_statistik table policies
DROP POLICY IF EXISTS "Allow public read access to data_statistik" ON public.data_statistik;
CREATE POLICY "Allow public read access to data_statistik" ON public.data_statistik FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert data_statistik" ON public.data_statistik FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update data_statistik" ON public.data_statistik FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete data_statistik" ON public.data_statistik FOR DELETE USING (auth.uid() IS NOT NULL);

-- Update transparansi_anggaran table policies
DROP POLICY IF EXISTS "Allow public read access to transparansi_anggaran" ON public.transparansi_anggaran;
CREATE POLICY "Allow public read access to transparansi_anggaran" ON public.transparansi_anggaran FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert transparansi_anggaran" ON public.transparansi_anggaran FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update transparansi_anggaran" ON public.transparansi_anggaran FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete transparansi_anggaran" ON public.transparansi_anggaran FOR DELETE USING (auth.uid() IS NOT NULL);