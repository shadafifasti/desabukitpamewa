-- =====================================================
-- FIX USER_ROLES INFINITE RECURSION
-- =====================================================
-- Run this FIRST to fix the infinite recursion issue

-- Disable RLS temporarily to fix the policies
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on user_roles
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON public.user_roles;

-- Create simple policies without recursion
CREATE POLICY "Users can read own role" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Allow authenticated users to insert their own role (for signup)
CREATE POLICY "Users can insert own role" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own role (this will be restricted by app logic)
CREATE POLICY "Users can update own role" ON public.user_roles
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Re-enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE FIRST ADMIN USER MANUALLY
-- =====================================================
-- Replace 'your-email@example.com' with your actual email

-- First, let's see current users (this will help identify your user ID)
-- SELECT id, email FROM auth.users;

-- Insert admin role for first user (replace the email)
-- INSERT INTO public.user_roles (user_id, role) 
-- SELECT id, 'admin' 
-- FROM auth.users 
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

COMMIT;
