-- Enable storage policies for galeridesa bucket
CREATE POLICY "Allow public uploads to galeridesa bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'galeridesa');

CREATE POLICY "Allow public reads from galeridesa bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'galeridesa');

CREATE POLICY "Allow public updates to galeridesa bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'galeridesa');

CREATE POLICY "Allow public deletes from galeridesa bucket" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'galeridesa');

-- Allow public insert for aparatur_desa table (for admin form)
CREATE POLICY "Allow public insert to aparatur_desa" 
ON public.aparatur_desa 
FOR INSERT 
WITH CHECK (true);

-- Allow public update for aparatur_desa table (for admin form)
CREATE POLICY "Allow public update to aparatur_desa" 
ON public.aparatur_desa 
FOR UPDATE 
USING (true);

-- Allow public delete for aparatur_desa table (for admin form)
CREATE POLICY "Allow public delete to aparatur_desa" 
ON public.aparatur_desa 
FOR DELETE 
USING (true);