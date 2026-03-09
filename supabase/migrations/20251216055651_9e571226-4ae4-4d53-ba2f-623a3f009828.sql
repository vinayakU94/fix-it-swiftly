-- Create storage bucket for repair images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('repair-images', 'repair-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload repair images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'repair-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own images
CREATE POLICY "Users can view own repair images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'repair-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to repair images (for admins and display)
CREATE POLICY "Public can view repair images"
ON storage.objects FOR SELECT
USING (bucket_id = 'repair-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own repair images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'repair-images' AND auth.uid()::text = (storage.foldername(name))[1]);