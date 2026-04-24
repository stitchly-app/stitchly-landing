-- Create demo-thumbnails storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('demo-thumbnails', 'demo-thumbnails', true);

-- Allow public read access to demo thumbnails
CREATE POLICY "Demo thumbnails are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'demo-thumbnails');

-- Allow admins to upload demo thumbnails
CREATE POLICY "Admins can upload demo thumbnails"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'demo-thumbnails' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update demo thumbnails
CREATE POLICY "Admins can update demo thumbnails"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'demo-thumbnails' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete demo thumbnails
CREATE POLICY "Admins can delete demo thumbnails"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'demo-thumbnails' 
  AND has_role(auth.uid(), 'admin'::app_role)
);