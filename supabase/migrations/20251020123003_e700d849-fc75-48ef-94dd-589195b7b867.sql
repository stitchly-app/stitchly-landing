-- Create storage policy to allow anonymous uploads to visitor folders
CREATE POLICY "Allow anonymous uploads to visitor folders"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'videos' AND (storage.foldername(name))[1] LIKE 'visitor_%'
);