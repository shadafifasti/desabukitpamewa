-- =====================================================
-- STORAGE POLICIES SETUP FOR VILLAGE WEBSITE
-- =====================================================
-- Run this script in Supabase SQL Editor after creating the storage bucket

-- Create storage bucket if not exists (run this in Supabase Dashboard -> Storage)
-- Bucket name: galeridesa
-- Public: true
-- File size limit: 50MB
-- Allowed MIME types: image/*

-- =====================================================
-- STORAGE POLICIES FOR GALERIDESA BUCKET
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete images" ON storage.objects;

-- Policy for public read access to images
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'galeridesa');

-- Policy for admin to upload images
CREATE POLICY "Admin can upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'galeridesa' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy for admin to update images
CREATE POLICY "Admin can update images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'galeridesa' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'galeridesa' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy for admin to delete images
CREATE POLICY "Admin can delete images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'galeridesa' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- ENABLE RLS ON STORAGE
-- =====================================================
-- Make sure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. First create the storage bucket 'galeridesa' in Supabase Dashboard
-- 2. Set bucket to public
-- 3. Run this SQL script in Supabase SQL Editor
-- 4. Test upload functionality in the application
