-- =====================================================
-- RLS POLICIES SETUP FOR VILLAGE WEBSITE (FIXED)
-- =====================================================
-- Run this script in Supabase SQL Editor
-- Make sure to enable RLS on all tables first

-- Enable RLS on all tables
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparansi_anggaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembaga_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_statistik ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BERITA TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read berita" ON public.berita;
DROP POLICY IF EXISTS "Admin can insert berita" ON public.berita;
DROP POLICY IF EXISTS "Admin can update berita" ON public.berita;
DROP POLICY IF EXISTS "Admin can delete berita" ON public.berita;

-- Create new policies
CREATE POLICY "Public can read berita" ON public.berita
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admin can insert berita" ON public.berita
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can update berita" ON public.berita
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can delete berita" ON public.berita
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- TRANSPARANSI_ANGGARAN TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can read anggaran" ON public.transparansi_anggaran;
DROP POLICY IF EXISTS "Admin can insert anggaran" ON public.transparansi_anggaran;
DROP POLICY IF EXISTS "Admin can update anggaran" ON public.transparansi_anggaran;
DROP POLICY IF EXISTS "Admin can delete anggaran" ON public.transparansi_anggaran;

CREATE POLICY "Public can read anggaran" ON public.transparansi_anggaran
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admin can insert anggaran" ON public.transparansi_anggaran
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can update anggaran" ON public.transparansi_anggaran
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can delete anggaran" ON public.transparansi_anggaran
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- LEMBAGA_DESA TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can read lembaga" ON public.lembaga_desa;
DROP POLICY IF EXISTS "Admin can insert lembaga" ON public.lembaga_desa;
DROP POLICY IF EXISTS "Admin can update lembaga" ON public.lembaga_desa;
DROP POLICY IF EXISTS "Admin can delete lembaga" ON public.lembaga_desa;

CREATE POLICY "Public can read lembaga" ON public.lembaga_desa
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admin can insert lembaga" ON public.lembaga_desa
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can update lembaga" ON public.lembaga_desa
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can delete lembaga" ON public.lembaga_desa
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- DATA_STATISTIK TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can read statistik" ON public.data_statistik;
DROP POLICY IF EXISTS "Admin can insert statistik" ON public.data_statistik;
DROP POLICY IF EXISTS "Admin can update statistik" ON public.data_statistik;
DROP POLICY IF EXISTS "Admin can delete statistik" ON public.data_statistik;

CREATE POLICY "Public can read statistik" ON public.data_statistik
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admin can insert statistik" ON public.data_statistik
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can update statistik" ON public.data_statistik
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can delete statistik" ON public.data_statistik
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- GALERI_DESA TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can read galeri" ON public.galeri_desa;
DROP POLICY IF EXISTS "Admin can insert galeri" ON public.galeri_desa;
DROP POLICY IF EXISTS "Admin can update galeri" ON public.galeri_desa;
DROP POLICY IF EXISTS "Admin can delete galeri" ON public.galeri_desa;

CREATE POLICY "Public can read galeri" ON public.galeri_desa
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admin can insert galeri" ON public.galeri_desa
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can update galeri" ON public.galeri_desa
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can delete galeri" ON public.galeri_desa
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- USER_ROLES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON public.user_roles;

CREATE POLICY "Users can read own role" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Enable RLS on storage buckets
UPDATE storage.buckets SET public = false WHERE id = 'galeridesa';

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admin can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete files" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public can view files" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'galeridesa');

CREATE POLICY "Admin can upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'galeridesa' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can delete files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'galeridesa' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

COMMIT;
